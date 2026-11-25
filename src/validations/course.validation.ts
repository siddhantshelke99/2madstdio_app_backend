import { z } from 'zod';

const syllabusItemSchema = z.object({
  weekOrModule: z.string().min(1, 'Week or Module label is required'),
  topic: z.string().min(1, 'Topic title is required'),
  details: z.array(z.string()).optional(),
});

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  duration: z.string().trim().min(1, 'Duration is required (e.g., 12 Weeks)'),
  fee: z.coerce.number().nonnegative('Fee must be a positive number'),
  mode: z.enum(['online', 'offline', 'hybrid'], {
    errorMap: () => ({ message: 'Mode must be one of: online, offline, hybrid' }),
  }),
  syllabus: z.union([z.array(syllabusItemSchema), z.record(z.any())]).default([]),
  isPublished: z.boolean().optional().default(true),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.object({
  mode: z.enum(['online', 'offline', 'hybrid']).optional(),
  isPublished: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
