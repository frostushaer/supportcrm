import { z } from 'zod';

// Shared constant for categories - must match UI and schema
export const QUESTION_CATEGORIES = [
  'Accounting',
  'Compliance',
  'IT',
  'Legal Query',
  'Marketing',
  'Plan Review',
  'Operations',
  'HR',
  'Finance',
] as const;

export const questionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  category: z.enum(QUESTION_CATEGORIES, { message: 'Please select a valid category' }),
  details: z.string().trim().min(1, 'Details are required'),
  userRole: z.string().trim().optional(),
  regionId: z.string().optional(),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
