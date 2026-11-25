import { Op } from 'sequelize';
import {
  Inquiry,
  InquiryAttributes,
  InquiryCreationAttributes,
  InquiryStatus,
  InquiryType,
} from '../models/Inquiry';
import { PaginatedResult } from './base.repository';

export interface InquiryFilterOptions {
  status?: InquiryStatus;
  type?: InquiryType;
  search?: string;
  page?: number;
  limit?: number;
}

export class InquiryRepository {
  async findAll(options: InquiryFilterOptions = {}): Promise<PaginatedResult<Inquiry>> {
    const { status, type, search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Inquiry.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string): Promise<Inquiry | null> {
    return Inquiry.findByPk(id);
  }

  async create(data: InquiryCreationAttributes): Promise<Inquiry> {
    return Inquiry.create(data);
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry | null> {
    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) return null;
    return inquiry.update({ status });
  }

  async countByStatus(): Promise<Record<InquiryStatus, number>> {
    const counts: Record<InquiryStatus, number> = {
      open: 0,
      resolved: 0,
    };

    const results = await Inquiry.findAll({
      attributes: [
        'status',
        [Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }) as unknown as { status: InquiryStatus; count: string | number }[];

    results.forEach((row) => {
      counts[row.status] = parseInt(String(row.count), 10);
    });

    return counts;
  }

  async countByType(): Promise<Record<InquiryType, number>> {
    const counts: Record<InquiryType, number> = {
      studio_project: 0,
      academy_general: 0,
    };

    const results = await Inquiry.findAll({
      attributes: [
        'type',
        [Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    }) as unknown as { type: InquiryType; count: string | number }[];

    results.forEach((row) => {
      counts[row.type] = parseInt(String(row.count), 10);
    });

    return counts;
  }
}

export const inquiryRepository = new InquiryRepository();
