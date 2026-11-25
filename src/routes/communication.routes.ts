import { Router } from 'express';
import { communicationController } from '../controllers/communication.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import {
  sendCommunicationSchema,
  communicationLogsQuerySchema,
} from '../validations/communication.validation';

const router = Router();

// Protect all communication routes with JWT
router.use(authenticateJWT);

router.post(
  '/send',
  validateBody(sendCommunicationSchema),
  (req, res, next) => {
    communicationController.send(req, res, next);
  }
);

router.get(
  '/logs',
  validateQuery(communicationLogsQuerySchema),
  (req, res, next) => {
    communicationController.getLogs(req, res, next);
  }
);

export const communicationRoutes = router;
