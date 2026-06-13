import * as z from 'zod';

export const policySchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  category: z.string().min(1, 'Category is required'),
  fileUrl: z.string().min(1, 'File is required'),
  fileType: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  regionId: z.string().optional().nullable(),
});

export type PolicyFormData = z.infer<typeof policySchema>;

export const POLICY_CATEGORIES = [
  'Policy Document',
  'Procedure',
  'Guideline',
  'Form',
  'Template',
  'Other',
] as const;
