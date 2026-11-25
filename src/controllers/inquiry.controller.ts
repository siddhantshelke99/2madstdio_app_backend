import { Request, Response, NextFunction } from 'express';
import { inquiryService } from '../services/inquiry.service';

export class InquiryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiry = await inquiryService.createInquiry(req.body);
      res.status(201).json({
        success: true,
        message: 'Inquiry received. The 2NOMADS team will get back to you soon.',
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await inquiryService.getInquiries(req.query as any);
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
      const inquiry = await inquiryService.getInquiryById(req.params.id);
      res.status(200).json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiry = await inquiryService.updateInquiryStatus(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Inquiry status updated successfully',
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inquiryController = new InquiryController();
