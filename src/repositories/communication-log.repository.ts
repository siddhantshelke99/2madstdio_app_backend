import {
  CommunicationLog,
  CommunicationLogCreationAttributes,
  RecipientType,
  CommunicationChannel,
  CommunicationStatus,
} from '../models/CommunicationLog';
import { PaginatedResult } from './base.repository';

export interface CommunicationLogFilterOptions {
  recipientType?: RecipientType;
  recipientId?: string;
  channel?: CommunicationChannel;
  status?: CommunicationStatus;
  page?: number;
  limit?: number;
}

export class CommunicationLogRepository {
  async create(data: CommunicationLogCreationAttributes): Promise<CommunicationLog> {
    return CommunicationLog.create(data);
  }

  async findByRecipient(
    recipientType: RecipientType,
    recipientId: string
  ): Promise<CommunicationLog[]> {
    return CommunicationLog.findAll({
      where: {
        recipientType,
        recipientId,
      },
      order: [['sent_at', 'DESC']],
    });
  }

  async findAll(
    options: CommunicationLogFilterOptions = {}
  ): Promise<PaginatedResult<CommunicationLog>> {
    const { recipientType, recipientId, channel, status, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (recipientType) {
      where.recipientType = recipientType;
    }

    if (recipientId) {
      where.recipientId = recipientId;
    }

    if (channel) {
      where.channel = channel;
    }

    if (status) {
      where.status = status;
    }

    const { rows, count } = await CommunicationLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['sent_at', 'DESC']],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export const communicationLogRepository = new CommunicationLogRepository();
