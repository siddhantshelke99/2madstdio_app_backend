import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { validateQuery } from '../middlewares/validation.middleware';
import { courseQuerySchema } from '../validations/course.validation';

const router = Router();

// Public course routes
router.get('/', validateQuery(courseQuerySchema), (req, res, next) => {
  courseController.getPublished(req, res, next);
});

router.get('/slug/:slug', (req, res, next) => {
  courseController.getBySlug(req, res, next);
});

router.get('/:id', (req, res, next) => {
  courseController.getById(req, res, next);
});

export const courseRoutes = router;
