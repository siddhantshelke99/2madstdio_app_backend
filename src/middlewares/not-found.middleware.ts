import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/errors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`API endpoint not found: ${req.method} ${req.originalUrl}`));
};
