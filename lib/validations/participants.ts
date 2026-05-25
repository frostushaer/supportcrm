import { z } from 'zod';

export const participantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  primaryEmailAddress: z.string().email('Invalid email'),
  primaryPhoneNumber: z.string().min(10, 'Invalid phone number'),
  secondaryPhoneNumber: z.string().optional(),
  ndisNumber: z.string().length(9, 'NDIS number must be 9 digits'),
  address: z.string().min(1, 'Address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().length(4, 'Postcode must be 4 digits'),
  status: z.enum(['Active', 'Inactive']),
  serviceSupport: z.enum(['Core', 'Capacity Building', 'Capital']),
  auditParticipation: z.boolean(),
  regionId: z.string().min(1, 'Region is required'),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;
