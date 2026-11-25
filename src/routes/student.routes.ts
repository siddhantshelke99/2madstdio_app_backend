import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { registerStudentSchema } from '../validations/student.validation';

const router = Router();

// Public registration endpoint
router.post('/register', validateBody(registerStudentSchema), (req, res, next) => {
  studentController.register(req, res, next);
});

export const studentRoutes = router;
