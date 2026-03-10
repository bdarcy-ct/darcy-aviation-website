import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all fleet aircraft (including unavailable)
router.get('/', authenticateAdmin, (_req, res) => {
  try {
    const fleet = db.prepare('SELECT * FROM fleet ORDER BY id').all();
    const parsed = (fleet as any[]).map((a: any) => ({ ...a, images: JSON.parse(a.images || '[]') }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new aircraft
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, type, engine, seats, horsepower, cruise_speed, range, description, image_url, images, available = 1 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Aircraft name is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO fleet (name, type, engine, seats, horsepower, cruise_speed, range, description, image_url, images, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, type || '', engine || '', seats || 0, horsepower || 0, cruise_speed || '', range || '', description || '', image_url || '', JSON.stringify(images || []), available ? 1 : 0);
    const aircraft = db.prepare('SELECT * FROM fleet WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, aircraft });
  } catch (error) {
    console.error('Error creating aircraft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update aircraft
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, engine, seats, horsepower, cruise_speed, range, description, image_url, images, available } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Aircraft name is required' });
    }

    const stmt = db.prepare(`
      UPDATE fleet SET
        name = ?, type = ?, engine = ?, seats = ?, horsepower = ?,
        cruise_speed = ?, range = ?, description = ?, image_url = ?, images = ?, available = ?
      WHERE id = ?
    `);

    stmt.run(name, type || '', engine || '', seats || 0, horsepower || 0, cruise_speed || '', range || '', description || '', image_url || '', JSON.stringify(images || []), available ? 1 : 0, id);
    const aircraft = db.prepare('SELECT * FROM fleet WHERE id = ?').get(id);
    res.json({ success: true, aircraft });
  } catch (error) {
    console.error('Error updating aircraft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete aircraft
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM fleet WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting aircraft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle availability
router.post('/:id/toggle', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const aircraft = db.prepare('SELECT available FROM fleet WHERE id = ?').get(id) as { available: number } | undefined;
    if (!aircraft) {
      return res.status(404).json({ error: 'Aircraft not found' });
    }
    db.prepare('UPDATE fleet SET available = ? WHERE id = ?').run(aircraft.available ? 0 : 1, id);
    res.json({ success: true, available: !aircraft.available });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
