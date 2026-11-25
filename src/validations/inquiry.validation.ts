import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(20, 'Phone number too long'),
  type: z.enum(['studio_project', 'academy_general'], {
    errorMap: () => ({ message: 'Type must be either studio_project or academy_general' }),
  }),
  message: z.string().trim().min(5, 'Message must be at least 5 characters'),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['open', 'resolved'], {
    errorMap: () => ({ message: 'Status must be either open or resolved' }),
  }),
});

export const inquiryQuerySchema = z.object({
  status: z.enum(['open', 'resolved']).optional(),
  type: z.enum(['studio_project', 'academy_general']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
export type InquiryQueryInput = z.infer<typeof inquiryQuerySchema>;
