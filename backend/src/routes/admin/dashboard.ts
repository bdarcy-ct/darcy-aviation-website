import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get dashboard overview data
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const mediaFiles = db.prepare('SELECT COUNT(*) as count FROM media_files').get() as { count: number };
    const faqs = db.prepare('SELECT COUNT(*) as count FROM faqs WHERE is_active = 1').get() as { count: number };
    const fleetAircraft = db.prepare('SELECT COUNT(*) as count FROM fleet WHERE available = 1').get() as { count: number };
    const testimonials = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };

    // Calculate media storage usage
    const storageUsage = db.prepare('SELECT SUM(file_size) as total_size FROM media_files').get() as { total_size: number | null };
    const storageUsageMB = storageUsage.total_size ? Math.round(storageUsage.total_size / 1024 / 1024 * 100) / 100 : 0;

    res.json({
      counts: {
        mediaFiles: mediaFiles.count,
        faqs: faqs.count,
        fleetAircraft: fleetAircraft.count,
        testimonials: testimonials.count,
        storageUsageMB
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
