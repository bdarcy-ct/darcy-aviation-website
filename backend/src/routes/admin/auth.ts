import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../../database';
import { generateToken } from '../../middleware/auth';

const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?').get(username) as {
      id: number;
      username: string;
      password_hash: string;
    } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    db.prepare('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check token validity
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'darcy-aviation-secret-2026';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = db.prepare('SELECT id, username FROM admin_users WHERE id = ?').get(decoded.userId) as {
      id: number;
      username: string;
    } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;