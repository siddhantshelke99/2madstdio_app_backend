import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If it's our custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Sequelize Unique Constraint Violation (e.g., duplicate email or slug)
  if (err instanceof UniqueConstraintError) {
    const fields = Object.keys(err.fields || {});
    res.status(409).json({
      success: false,
      message: `Conflict: duplicate entry for field(s): ${fields.join(', ')}`,
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Sequelize Validation Error
  if (err instanceof SequelizeValidationError) {
    res.status(400).json({
      success: false,
      message: 'Database validation failed',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Generic internal server error
  console.error('💥 Unhandled Exception:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
