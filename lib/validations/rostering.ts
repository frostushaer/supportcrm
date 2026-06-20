import * as z from 'zod'

export const shiftSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  participantId: z.string().optional(),
  regionId: z.string().min(1, 'Region is required'),
  shiftDate: z.string(), // ISO date string
  startDateTime: z.string(), // ISO datetime string
  endDateTime: z.string(), // ISO datetime string
  serviceCategory: z.string().optional(),
  supportItem: z.string().optional(),
  ratioWorkerCount: z.number().min(1).default(1),
  ratioParticipantCount: z.number().min(1).default(1),
  tasks: z.array(z.string()).optional(),
  status: z.enum(['Unpublished', 'Published', 'Rejected', 'Open']).default('Unpublished'),
  overtime: z.string().optional(),

  // Quick Settings
  workerTrackingEnabled: z.boolean().default(false),
  isGroupShift: z.boolean().default(false),
  isOpenShift: z.boolean().default(false),
  requireParticipantSignature: z.boolean().default(false),
  enforceDistanceRestriction: z.boolean().default(false),
  allowShiftOverlapping: z.boolean().default(false),
  isSleepoverShift: z.boolean().default(false),

  // Recurrence
  recurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  recurrenceEndDate: z.string().optional(), // ISO date string
  recurrenceDaysOfWeek: z.array(z.string()).optional(),
})

export type ShiftInput = z.infer<typeof shiftSchema>

export const shiftTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  workerId: z.string().optional(),
  serviceCategory: z.string().optional(),
  defaultStartTime: z.string().optional(), // "HH:mm"
  defaultEndTime: z.string().optional(), // "HH:mm"
  defaultSettings: z.record(z.string(), z.boolean()).optional(),
})

export type ShiftTemplateInput = z.infer<typeof shiftTemplateSchema>
