import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { courseRoutes } from './course.routes';
import { studentRoutes } from './student.routes';
import { inquiryRoutes } from './inquiry.routes';
import { adminRoutes } from './admin.routes';
import { dashboardRoutes } from './dashboard.routes';
import { communicationRoutes } from './communication.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '2NOMADS API v1',
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/students', studentRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/communications', communicationRoutes);

export const apiV1Routes = router;
