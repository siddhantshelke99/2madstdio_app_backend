import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service';

export class StudentController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.registerStudent(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration submitted successfully. The 2NOMADS team will get in touch shortly.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.getStudents(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.getStudentById(req.params.id);
      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.updateStudentStatus(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Student status updated successfully',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
