import { z } from 'zod';

export const questionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  details: z.string().min(1, 'Details are required'),
  userRole: z.string().optional(),
  regionId: z.string().optional(),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
