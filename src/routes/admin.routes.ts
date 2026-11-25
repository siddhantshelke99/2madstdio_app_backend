import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { studentController } from '../controllers/student.controller';
import { inquiryController } from '../controllers/inquiry.controller';
import { dashboardController } from '../controllers/dashboard.controller';
import { communicationController } from '../controllers/communication.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
  validateBody,
  validateQuery,
} from '../middlewares/validation.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
} from '../validations/course.validation';
import {
  updateStudentStatusSchema,
  studentQuerySchema,
} from '../validations/student.validation';
import {
  updateInquiryStatusSchema,
  inquiryQuerySchema,
} from '../validations/inquiry.validation';
import {
  sendCommunicationSchema,
  communicationLogsQuerySchema,
} from '../validations/communication.validation';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticateJWT);

// --- Course Management ---
router.get('/courses', validateQuery(courseQuerySchema), (req, res, next) => {
  courseController.getAll(req, res, next);
});

router.post('/courses', validateBody(createCourseSchema), (req, res, next) => {
  courseController.create(req, res, next);
});

router.get('/courses/:id', (req, res, next) => {
  courseController.getById(req, res, next);
});

router.put('/courses/:id', validateBody(updateCourseSchema), (req, res, next) => {
  courseController.update(req, res, next);
});

router.delete('/courses/:id', (req, res, next) => {
  courseController.delete(req, res, next);
});

// --- Student Management ---
router.get('/students', validateQuery(studentQuerySchema), (req, res, next) => {
  studentController.getAll(req, res, next);
});

router.get('/students/:id', (req, res, next) => {
  studentController.getById(req, res, next);
});

router.patch(
  '/students/:id/status',
  validateBody(updateStudentStatusSchema),
  (req, res, next) => {
    studentController.updateStatus(req, res, next);
  }
);

router.put(
  '/students/:id/status',
  validateBody(updateStudentStatusSchema),
  (req, res, next) => {
    studentController.updateStatus(req, res, next);
  }
);

// --- Inquiry Management ---
router.get('/inquiries', validateQuery(inquiryQuerySchema), (req, res, next) => {
  inquiryController.getAll(req, res, next);
});

router.get('/inquiries/:id', (req, res, next) => {
  inquiryController.getById(req, res, next);
});

router.patch(
  '/inquiries/:id/status',
  validateBody(updateInquiryStatusSchema),
  (req, res, next) => {
    inquiryController.updateStatus(req, res, next);
  }
);

router.put(
  '/inquiries/:id/status',
  validateBody(updateInquiryStatusSchema),
  (req, res, next) => {
    inquiryController.updateStatus(req, res, next);
  }
);

// --- Dashboard Stats ---
router.get('/dashboard/stats', (req, res, next) => {
  dashboardController.getStats(req, res, next);
});

// --- Communication Workflows ---
router.post(
  '/communications/send',
  validateBody(sendCommunicationSchema),
  (req, res, next) => {
    communicationController.send(req, res, next);
  }
);

router.get(
  '/communications/logs',
  validateQuery(communicationLogsQuerySchema),
  (req, res, next) => {
    communicationController.getLogs(req, res, next);
  }
);

export const adminRoutes = router;
