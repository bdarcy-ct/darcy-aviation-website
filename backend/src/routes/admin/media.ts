import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../../database';
import { authenticateAdmin } from '../../middleware/auth';

const router = express.Router();

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, '../../../uploads');
const staticUploadsDir = path.join(__dirname, '../../../../static/uploads');

[uploadsDir, staticUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${timestamp}-${name}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Get all media files
router.get('/', authenticateAdmin, (req, res) => {
  try {
    const media = db.prepare('SELECT * FROM media_files ORDER BY uploaded_at DESC').all();
    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new media file
router.post('/upload', authenticateAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { category = 'general' } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    // Copy file to static directory for serving
    const srcPath = path.join(uploadsDir, req.file.filename);
    const destPath = path.join(staticUploadsDir, req.file.filename);
    fs.copyFileSync(srcPath, destPath);

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO media_files (filename, original_name, mime_type, file_size, file_path, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      filePath,
      category
    );

    const mediaFile = db.prepare('SELECT * FROM media_files WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, file: mediaFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update media file metadata
router.put('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    db.prepare('UPDATE media_files SET category = ? WHERE id = ?').run(category, id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media file
router.delete('/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const mediaFile = db.prepare('SELECT * FROM media_files WHERE id = ?').get(id) as {
      filename: string;
      file_path: string;
    } | undefined;

    if (!mediaFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete files from both upload and static directories
    const uploadPath = path.join(uploadsDir, mediaFile.filename);
    const staticPath = path.join(staticUploadsDir, mediaFile.filename);
    
    [uploadPath, staticPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Remove from database
    db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;