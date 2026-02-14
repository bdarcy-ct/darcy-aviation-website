import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all content
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const content = db.prepare('SELECT * FROM site_content ORDER BY section, key').all();
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content by section
router.get('/section/:section', authenticateAdmin, (req, res) => {
  try {
    const { section } = req.params;
    const content = db.prepare('SELECT * FROM site_content WHERE section = ? ORDER BY key').all(section);
    res.json(content);
  } catch (error) {
    console.error('Error fetching section content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update or create content
router.put('/:section/:key', authenticateAdmin, (req, res) => {
  try {
    const { section, key } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO site_content (section, key, content, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(section, key) DO UPDATE SET
        content = excluded.content,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(section, key, content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete content
router.delete('/:section/:key', authenticateAdmin, (req, res) => {
  try {
    const { section, key } = req.params;
    db.prepare('DELETE FROM site_content WHERE section = ? AND key = ?').run(section, key);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get page meta data
router.get('/meta', authenticateAdmin, (req, res) => {
  try {
    const meta = db.prepare('SELECT * FROM pages_meta ORDER BY page_slug').all();
    res.json(meta);
  } catch (error) {
    console.error('Error fetching page meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update page meta
router.put('/meta/:slug', authenticateAdmin, (req, res) => {
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

export default router;