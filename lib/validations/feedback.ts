import { z } from 'zod';

export const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  details: z.string().min(1, 'Details are required'),
  status: z.string().optional(),
  attachmentUrl: z.string().nullable().optional(),
  attachmentName: z.string().nullable().optional(),
  userRole: z.string().optional(),
  regionId: z.string().nullable().optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
