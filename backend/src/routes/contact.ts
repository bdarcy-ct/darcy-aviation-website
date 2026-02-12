import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string | undefined | null, maxLen = 500): string | null {
  if (!str) return null;
  return str.trim().slice(0, maxLen);
}

// Submit contact form
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanMessage = sanitize(message, 2000);

    if (!cleanName || cleanName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name' });
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      res.status(400).json({ error: 'Please enter a message (at least 10 characters)' });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(cleanName, cleanEmail, sanitize(phone), sanitize(subject), cleanMessage);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: "Message sent successfully! We'll get back to you within 24 hours."
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit message. Please try again or call us at (203) 617-0645.' });
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
