import { Admin, AdminAttributes, AdminCreationAttributes } from '../models/Admin';

export class AdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return Admin.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return Admin.findByPk(id);
  }

  async create(data: AdminCreationAttributes): Promise<Admin> {
    return Admin.create({
      ...data,
      email: data.email.toLowerCase(),
    });
  }

  async update(id: string, updates: Partial<AdminAttributes>): Promise<Admin | null> {
    const admin = await Admin.findByPk(id);
    if (!admin) return null;
    return admin.update(updates);
  }
}

export const adminRepository = new AdminRepository();
