import { z } from 'zod';

export const participantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  dateOfBirth: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date of birth'),
  languageSpoken: z.string().optional(),
  culturalBackground: z.string().optional(),
  ethnicity: z.string().optional(),
  aboutMe: z.string().optional(),
  primaryEmailAddress: z.string().email('Invalid email'),
  primaryPhoneNumber: z.string().min(1, 'Phone number is required').transform((v) => v.replace(/\D/g, '')).pipe(z.string().min(10, 'Invalid phone number')),
  secondaryPhoneNumber: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  ndisNumber: z.string().min(1, 'NDIS number is required').transform((v) => v.replace(/\D/g, '')).pipe(z.string().min(9, 'NDIS number must be at least 9 digits')),
  planNominee: z.string().optional(),
  serviceStartDate: z.string().optional(),
  serviceEndDate: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  serviceSupport: z.enum(['Core', 'Capacity Building', 'Capital']),
  auditParticipation: z.boolean(),
  participantConditions: z.string().optional(),
  importantAlert: z.string().optional(),
  shiftInstructions: z.string().optional(),
  externalCoordinatorName: z.string().optional(),
  externalCoordinatorEmail: z.string().optional(),
  externalCoordinatorPhone: z.string().optional(),
  externalCoordinatorCompany: z.string().optional(),
  timezone: z.string().optional(),
  planManagedBy: z.string().optional(),
  regionId: z.string().min(1, 'Region is required'),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

export const caseNoteSchema = z.object({
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  date: z.string().optional(),
  timeSpent: z.string().optional(),
  howContacted: z.string().optional(),
  travelKm: z.string().optional(),
  nonDirectSupport: z.string().optional(),
  billable: z.boolean().optional(),
  showToWorker: z.boolean().optional(),
});

export type CaseNoteFormData = z.infer<typeof caseNoteSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  category: z.string().optional(),
  staffNotes: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const goalSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  goalType: z.enum(['Short Term', 'Long Term']),
  progress: z.number().min(0).max(100).optional(),
  achievementNotes: z.string().optional(),
  hurdles: z.string().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  prescribedBy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;

export const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  appointmentTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
