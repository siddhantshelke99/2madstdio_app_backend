import { inquiryRepository, InquiryFilterOptions } from '../repositories/inquiry.repository';
import { communicationService } from './communication.service';
import { Inquiry } from '../models/Inquiry';
import { PaginatedResult } from '../repositories/base.repository';
import { NotFoundError } from '../utils/errors';
import { CreateInquiryInput, UpdateInquiryStatusInput } from '../validations/inquiry.validation';

export class InquiryService {
  async createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
    const inquiry = await inquiryRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      type: input.type,
      message: input.message,
      status: 'open',
    });

    // Asynchronously trigger automated Admin alert and submitter acknowledgment
    setImmediate(() => {
      communicationService.triggerInquiryCommunications(inquiry).catch((err) => {
        console.error('Async background inquiry communication failed:', err);
      });
    });

    return inquiry;
  }

  async getInquiries(options: InquiryFilterOptions = {}): Promise<PaginatedResult<Inquiry>> {
    return inquiryRepository.findAll(options);
  }

  async getInquiryById(id: string): Promise<Inquiry> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundError(`Inquiry with ID "${id}" was not found`);
    }
    return inquiry;
  }

  async updateInquiryStatus(id: string, input: UpdateInquiryStatusInput): Promise<Inquiry> {
    const existing = await inquiryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Inquiry with ID "${id}" was not found`);
    }

    const updated = await inquiryRepository.updateStatus(id, input.status);
    return updated!;
  }
}

export const inquiryService = new InquiryService();
