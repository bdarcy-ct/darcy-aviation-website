import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

function cleanHtml(input: string): string {
  return String(input || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}

router.use(authenticateAdmin);

router.get('/', (_req, res) => {
  try {
    const sections = db.prepare('SELECT * FROM sop_sections ORDER BY sort_order ASC, id ASC').all();
    res.json(sections);
  } catch (error) {
    console.error('Error fetching SOP sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { anchor, section_number, category, title, content_html, sort_order, is_active } = req.body;
    if (!anchor || !title) return res.status(400).json({ error: 'Anchor and title are required' });

    const result = db.prepare(`
      INSERT INTO sop_sections (anchor, section_number, category, title, content_html, sort_order, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      String(anchor).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''),
      section_number || '',
      category || '',
      title,
      cleanHtml(content_html || '<p>New SOP section content.</p>'),
      Number(sort_order || 0),
      is_active === 0 ? 0 : 1
    );

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    console.error('Error creating SOP section:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM sop_sections WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'SOP section not found' });

    const { anchor, section_number, category, title, content_html, sort_order, is_active, changed_by } = req.body;

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO sop_revision_log (section_id, anchor, title, content_html, changed_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(existing.id, existing.anchor, existing.title, existing.content_html, changed_by || 'admin');

      db.prepare(`
        UPDATE sop_sections SET
          anchor = ?,
          section_number = ?,
          category = ?,
          title = ?,
          content_html = ?,
          sort_order = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        String(anchor || existing.anchor).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''),
        section_number ?? existing.section_number,
        category ?? existing.category,
        title ?? existing.title,
        cleanHtml(content_html ?? existing.content_html),
        Number(sort_order ?? existing.sort_order),
        is_active === 0 ? 0 : 1,
        id
      );
    });

    tx();
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating SOP section:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM sop_sections WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting SOP section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/revisions', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM sop_revision_log WHERE section_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.id);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching SOP revisions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
