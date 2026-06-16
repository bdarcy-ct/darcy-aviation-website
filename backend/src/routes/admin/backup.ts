import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Database from 'better-sqlite3';
import liveDb from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

router.use(authenticateAdmin);

const upload = multer({ dest: '/tmp', limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

function getDataDir(): string {
  return fs.existsSync('/data') ? '/data' : path.join(__dirname, '../../../../data');
}

function getDbPath(): string {
  return path.join(getDataDir(), 'darcy.db');
}

function unlinkSqliteSidecars(dbPath: string): void {
  for (const suffix of ['-wal', '-shm']) {
    try { fs.unlinkSync(`${dbPath}${suffix}`); } catch {}
  }
}

// Download database backup
router.get('/download', async (_req, res) => {
  try {
    const dataDir = getDataDir();
    const dbPath = getDbPath();

    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Use SQLite's backup API instead of copying darcy.db directly.
    // In WAL mode, recent writes may live in darcy.db-wal and raw copies can be stale or empty.
    const backupDir = path.join(dataDir, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupDir, `darcy-backup-${timestamp}.db`);
    await liveDb.backup(backupPath);

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
    const dataDir = getDataDir();
    const dbPath = getDbPath();

    if (!fs.existsSync(dbPath)) {
      return res.json({ exists: false });
    }

    const stats = fs.statSync(dbPath);
    const walPath = `${dbPath}-wal`;
    const shmPath = `${dbPath}-shm`;
    const walStats = fs.existsSync(walPath) ? fs.statSync(walPath) : null;
    const shmStats = fs.existsSync(shmPath) ? fs.statSync(shmPath) : null;

    res.json({
      exists: true,
      size: stats.size,
      sizeHuman: `${(stats.size / 1024).toFixed(1)} KB`,
      lastModified: stats.mtime.toISOString(),
      path: dataDir === '/data' ? 'Railway Volume (/data)' : 'Local (./data)',
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
    const dataDir = getDataDir();
    const dbPath = getDbPath();

    // Create a safety backup of the current database before overwriting
    const backupDir = path.join(dataDir, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safetyBackupPath = path.join(backupDir, `pre-restore-${timestamp}.db`);

    if (fs.existsSync(dbPath)) {
      await liveDb.backup(safetyBackupPath);
    }

    // Replace the database file with the uploaded one
    unlinkSqliteSidecars(dbPath);
    fs.copyFileSync(uploadedPath, dbPath);
    unlinkSqliteSidecars(dbPath);
    fs.unlinkSync(uploadedPath);

    // The server needs to restart to pick up the new database
    // Send success response first, then exit so Railway/process manager restarts
    res.json({
      success: true,
      message: 'Backup restored successfully. Server will restart to apply changes.',
      safetyBackup: `pre-restore-${timestamp}.db`,
    });

    // Give the response time to send, then restart
    setTimeout(() => {
      console.log('🔄 Restarting server after backup restore...');
      process.exit(0);
    }, 1000);
  } catch (error: any) {
    console.error('Restore error:', error?.message || error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

export default router;
