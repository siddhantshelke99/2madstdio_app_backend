import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { createInquirySchema } from '../validations/inquiry.validation';

const router = Router();

// Public inquiry creation endpoint
router.post('/', validateBody(createInquirySchema), (req, res, next) => {
  inquiryController.create(req, res, next);
});

export const inquiryRoutes = router;
