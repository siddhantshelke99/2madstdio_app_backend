import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: 'super_admin' | 'staff';
}

export const signToken = (payload: AdminJwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): AdminJwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
};
