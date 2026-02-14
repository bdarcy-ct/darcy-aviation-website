import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get dashboard overview data
router.get('/', authenticateAdmin, (req, res) => {
  try {
    // Get counts for various entities
    const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as { count: number };
    const pendingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get() as { count: number };
    const contactMessages = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE read = 0").get() as { count: number };
    const mediaFiles = db.prepare('SELECT COUNT(*) as count FROM media_files').get() as { count: number };
    const faqs = db.prepare('SELECT COUNT(*) as count FROM faqs WHERE is_active = 1').get() as { count: number };
    const fleetAircraft = db.prepare('SELECT COUNT(*) as count FROM fleet WHERE available = 1').get() as { count: number };
    const testimonials = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };

    // Get recent activities
    const recentBookings = db.prepare(`
      SELECT id, name, email, experience_type, status, created_at 
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    const recentMessages = db.prepare(`
      SELECT id, name, email, subject, read, created_at 
      FROM contact_messages 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    // Calculate media storage usage
    const storageUsage = db.prepare('SELECT SUM(file_size) as total_size FROM media_files').get() as { total_size: number | null };
    const storageUsageMB = storageUsage.total_size ? Math.round(storageUsage.total_size / 1024 / 1024 * 100) / 100 : 0;

    res.json({
      counts: {
        bookings: bookingsCount.count,
        pendingBookings: pendingBookings.count,
        unreadMessages: contactMessages.count,
        mediaFiles: mediaFiles.count,
        faqs: faqs.count,
        fleetAircraft: fleetAircraft.count,
        testimonials: testimonials.count,
        storageUsageMB
      },
      recentActivity: {
        bookings: recentBookings,
        messages: recentMessages
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark contact message as read
router.post('/messages/:id/read', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE contact_messages SET read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.post('/bookings/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;