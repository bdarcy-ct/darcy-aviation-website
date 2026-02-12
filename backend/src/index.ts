import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './database';
import fleetRoutes from './routes/fleet';
import testimonialRoutes from './routes/testimonials';
import bookingRoutes from './routes/bookings';
import contactRoutes from './routes/contact';
import weatherRoutes from './routes/weather';

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
  next();
});

// Initialize database
initializeDatabase();

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'darcy-aviation', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/fleet', fleetRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/weather', weatherRoutes);

// API 404 catch-all — MUST come before SPA fallback
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
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
