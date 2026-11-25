import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protected dashboard stats endpoint
router.get('/stats', authenticateJWT, (req, res, next) => {
  dashboardController.getStats(req, res, next);
});

export const dashboardRoutes = router;
