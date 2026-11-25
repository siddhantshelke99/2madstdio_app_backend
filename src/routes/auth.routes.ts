import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { loginSchema } from '../validations/auth.validation';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', validateBody(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.get('/me', authenticateJWT, (req, res, next) => {
  authController.getMe(req, res, next);
});

export const authRoutes = router;
