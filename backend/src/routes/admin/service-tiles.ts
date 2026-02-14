import express from 'express';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all service tiles
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const tiles = db.prepare(`
      SELECT * FROM service_tiles 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, id ASC
    `).all();
    
    // Parse the images JSON for each tile
    const tilesWithParsedImages = tiles.map((tile: any) => ({
      ...tile,
      images: tile.images ? JSON.parse(tile.images) : []
    }));
    
    res.json(tilesWithParsedImages);
  } catch (error) {
    console.error('Error fetching service tiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single service tile
router.get('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const tile = db.prepare('SELECT * FROM service_tiles WHERE id = ?').get(id) as any;
    
    if (!tile) {
      return res.status(404).json({ error: 'Service tile not found' });
    }
    
    // Parse the images JSON
    tile.images = tile.images ? JSON.parse(tile.images) : [];
    
    res.json(tile);
  } catch (error) {
    console.error('Error fetching service tile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new service tile
router.post('/', authenticateAdmin, (req, res) => {
  try {
    const { title, description, link, icon_svg, images, sort_order = 0 } = req.body;
    
    if (!title || !description || !link) {
      return res.status(400).json({ error: 'Title, description, and link are required' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO service_tiles (title, description, link, icon_svg, images, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      title,
      description,
      link,
      icon_svg || null,
      JSON.stringify(images || []),
      sort_order
    );
    
    const newTile = db.prepare('SELECT * FROM service_tiles WHERE id = ?').get(result.lastInsertRowid) as any;
    newTile.images = newTile.images ? JSON.parse(newTile.images) : [];
    
    res.json({ success: true, tile: newTile });
  } catch (error) {
    console.error('Error creating service tile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service tile
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, icon_svg, images, sort_order, is_active } = req.body;
    
    if (!title || !description || !link) {
      return res.status(400).json({ error: 'Title, description, and link are required' });
    }
    
    const stmt = db.prepare(`
      UPDATE service_tiles 
      SET title = ?, description = ?, link = ?, icon_svg = ?, images = ?, 
          sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      title,
      description,
      link,
      icon_svg || null,
      JSON.stringify(images || []),
      sort_order || 0,
      is_active !== undefined ? is_active : 1,
      id
    );
    
    const updatedTile = db.prepare('SELECT * FROM service_tiles WHERE id = ?').get(id) as any;
    if (!updatedTile) {
      return res.status(404).json({ error: 'Service tile not found' });
    }
    
    updatedTile.images = updatedTile.images ? JSON.parse(updatedTile.images) : [];
    res.json({ success: true, tile: updatedTile });
  } catch (error) {
    console.error('Error updating service tile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete service tile
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const tile = db.prepare('SELECT * FROM service_tiles WHERE id = ?').get(id);
    if (!tile) {
      return res.status(404).json({ error: 'Service tile not found' });
    }
    
    db.prepare('DELETE FROM service_tiles WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service tile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder service tiles
router.post('/reorder', authenticateAdmin, (req, res) => {
  try {
    const { tiles } = req.body;
    
    if (!Array.isArray(tiles)) {
      return res.status(400).json({ error: 'Tiles must be an array' });
    }
    
    const updateStmt = db.prepare('UPDATE service_tiles SET sort_order = ? WHERE id = ?');
    
    const transaction = db.transaction(() => {
      tiles.forEach((tile: any, index: number) => {
        updateStmt.run(index + 1, tile.id);
      });
    });
    
    transaction();
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering service tiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;