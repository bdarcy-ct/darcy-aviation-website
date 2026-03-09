import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateAdmin } from '../../middleware/auth';
import db from '../../database';

const router = express.Router();
router.use(authenticateAdmin);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
const staticUploadsDir = path.join(__dirname, '../../../../static/uploads');
[uploadsDir, staticUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure multer for team photos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `team-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileTypes: /jpeg|jpg|png|webp/ } as any);

// GET all team members
router.get('/', (_req, res) => {
  try {
    const members = db.prepare('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC').all();
    res.json(members);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST create team member (with optional photo upload)
router.post('/', upload.single('photo'), (req: any, res) => {
  try {
    const { name, role, bio, sort_order, is_active } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    let photo_url = '';
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
      // Copy to static dir too
      const staticPath = path.join(staticUploadsDir, req.file.filename);
      fs.copyFileSync(req.file.path, staticPath);
    }

    const stmt = db.prepare(`
      INSERT INTO team_members (name, role, bio, photo_url, sort_order, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(
      name,
      role || 'Certified Flight Instructor',
      bio || '',
      photo_url,
      sort_order || 0,
      is_active !== undefined ? (is_active === 'true' || is_active === true ? 1 : 0) : 1
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Team member added' });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT update team member (with optional photo upload)
router.put('/:id', upload.single('photo'), (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, sort_order, is_active } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    let photo_url = req.body.photo_url || '';
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
      const staticPath = path.join(staticUploadsDir, req.file.filename);
      fs.copyFileSync(req.file.path, staticPath);
    }

    const stmt = db.prepare(`
      UPDATE team_members SET name = ?, role = ?, bio = ?, photo_url = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(
      name,
      role || 'Certified Flight Instructor',
      bio || '',
      photo_url,
      sort_order || 0,
      is_active !== undefined ? (is_active === 'true' || is_active === true ? 1 : 0) : 1,
      id
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Team member not found' });
    res.json({ message: 'Team member updated' });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE team member
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Team member not found' });
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
