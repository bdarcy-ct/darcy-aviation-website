import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

// Create a booking
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, preferred_date, preferred_time, passengers, is_gift_card, message } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO bookings (name, email, phone, preferred_date, preferred_time, passengers, is_gift_card, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, phone || null, preferred_date || null, preferred_time || null, passengers || 1, is_gift_card ? 1 : 0, message || null);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Booking submitted successfully! We will contact you shortly.'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// List bookings (admin)
router.get('/', (_req: Request, res: Response) => {
  try {
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
