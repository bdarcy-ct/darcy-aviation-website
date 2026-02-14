import express from 'express';
import { authenticateAdmin } from '../../middleware/auth';
import db from '../../database';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateAdmin);

// GET all training programs for admin
router.get('/', (req, res) => {
  try {
    const programs = db.prepare(`
      SELECT * FROM training_programs 
      ORDER BY sort_order ASC, id ASC
    `).all();

    // Parse JSON fields for easier frontend consumption
    const parsedPrograms = (programs as any[]).map((program: any) => ({
      ...program,
      overview: JSON.parse(program.overview || '[]'),
      requirements: JSON.parse(program.requirements || '[]'),
      curriculum: JSON.parse(program.curriculum || '[]'),
      fleet_used: JSON.parse(program.fleet_used || '[]'),
      faqs: JSON.parse(program.faqs || '[]'),
    }));

    res.json(parsedPrograms);
  } catch (error) {
    console.error('Error fetching training programs:', error);
    res.status(500).json({ error: 'Failed to fetch training programs' });
  }
});

// GET single training program for admin
router.get('/:id', (req, res) => {
  try {
    const program = db.prepare('SELECT * FROM training_programs WHERE id = ?').get(req.params.id) as any;
    
    if (!program) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    // Parse JSON fields
    const parsedProgram = {
      ...program,
      overview: JSON.parse(program.overview || '[]'),
      requirements: JSON.parse(program.requirements || '[]'),
      curriculum: JSON.parse(program.curriculum || '[]'),
      fleet_used: JSON.parse(program.fleet_used || '[]'),
      faqs: JSON.parse(program.faqs || '[]'),
    };

    res.json(parsedProgram);
  } catch (error) {
    console.error('Error fetching training program:', error);
    res.status(500).json({ error: 'Failed to fetch training program' });
  }
});

// POST create new training program
router.post('/', (req, res) => {
  try {
    const {
      slug,
      program_name,
      hero_title,
      hero_subtitle,
      hero_description,
      hero_icon_svg,
      overview,
      requirements,
      curriculum,
      timeline_duration,
      timeline_frequency,
      timeline_details,
      cost_note,
      hide_cost_quote,
      fleet_used,
      faqs,
      cta_text,
      cta_link,
      sort_order,
      is_active
    } = req.body;

    // Validate required fields
    if (!slug || !program_name || !hero_title || !hero_subtitle || !hero_description || !cta_text || !cta_link) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existing = db.prepare('SELECT id FROM training_programs WHERE slug = ?').get(slug);
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const stmt = db.prepare(`
      INSERT INTO training_programs (
        slug, program_name, hero_title, hero_subtitle, hero_description, hero_icon_svg,
        overview, requirements, curriculum, timeline_duration, timeline_frequency, timeline_details,
        cost_note, hide_cost_quote, fleet_used, faqs, cta_text, cta_link, sort_order, is_active,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      slug,
      program_name,
      hero_title,
      hero_subtitle,
      hero_description,
      hero_icon_svg,
      JSON.stringify(overview || []),
      JSON.stringify(requirements || []),
      JSON.stringify(curriculum || []),
      timeline_duration,
      timeline_frequency,
      timeline_details,
      cost_note,
      hide_cost_quote || 0,
      JSON.stringify(fleet_used || []),
      JSON.stringify(faqs || []),
      cta_text,
      cta_link,
      sort_order || 0,
      is_active !== undefined ? is_active : 1
    );

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      message: 'Training program created successfully' 
    });
  } catch (error) {
    console.error('Error creating training program:', error);
    res.status(500).json({ error: 'Failed to create training program' });
  }
});

// PUT update training program
router.put('/:id', (req, res) => {
  try {
    const programId = req.params.id;
    const {
      slug,
      program_name,
      hero_title,
      hero_subtitle,
      hero_description,
      hero_icon_svg,
      overview,
      requirements,
      curriculum,
      timeline_duration,
      timeline_frequency,
      timeline_details,
      cost_note,
      hide_cost_quote,
      fleet_used,
      faqs,
      cta_text,
      cta_link,
      sort_order,
      is_active
    } = req.body;

    // Validate required fields
    if (!slug || !program_name || !hero_title || !hero_subtitle || !hero_description || !cta_text || !cta_link) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug exists for another record
    const existing = db.prepare('SELECT id FROM training_programs WHERE slug = ? AND id != ?').get(slug, programId);
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists for another program' });
    }

    const stmt = db.prepare(`
      UPDATE training_programs SET
        slug = ?, program_name = ?, hero_title = ?, hero_subtitle = ?, hero_description = ?, hero_icon_svg = ?,
        overview = ?, requirements = ?, curriculum = ?, timeline_duration = ?, timeline_frequency = ?, timeline_details = ?,
        cost_note = ?, hide_cost_quote = ?, fleet_used = ?, faqs = ?, cta_text = ?, cta_link = ?, sort_order = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      slug,
      program_name,
      hero_title,
      hero_subtitle,
      hero_description,
      hero_icon_svg,
      JSON.stringify(overview || []),
      JSON.stringify(requirements || []),
      JSON.stringify(curriculum || []),
      timeline_duration,
      timeline_frequency,
      timeline_details,
      cost_note,
      hide_cost_quote || 0,
      JSON.stringify(fleet_used || []),
      JSON.stringify(faqs || []),
      cta_text,
      cta_link,
      sort_order || 0,
      is_active !== undefined ? is_active : 1,
      programId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    res.json({ message: 'Training program updated successfully' });
  } catch (error) {
    console.error('Error updating training program:', error);
    res.status(500).json({ error: 'Failed to update training program' });
  }
});

// DELETE training program
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM training_programs WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    res.json({ message: 'Training program deleted successfully' });
  } catch (error) {
    console.error('Error deleting training program:', error);
    res.status(500).json({ error: 'Failed to delete training program' });
  }
});

export default router;