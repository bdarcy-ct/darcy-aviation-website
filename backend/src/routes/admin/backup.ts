import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

router.use(authenticateAdmin);

// Download database backup
router.get('/download', (_req, res) => {
  try {
    // Find the database file
    const dataDir = fs.existsSync('/data') ? '/data' : path.join(__dirname, '../../../data');
    const dbPath = path.join(dataDir, 'darcy.db');

    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Create backup copy (to avoid locking issues)
    const backupDir = path.join(dataDir, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupDir, `darcy-backup-${timestamp}.db`);
    fs.copyFileSync(dbPath, backupPath);

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
    const dataDir = fs.existsSync('/data') ? '/data' : path.join(__dirname, '../../../data');
    const dbPath = path.join(dataDir, 'darcy.db');

    if (!fs.existsSync(dbPath)) {
      return res.json({ exists: false });
    }

    const stats = fs.statSync(dbPath);
    res.json({
      exists: true,
      size: stats.size,
      sizeHuman: `${(stats.size / 1024).toFixed(1)} KB`,
      lastModified: stats.mtime.toISOString(),
      path: dataDir === '/data' ? 'Railway Volume (/data)' : 'Local (./data)',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get backup info' });
  }
});

export default router;
