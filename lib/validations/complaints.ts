import { z } from 'zod';

export const complaintSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  details: z.string().trim().min(1, 'Details are required'),
  userRole: z.string().trim().optional(),
  regionId: z.string().optional(),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;
