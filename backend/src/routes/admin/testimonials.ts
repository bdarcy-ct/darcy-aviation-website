import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all testimonials
router.get('/', authenticateAdmin, (_req, res) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY featured DESC, id DESC').all();
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new testimonial
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { name, rating = 5, text, date, featured = 0 } = req.body;

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO testimonials (name, rating, text, date, featured)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, rating, text, date || new Date().toISOString().split('T')[0], featured ? 1 : 0);
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, testimonial });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update testimonial
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, rating, text, date, featured } = req.body;

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required' });
    }

    const stmt = db.prepare(`
      UPDATE testimonials SET
        name = ?, rating = ?, text = ?, date = ?, featured = ?
      WHERE id = ?
    `);

    stmt.run(name, rating || 5, text, date || '', featured ? 1 : 0, id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete testimonial
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle featured
router.post('/:id/feature', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = db.prepare('SELECT featured FROM testimonials WHERE id = ?').get(id) as { featured: number } | undefined;
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    db.prepare('UPDATE testimonials SET featured = ? WHERE id = ?').run(testimonial.featured ? 0 : 1, id);
    res.json({ success: true, featured: !testimonial.featured });
  } catch (error) {
    console.error('Error toggling featured:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
