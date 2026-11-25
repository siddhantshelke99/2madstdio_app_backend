import { z } from 'zod';

export const sendCommunicationSchema = z
  .object({
    recipientType: z.enum(['student', 'inquiry'], {
      errorMap: () => ({ message: 'Recipient type must be either "student" or "inquiry"' }),
    }),
    recipientId: z.string().uuid('Valid recipient UUID is required'),
    channel: z.enum(['email', 'whatsapp'], {
      errorMap: () => ({ message: 'Channel must be either "email" or "whatsapp"' }),
    }),
    subject: z.string().trim().min(3, 'Subject must be at least 3 characters').optional(),
    message: z.string().trim().min(5, 'Message must be at least 5 characters'),
    templateName: z.string().trim().optional().default('custom_admin_followup'),
  })
  .refine(
    (data) => {
      if (data.channel === 'email' && (!data.subject || data.subject.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Subject is required when sending an email communication',
      path: ['subject'],
    }
  );

export const communicationLogsQuerySchema = z.object({
  recipientType: z.enum(['student', 'inquiry']).optional(),
  recipientId: z.string().uuid().optional(),
  channel: z.enum(['email', 'whatsapp']).optional(),
  status: z.enum(['sent', 'failed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SendCommunicationInput = z.infer<typeof sendCommunicationSchema>;
export type CommunicationLogsQueryInput = z.infer<typeof communicationLogsQuerySchema>;
