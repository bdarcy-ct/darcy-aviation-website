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

// Change password
router.post('/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'darcy-aviation-secret-2026';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = db.prepare('SELECT id, password_hash FROM admin_users WHERE id = ?').get(decoded.userId) as { id: number; password_hash: string } | undefined;
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;