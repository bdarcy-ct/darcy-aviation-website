import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Database from 'better-sqlite3';
import liveDb, { backupsDir, dataDir, dbPath, pendingRestorePath } from '../../database';
import { authenticateAdmin } from '../../middleware/auth';
import { uploadsDir, onRailway, volumeMountPath, storageIsEphemeral } from '../../paths';

const router = express.Router();

router.use(authenticateAdmin);

const upload = multer({ dest: '/tmp', limits: { fileSize: 400 * 1024 * 1024 } }); // backups now carry photos

// Backups embed every uploaded photo in this table so one .db file restores the
// whole CMS — text AND images. Restore extracts the files and drops the table.
const FILES_TABLE = '_cms_files';
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

function embedUploads(backupPath: string): number {
  if (!fs.existsSync(uploadsDir)) return 0;
  const names = fs.readdirSync(uploadsDir).filter((name) => SAFE_NAME.test(name) && fs.statSync(path.join(uploadsDir, name)).isFile());
  const bdb = new Database(backupPath);
  try {
    bdb.exec(`CREATE TABLE IF NOT EXISTS ${FILES_TABLE} (name TEXT PRIMARY KEY, data BLOB NOT NULL)`);
    const insert = bdb.prepare(`INSERT OR REPLACE INTO ${FILES_TABLE} (name, data) VALUES (?, ?)`);
    bdb.transaction(() => { for (const name of names) insert.run(name, fs.readFileSync(path.join(uploadsDir, name))); })();
  } finally {
    bdb.close();
  }
  return names.length;
}

// Writes embedded photos back to the uploads folder (never overwriting an existing
// file) and strips the photo table so the restored database stays small.
function extractUploads(dbFile: string): number {
  const rdb = new Database(dbFile);
  let restored = 0;
  try {
    const hasTable = rdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(FILES_TABLE);
    if (!hasTable) return 0;
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    for (const row of rdb.prepare(`SELECT name, data FROM ${FILES_TABLE}`).iterate() as Iterable<{ name: string; data: Buffer }>) {
      if (!SAFE_NAME.test(row.name)) continue;
      const dest = path.join(uploadsDir, row.name);
      if (!fs.existsSync(dest)) { fs.writeFileSync(dest, row.data); restored++; }
    }
    rdb.exec(`DROP TABLE ${FILES_TABLE}`);
    rdb.exec('VACUUM');
  } finally {
    rdb.close();
  }
  return restored;
}

// Download database backup
router.get('/download', async (req, res) => {
  try {
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Use SQLite's backup API instead of copying darcy.db directly.
    // In WAL mode, recent writes may live in darcy.db-wal and raw copies can be stale or empty.
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupsDir, `darcy-backup-${timestamp}.db`);
    await liveDb.backup(backupPath);
    const includePhotos = req.query.photos !== '0';
    const photoCount = includePhotos ? embedUploads(backupPath) : 0;
    res.setHeader('X-Backup-Photos', String(photoCount));

    // Send the backup file
    res.download(backupPath, `darcy-backup-${timestamp}.db`, (err) => {
      // Clean up the temp backup after download
      try { fs.unlinkSync(backupPath); } catch {}
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Failed to download backup' });
      }
    });
  } catch (error: any) {
    console.error('Backup error:', error?.message || error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Get backup info
router.get('/info', (_req, res) => {
  try {
    if (!fs.existsSync(dbPath)) {
      return res.json({ exists: false });
    }

    const stats = fs.statSync(dbPath);
    const walPath = `${dbPath}-wal`;
    const shmPath = `${dbPath}-shm`;
    const walStats = fs.existsSync(walPath) ? fs.statSync(walPath) : null;
    const shmStats = fs.existsSync(shmPath) ? fs.statSync(shmPath) : null;
    const automaticBackups = fs.existsSync(backupsDir)
      ? fs.readdirSync(backupsDir)
        .filter((name) => /^auto-.*\.db$/.test(name))
        .map((name) => {
          const stats = fs.statSync(path.join(backupsDir, name));
          return { name, size: stats.size, createdAt: stats.mtime.toISOString() };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : [];

    res.json({
      exists: true,
      size: stats.size,
      sizeHuman: `${(stats.size / 1024).toFixed(1)} KB`,
      lastModified: stats.mtime.toISOString(),
      path: volumeMountPath ? `Railway Volume (${volumeMountPath})` : (onRailway ? 'Temporary container disk (no volume)' : 'Local (./data)'),
      persistent: !storageIsEphemeral,
      storageWarning: storageIsEphemeral
        ? 'This site has no permanent Railway volume, so CMS changes and uploaded photos are erased every time the site is deployed. Add a volume to this service in Railway, then restore your latest backup.'
        : null,
      wal: walStats ? {
        exists: true,
        size: walStats.size,
        sizeHuman: `${(walStats.size / 1024).toFixed(1)} KB`,
        lastModified: walStats.mtime.toISOString(),
      } : { exists: false },
      shm: shmStats ? {
        exists: true,
        size: shmStats.size,
        sizeHuman: `${(shmStats.size / 1024).toFixed(1)} KB`,
        lastModified: shmStats.mtime.toISOString(),
      } : { exists: false },
      automaticBackups: {
        count: automaticBackups.length,
        latest: automaticBackups[0] || null,
        retention: 14,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get backup info' });
  }
});

// Restore database from uploaded backup
router.post('/restore', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup file uploaded' });
    }

    const uploadedPath = req.file.path;

    // Validate that the uploaded file is a valid SQLite database
    try {
      const testDb = new Database(uploadedPath, { readonly: true });
      // Check it has at least some expected tables
      const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
      const tableNames = tables.map((t) => t.name);
      const requiredTables = ['fleet', 'testimonials', 'admin_users', 'site_content'];
      const missing = requiredTables.filter((t) => !tableNames.includes(t));
      testDb.close();

      if (missing.length > 0) {
        fs.unlinkSync(uploadedPath);
        return res.status(400).json({
          error: `Invalid backup: missing tables: ${missing.join(', ')}`,
        });
      }
    } catch (validationError: any) {
      try { fs.unlinkSync(uploadedPath); } catch {}
      return res.status(400).json({
        error: 'Invalid file: not a valid SQLite database',
      });
    }

    // Find the current database
    // Create a safety backup of the current database before overwriting
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safetyBackupPath = path.join(backupsDir, `pre-restore-${timestamp}.db`);

    if (fs.existsSync(dbPath)) {
      await liveDb.backup(safetyBackupPath);
    }

    // Put embedded photos back first, then stage the (now photo-free) database.
    const restoredPhotos = extractUploads(uploadedPath);

    // Stage the validated database on the same volume. The next process installs
    // it before opening SQLite, avoiding an unsafe live-file replacement.
    const stagingPath = path.join(dataDir, `pending-restore-${timestamp}.tmp`);
    fs.copyFileSync(uploadedPath, stagingPath);
    fs.renameSync(stagingPath, pendingRestorePath);
    fs.unlinkSync(uploadedPath);

    // The server needs to restart to install the staged database.
    // Send success response first, then exit so Railway/process manager restarts
    res.json({
      success: true,
      message: 'Backup validated and staged. Server will restart to apply it safely.',
      safetyBackup: `pre-restore-${timestamp}.db`,
      restoredPhotos,
    });

    // Give the response time to send, then restart. Exit NON-zero: Railway's default
    // ON_FAILURE policy only restarts crashed processes, so exit(0) left the site down.
    setTimeout(() => {
      console.log('🔄 Restarting server after backup restore...');
      process.exit(1);
    }, 1000);
  } catch (error: any) {
    console.error('Restore error:', error?.message || error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

export default router;
