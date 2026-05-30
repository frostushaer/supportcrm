import { z } from 'zod';

// Shared constant for feedback categories - must match UI and schema
export const FEEDBACK_CATEGORIES = [
  'General',
  'IT Support',
  'HR',
  'Finance',
  'Operations',
  'Compliance',
  'Other',
] as const;

export const feedbackSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  category: z.enum(FEEDBACK_CATEGORIES, { message: 'Please select a valid category' }),
  details: z.string().trim().min(1, 'Details are required'),
  status: z.string().optional(),
  attachmentUrl: z.string().nullable().optional(),
  attachmentName: z.string().nullable().optional(),
  userRole: z.string().trim().optional(),
  regionId: z.string().nullable().optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
