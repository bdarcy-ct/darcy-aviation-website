import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all page meta
router.get('/', authenticateAdmin, (_req, res) => {
  try {
    const meta = db.prepare('SELECT * FROM pages_meta ORDER BY page_slug').all();
    res.json(meta);
  } catch (error) {
    console.error('Error fetching SEO meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get meta for a specific page
router.get('/:slug', authenticateAdmin, (req, res) => {
  try {
    const { slug } = req.params;
    const meta = db.prepare('SELECT * FROM pages_meta WHERE page_slug = ?').get(slug);
    if (!meta) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(meta);
  } catch (error) {
    console.error('Error fetching page meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update page meta
router.put('/:slug', authenticateAdmin, (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, og_title, og_description, og_image } = req.body;

    const stmt = db.prepare(`
      INSERT INTO pages_meta (page_slug, title, description, og_title, og_description, og_image, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(page_slug) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        og_title = excluded.og_title,
        og_description = excluded.og_description,
        og_image = excluded.og_image,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(slug, title, description, og_title, og_description, og_image);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating page meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete page meta
router.delete('/:slug', authenticateAdmin, (req, res) => {
  try {
    const { slug } = req.params;
    db.prepare('DELETE FROM pages_meta WHERE page_slug = ?').run(slug);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting page meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
