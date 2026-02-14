import express from 'express';
import db from '../database';

const router = express.Router();

// ── Public Content API (no auth required) ──────────────────────────

// Get all site content
router.get('/content', (_req, res) => {
  try {
    const rows = db.prepare('SELECT section, key, content FROM site_content ORDER BY section, key').all() as {
      section: string;
      key: string;
      content: string;
    }[];

    // Group by section for easier frontend consumption
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!grouped[row.section]) grouped[row.section] = {};
      grouped[row.section][row.key] = row.content;
    }

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching public content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content for a specific section
router.get('/content/:section', (req, res) => {
  try {
    const { section } = req.params;
    const rows = db.prepare('SELECT key, content FROM site_content WHERE section = ? ORDER BY key').all(section) as {
      key: string;
      content: string;
    }[];

    const data: Record<string, string> = {};
    for (const row of rows) {
      data[row.key] = row.content;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching section content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active FAQs (grouped by category)
router.get('/faqs', (_req, res) => {
  try {
    const faqs = db.prepare(
      'SELECT id, question, answer, category FROM faqs WHERE is_active = 1 ORDER BY sort_order, id'
    ).all();

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching public FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SEO meta for a specific page
router.get('/seo/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const meta = db.prepare('SELECT title, description, og_title, og_description, og_image FROM pages_meta WHERE page_slug = ?').get(slug);

    if (!meta) {
      return res.json({});
    }

    res.json(meta);
  } catch (error) {
    console.error('Error fetching page meta:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active service tiles for homepage
router.get('/service-tiles', (_req, res) => {
  try {
    const tiles = db.prepare(`
      SELECT id, title, description, link, icon_svg, images, sort_order
      FROM service_tiles 
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

// Get all active training programs
router.get('/training-programs', (_req, res) => {
  try {
    const programs = db.prepare(`
      SELECT * FROM training_programs 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, id ASC
    `).all();

    // Parse JSON fields for frontend consumption
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single training program by slug
router.get('/training-programs/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const program = db.prepare('SELECT * FROM training_programs WHERE slug = ? AND is_active = 1').get(slug) as any;
    
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all active experiences
router.get('/experiences', (_req, res) => {
  try {
    const experiences = db.prepare(`
      SELECT * FROM experiences 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, id ASC
    `).all();

    // Parse JSON fields for frontend consumption
    const parsedExperiences = (experiences as any[]).map((experience: any) => ({
      ...experience,
      highlights: JSON.parse(experience.highlights || '[]'),
    }));

    res.json(parsedExperiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single experience by slug
router.get('/experiences/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const experience = db.prepare('SELECT * FROM experiences WHERE slug = ? AND is_active = 1').get(slug) as any;
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Parse JSON fields
    const parsedExperience = {
      ...experience,
      highlights: JSON.parse(experience.highlights || '[]'),
    };

    res.json(parsedExperience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all active maintenance services
router.get('/maintenance-services', (_req, res) => {
  try {
    const services = db.prepare(`
      SELECT * FROM maintenance_services 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, id ASC
    `).all();

    // Parse JSON fields for frontend consumption
    const parsedServices = (services as any[]).map((service: any) => ({
      ...service,
      details: JSON.parse(service.details || '[]'),
      includes: JSON.parse(service.includes || '[]'),
    }));

    res.json(parsedServices);
  } catch (error) {
    console.error('Error fetching maintenance services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
