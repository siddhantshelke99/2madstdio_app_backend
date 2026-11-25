import { AdminAttributes } from '../models/Admin';

export type AuthenticatedAdmin = Omit<AdminAttributes, 'passwordHash'>;

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  admin: AuthenticatedAdmin;
}
