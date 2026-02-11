import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY featured DESC, id DESC').all();
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

export default router;
