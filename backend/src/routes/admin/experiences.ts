import express from 'express';
import { authenticateAdmin } from '../../middleware/auth';
import db from '../../database';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateAdmin);

// GET all experiences for admin
router.get('/', (req, res) => {
  try {
    const experiences = db.prepare(`
      SELECT * FROM experiences 
      ORDER BY sort_order ASC, id ASC
    `).all();

    // Parse JSON fields for easier frontend consumption
    const parsedExperiences = (experiences as any[]).map((experience: any) => ({
      ...experience,
      highlights: JSON.parse(experience.highlights || '[]'),
    }));

    res.json(parsedExperiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// GET single experience for admin
router.get('/:id', (req, res) => {
  try {
    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id) as any;
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Parse JSON fields
    const parsedExperience = {
      ...experience,
      highlights: JSON.parse(experience.highlights || '[]'),
    };

    res.json(parsedExperience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

// POST create new experience
router.post('/', (req, res) => {
  try {
    const {
      slug,
      title,
      price,
      description,
      icon_svg,
      highlights,
      booking_url,
      featured,
      sort_order,
      is_active
    } = req.body;

    // Validate required fields
    if (!slug || !title || !price || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existing = db.prepare('SELECT id FROM experiences WHERE slug = ?').get(slug);
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const stmt = db.prepare(`
      INSERT INTO experiences (
        slug, title, price, description, icon_svg, highlights, booking_url, featured, sort_order, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      slug,
      title,
      String(price),
      description,
      icon_svg || null,
      JSON.stringify(highlights || []),
      booking_url || null,
      featured ? 1 : 0,
      parseInt(String(sort_order)) || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      message: 'Experience created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating experience:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to create experience' });
  }
});

// PUT update experience
router.put('/:id', (req, res) => {
  try {
    const experienceId = req.params.id;
    const {
      slug,
      title,
      price,
      description,
      icon_svg,
      highlights,
      booking_url,
      featured,
      sort_order,
      is_active
    } = req.body;

    // Validate required fields
    if (!slug || !title || !price || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug exists for another record
    const existing = db.prepare('SELECT id FROM experiences WHERE slug = ? AND id != ?').get(slug, experienceId);
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists for another experience' });
    }

    const stmt = db.prepare(`
      UPDATE experiences SET
        slug = ?, title = ?, price = ?, description = ?, icon_svg = ?, highlights = ?, 
        booking_url = ?, featured = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      slug,
      title,
      String(price),
      description,
      icon_svg || null,
      JSON.stringify(highlights || []),
      booking_url || null,
      featured ? 1 : 0,
      parseInt(String(sort_order)) || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      experienceId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json({ message: 'Experience updated successfully' });
  } catch (error: any) {
    console.error('Error updating experience:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to update experience' });
  }
});

// DELETE experience
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM experiences WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

export default router;