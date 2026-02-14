import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all FAQs
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const faqs = db.prepare('SELECT * FROM faqs ORDER BY sort_order, id').all();
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new FAQ
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { question, answer, category = 'general', sort_order = 0 } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO faqs (question, answer, category, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(question, answer, category, sort_order);
    const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, faq });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update FAQ
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, sort_order, is_active } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const stmt = db.prepare(`
      UPDATE faqs SET
        question = ?,
        answer = ?,
        category = ?,
        sort_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(question, answer, category, sort_order, is_active, id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete FAQ
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder FAQs
router.post('/reorder', authenticateAdmin, (req, res) => {
  try {
    const { faqs } = req.body; // Array of { id, sort_order }

    if (!Array.isArray(faqs)) {
      return res.status(400).json({ error: 'FAQs array is required' });
    }

    const updateStmt = db.prepare('UPDATE faqs SET sort_order = ? WHERE id = ?');
    const updateMany = db.transaction(() => {
      for (const faq of faqs) {
        updateStmt.run(faq.sort_order, faq.id);
      }
    });

    updateMany();
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;