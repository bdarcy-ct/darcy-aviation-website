import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const fleet = db.prepare('SELECT * FROM fleet WHERE available = 1 ORDER BY id').all();
    res.json(fleet);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Failed to fetch fleet data' });
  }
});

export default router;
