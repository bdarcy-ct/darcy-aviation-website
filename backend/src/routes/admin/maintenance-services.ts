import express from 'express';
import { authenticateAdmin } from '../../middleware/auth';
import db from '../../database';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateAdmin);

// GET all maintenance services for admin
router.get('/', (req, res) => {
  try {
    const services = db.prepare(`
      SELECT * FROM maintenance_services 
      ORDER BY sort_order ASC, id ASC
    `).all();

    // Parse JSON fields for easier frontend consumption
    const parsedServices = (services as any[]).map((service: any) => ({
      ...service,
      details: JSON.parse(service.details || '[]'),
      includes: JSON.parse(service.includes || '[]'),
    }));

    res.json(parsedServices);
  } catch (error) {
    console.error('Error fetching maintenance services:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance services' });
  }
});

// GET single maintenance service for admin
router.get('/:id', (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM maintenance_services WHERE id = ?').get(req.params.id) as any;
    
    if (!service) {
      return res.status(404).json({ error: 'Maintenance service not found' });
    }

    // Parse JSON fields
    const parsedService = {
      ...service,
      details: JSON.parse(service.details || '[]'),
      includes: JSON.parse(service.includes || '[]'),
    };

    res.json(parsedService);
  } catch (error) {
    console.error('Error fetching maintenance service:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance service' });
  }
});

// POST create new maintenance service
router.post('/', (req, res) => {
  try {
    const {
      title,
      description,
      icon_svg,
      details,
      includes,
      note,
      sort_order,
      is_active
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO maintenance_services (
        title, description, icon_svg, details, includes, note, sort_order, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      title,
      description,
      icon_svg,
      JSON.stringify(details || []),
      JSON.stringify(includes || []),
      note,
      sort_order || 0,
      is_active !== undefined ? is_active : 1
    );

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      message: 'Maintenance service created successfully' 
    });
  } catch (error) {
    console.error('Error creating maintenance service:', error);
    res.status(500).json({ error: 'Failed to create maintenance service' });
  }
});

// PUT update maintenance service
router.put('/:id', (req, res) => {
  try {
    const serviceId = req.params.id;
    const {
      title,
      description,
      icon_svg,
      details,
      includes,
      note,
      sort_order,
      is_active
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      UPDATE maintenance_services SET
        title = ?, description = ?, icon_svg = ?, details = ?, includes = ?, note = ?,
        sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      title,
      description,
      icon_svg,
      JSON.stringify(details || []),
      JSON.stringify(includes || []),
      note,
      sort_order || 0,
      is_active !== undefined ? is_active : 1,
      serviceId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Maintenance service not found' });
    }

    res.json({ message: 'Maintenance service updated successfully' });
  } catch (error) {
    console.error('Error updating maintenance service:', error);
    res.status(500).json({ error: 'Failed to update maintenance service' });
  }
});

// DELETE maintenance service
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM maintenance_services WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Maintenance service not found' });
    }

    res.json({ message: 'Maintenance service deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance service:', error);
    res.status(500).json({ error: 'Failed to delete maintenance service' });
  }
});

export default router;