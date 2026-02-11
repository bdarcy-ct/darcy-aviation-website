import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

// Submit contact form
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, phone || null, subject || null, message);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Message sent successfully! We will get back to you soon.'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

// List messages (admin)
router.get('/', (_req: Request, res: Response) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
