import bcrypt from 'bcryptjs';
import { adminRepository } from '../repositories/admin.repository';
import { signToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors';
import { LoginInput } from '../validations/auth.validation';
import { AdminAttributes } from '../models/Admin';

export class AuthService {
  async login(input: LoginInput): Promise<{
    token: string;
    admin: Omit<AdminAttributes, 'passwordHash'>;
  }> {
    const admin = await adminRepository.findByEmail(input.email);

    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new ForbiddenError('This admin account is deactivated');
    }

    const isMatch = await bcrypt.compare(input.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    };
  }

  async getMe(adminId: string): Promise<Omit<AdminAttributes, 'passwordHash'>> {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin profile not found');
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}

export const authService = new AuthService();
