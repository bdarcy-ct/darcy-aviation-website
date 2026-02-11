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
app.use(express.json());

// Initialize database
initializeDatabase();

// API Routes
app.use('/api/fleet', fleetRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/weather', weatherRoutes);

// Serve frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🛩️  Darcy Aviation API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
