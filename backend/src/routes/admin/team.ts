import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateAdmin } from '../../middleware/auth';
import db from '../../database';
import { uploadsDir } from '../../paths';

const router = express.Router();
router.use(authenticateAdmin);


// Configure multer for team photos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `team-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/jpeg|jpg|png|webp/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  },
});

// Run multer and turn its errors (too large, wrong type) into readable JSON
function photoUpload(req: any, res: any, next: any) {
  upload.single('photo')(req, res, (err: any) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Photo is too large (max 25 MB)' : (err.message || 'Photo upload failed');
    res.status(400).json({ error: message });
  });
}

// Reorder team — body: { ids: number[] } in the desired display order
router.post('/reorder', (req, res) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      return res.status(400).json({ error: 'ids must be an array of team member ids' });
    }
    const update = db.prepare('UPDATE team_members SET sort_order = ? WHERE id = ?');
    db.transaction(() => { ids.forEach((id: number, i: number) => update.run(i + 1, id)); })();
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering team:', error);
    res.status(500).json({ error: 'Failed to reorder team' });
  }
});

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
router.post('/', photoUpload, (req: any, res) => {
  try {
    const { name, role, bio, sort_order, is_active } = req.body;
    console.log('[CMS] Team POST:', { name, role, bio, sort_order, is_active, hasFile: !!req.file });
    if (!name) return res.status(400).json({ error: 'Name is required' });

    let photo_url = req.body.photo_url || '';
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
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
      parseInt(sort_order) || 0,
      is_active !== undefined ? (is_active === 'true' || is_active === true ? 1 : 0) : 1
    );

    // Return the full created member so frontend can verify
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
    console.log('[CMS] Team member created:', member);
    res.status(201).json({ success: true, member, message: 'Team member added' });
  } catch (error) {
    console.error('[CMS] Error creating team member:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT update team member (with optional photo upload)
router.put('/:id', photoUpload, (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, sort_order, is_active } = req.body;
    console.log('[CMS] Team PUT:', { id, name, role, bio, sort_order, is_active, hasFile: !!req.file });
    if (!name) return res.status(400).json({ error: 'Name is required' });

    let photo_url = req.body.photo_url || '';
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
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
      parseInt(sort_order) || 0,
      is_active !== undefined ? (is_active === 'true' || is_active === true ? 1 : 0) : 1,
      id
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Team member not found' });
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    console.log('[CMS] Team member updated:', member);
    res.json({ success: true, member, message: 'Team member updated' });
  } catch (error) {
    console.error('[CMS] Error updating team member:', error);
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
