import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './database';
import fleetRoutes from './routes/fleet';
import testimonialRoutes from './routes/testimonials';
// bookings and contact routes removed — bookings via FlightCircle, contact via email
import weatherRoutes from './routes/weather';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import wbRoutes from './routes/wb';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  next();
});

// Simple in-memory rate limiter for form submissions
const rateLimiter = new Map<string, number[]>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const requests = rateLimiter.get(ip) || [];
    const valid = requests.filter(t => now - t < windowMs);
    if (valid.length >= maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
      return;
    }
    valid.push(now);
    rateLimiter.set(ip, valid);
    next();
  };
}

// Clean up rate limiter every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 600000;
  for (const [ip, times] of rateLimiter.entries()) {
    const valid = times.filter(t => t > cutoff);
    if (valid.length === 0) rateLimiter.delete(ip);
    else rateLimiter.set(ip, valid);
  }
}, 600000);

// Initialize database
initializeDatabase();

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'darcy-aviation', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/fleet', fleetRoutes);
app.use('/api/testimonials', testimonialRoutes);
// bookings and contact API routes removed
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/wb', wbRoutes);

// API 404 catch-all — MUST come before SPA fallback
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve uploaded media files (accessible at /uploads/...)
// Check Railway volume first, fallback to local
const uploadsDir = fs.existsSync('/data/uploads') ? '/data/uploads' : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));

// Serve frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
// Hash-busted assets (js/css) get long cache, others get 1 day
app.use('/assets', express.static(path.join(frontendDist, 'assets'), {
  maxAge: '365d',
  immutable: true,
}));
app.use(express.static(frontendDist, { maxAge: '1d' }));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🛩️  Darcy Aviation API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
