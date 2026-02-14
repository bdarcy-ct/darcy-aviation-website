import express from 'express';
import db from '../database';

const router = express.Router();

// ── Public Content API (no auth required) ──────────────────────────

// Get all site content
router.get('/content', (_req, res) => {
  try {
    const rows = db.prepare('SELECT section, key, content FROM site_content ORDER BY section, key').all() as {
      section: string;
      key: string;
      content: string;
    }[];

    // Group by section for easier frontend consumption
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!grouped[row.section]) grouped[row.section] = {};
      grouped[row.section][row.key] = row.content;
    }

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching public content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content for a specific section
router.get('/content/:section', (req, res) => {
  try {
    const { section } = req.params;
    const rows = db.prepare('SELECT key, content FROM site_content WHERE section = ? ORDER BY key').all(section) as {
      key: string;
      content: string;
    }[];

    const data: Record<string, string> = {};
    for (const row of rows) {
      data[row.key] = row.content;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching section content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active FAQs (grouped by category)
router.get('/faqs', (_req, res) => {
  try {
    const faqs = db.prepare(
      'SELECT id, question, answer, category FROM faqs WHERE is_active = 1 ORDER BY sort_order, id'
    ).all();

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching public FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SEO meta for a specific page
router.get('/seo/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const meta = db.prepare('SELECT title, description, og_title, og_description, og_image FROM pages_meta WHERE page_slug = ?').get(slug);

    if (!meta) {
      return res.json({});
    }

    res.json(meta);
  } catch (error) {
    console.error('Error fetching page meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
