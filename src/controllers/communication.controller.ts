import { Request, Response, NextFunction } from 'express';
import { communicationService } from '../services/communication.service';

export class CommunicationController {
  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const senderName = req.admin?.name || '2NOMADS Admin';
      const result = await communicationService.sendManualCommunication(req.body, senderName);

      res.status(200).json({
        success: result.success,
        message: result.success
          ? `${req.body.channel.toUpperCase()} communication dispatched successfully`
          : `Failed to dispatch ${req.body.channel.toUpperCase()} communication`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await communicationService.getLogs(req.query as any);
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
}

export const communicationController = new CommunicationController();
