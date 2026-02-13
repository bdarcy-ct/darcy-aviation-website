import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize text input
function sanitize(str: string | undefined | null): string | null {
  if (!str) return null;
  return str.trim().slice(0, 500);
}

// Create a booking
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, preferred_date, preferred_time, passengers, is_gift_card, experience_type, experience_price, message } = req.body;

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);

    if (!cleanName || cleanName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name' });
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const passengerCount = Math.min(Math.max(Number(passengers) || 1, 1), 3);

    const stmt = db.prepare(`
      INSERT INTO bookings (name, email, phone, preferred_date, preferred_time, passengers, is_gift_card, experience_type, experience_price, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      cleanName,
      cleanEmail,
      sanitize(phone),
      sanitize(preferred_date),
      sanitize(preferred_time),
      passengerCount,
      is_gift_card ? 1 : 0,
      sanitize(experience_type) || 'Discovery Flight',
      sanitize(experience_price),
      sanitize(message)
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: "Booking submitted successfully! We'll contact you within 24 hours to confirm your flight."
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking. Please try again or call us at (203) 617-0645.' });
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
