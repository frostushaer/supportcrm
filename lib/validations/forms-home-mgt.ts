import { z } from 'zod';

export const formFieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  type: z.string().min(1, 'Type is required'),
  required: z.boolean().optional(),
  fullWidth: z.boolean().optional(),
  addedInSupportPlan: z.boolean().optional(),
  dependentOnFieldId: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  legalReference: z.string().nullable().optional(),
  order: z.number().optional(),
});

export const formSubSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  order: z.number().optional(),
  addOther: z.boolean().optional(),
  fields: z.array(formFieldSchema).optional(),
});

export const formSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  order: z.number().optional(),
  subSections: z.array(formSubSectionSchema).optional(),
  fields: z.array(formFieldSchema).optional(),
});

export const formTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.string().optional(), // 'Draft' | 'Published' | 'Archived'
  kind: z.string().optional(),
  regionId: z.string().nullable().optional(),
  sections: z.array(formSectionSchema).optional(),
});

export type FormTemplateInput = z.infer<typeof formTemplateSchema>;
export type FormSectionInput = z.infer<typeof formSectionSchema>;
export type FormSubSectionInput = z.infer<typeof formSubSectionSchema>;
export type FormFieldInput = z.infer<typeof formFieldSchema>;
