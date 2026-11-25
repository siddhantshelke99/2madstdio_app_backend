import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';
import { Admin, AdminRole } from '../models/Admin';

export const authenticateJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Authentication token expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    const admin = await Admin.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'isActive'],
    });

    if (!admin) {
      throw new UnauthorizedError('User account not found');
    }

    if (!admin.isActive) {
      throw new ForbiddenError('Admin account has been deactivated');
    }

    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles: AdminRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return next(
        new ForbiddenError(`Access denied. Requires one of: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
};
