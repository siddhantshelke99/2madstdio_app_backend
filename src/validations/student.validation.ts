import { z } from 'zod';

export const registerStudentSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(20, 'Phone number too long'),
  whatsappNumber: z.string().trim().max(20).optional().nullable(),
  courseId: z.string().trim().min(1, 'Valid course ID or slug is required'),
  notes: z.string().trim().optional().nullable(),
  // Extended student profile details
  occupation: z.string().trim().optional().nullable(),
  collegeName: z.string().trim().optional().nullable(),
  degreeBranch: z.string().trim().optional().nullable(),
  yearOfStudy: z.string().trim().optional().nullable(),
  companyName: z.string().trim().optional().nullable(),
  jobTitle: z.string().trim().optional().nullable(),
  yearsExperience: z.string().trim().optional().nullable(),
  designTools: z.string().trim().optional().nullable(),
  portfolioLink: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  preferredBatch: z.string().trim().optional().nullable(),
  whyJoin: z.string().trim().optional().nullable(),
});

export const updateStudentStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'enrolled', 'dropped'], {
    errorMap: () => ({ message: 'Status must be one of: new, contacted, enrolled, dropped' }),
  }),
  notes: z.string().trim().optional().nullable(),
});

export const studentQuerySchema = z.object({
  status: z.enum(['new', 'contacted', 'enrolled', 'dropped']).optional(),
  courseId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type UpdateStudentStatusInput = z.infer<typeof updateStudentStatusSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
