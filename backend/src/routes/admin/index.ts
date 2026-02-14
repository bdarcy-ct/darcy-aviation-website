import express from 'express';
import authRoutes from './auth';
import contentRoutes from './content';
import mediaRoutes from './media';
import faqRoutes from './faqs';
import dashboardRoutes from './dashboard';
import seoRoutes from './seo';
import fleetRoutes from './fleet';
import testimonialRoutes from './testimonials';
import serviceTilesRoutes from './service-tiles';
import trainingProgramsRoutes from './training-programs';
import experiencesRoutes from './experiences';
import maintenanceServicesRoutes from './maintenance-services';

const router = express.Router();

// Admin routes
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/media', mediaRoutes);
router.use('/faqs', faqRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/seo', seoRoutes);
router.use('/fleet', fleetRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/service-tiles', serviceTilesRoutes);
router.use('/training-programs', trainingProgramsRoutes);
router.use('/experiences', experiencesRoutes);
router.use('/maintenance-services', maintenanceServicesRoutes);

export default router;
