import express from 'express';
import authRoutes from './auth';
import contentRoutes from './content';
import mediaRoutes from './media';
import faqRoutes from './faqs';
import dashboardRoutes from './dashboard';
import seoRoutes from './seo';

const router = express.Router();

// Admin routes
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/media', mediaRoutes);
router.use('/faqs', faqRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/seo', seoRoutes);

export default router;
