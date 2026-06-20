import * as z from 'zod';

export const applicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  suburb: z.string().optional(),
  appliedOn: z.string().or(z.date()),
  jobTitle: z.string().min(1, 'Job title is required'),
  regionId: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export type ApplicantFormData = z.infer<typeof applicantSchema>;

export const applicantAssessmentSchema = z.object({
  status: z.enum(['Applied', 'PhoneScreening', 'Interview', 'Pending', 'Offer', 'Hired', 'Rejected']),
  interviewNotes: z.string().optional(),
  notes: z.string().optional(),

  // Hiring fields (required if status is 'Hired')
  employmentType: z.string().optional(),
  role: z.string().optional(),
  salarySlab: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  createPortalUser: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.status === 'Hired' && data.createPortalUser) {
      return !!data.password && data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: 'Passwords must match when creating a portal user',
    path: ['confirmPassword'],
  }
).refine(
  (data) => {
    if (data.status === 'Hired') {
      return !!data.role && !!data.employmentType;
    }
    return true;
  },
  {
    message: 'Role and Employment Type are required when hiring',
    path: ['role'],
  }
);

export type ApplicantAssessmentFormData = z.infer<typeof applicantAssessmentSchema>;

export const workerSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  profilePictureUrl: z.string().optional(),
  performanceReviewRequired: z.boolean().optional(),

  // Employment details
  employmentType: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  jobTitle: z.string().optional(),
  salarySlab: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  joiningDate: z.string().or(z.date()).optional(),
  maxAllowedHours: z.coerce.number().optional(),

  // Identifiers
  xeroEmployeeId: z.string().optional(),
  quickBooksEmployeeId: z.string().optional(),
  myobEmployeeId: z.string().optional(),

  // Associations
  regionId: z.string().min(1, 'Region is required'),
  assignedParticipantIds: z.array(z.string()).optional(),

  traits: z.record(z.string(), z.number()).optional(), // { "Sporty": 4, "Detail-Oriented": 5 }
});

export type WorkerSettingsFormData = z.infer<typeof workerSettingsSchema>;

export const workerLeaveSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  reason: z.string().optional(),
  comments: z.string().optional(),
  status: z.string().optional(),
});

export type WorkerLeaveFormData = z.infer<typeof workerLeaveSchema>;

export const workerAvailabilitySchema = z.object({
  dayOfWeek: z.string().min(1, 'Day of week is required'),
  availability: z.string().min(1, 'Availability is required'),
});

export type WorkerAvailabilityFormData = z.infer<typeof workerAvailabilitySchema>;

export const workerDocumentFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
});

export type WorkerDocumentFolderFormData = z.infer<typeof workerDocumentFolderSchema>;

export const workerDocumentSchema = z.object({
  folderId: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileSize: z.number().optional(),
});

export type WorkerDocumentFormData = z.infer<typeof workerDocumentSchema>;

export const workerTrainingSchema = z.object({
  formTemplateId: z.string().optional(),
  formName: z.string().min(1, 'Form name is required'),
  status: z.string().optional(),
  expiryDate: z.string().or(z.date()).optional(),
  version: z.string().optional(),
});

export type WorkerTrainingFormData = z.infer<typeof workerTrainingSchema>;

export const primaryPortalUserSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  status: z.string().optional(),
  regionIds: z.array(z.string()).optional(),
});

export type PrimaryPortalUserFormData = z.infer<typeof primaryPortalUserSchema>;
