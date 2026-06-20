import { z } from "zod";

export const incidentWitnessSchema = z.object({
  id: z.string().optional(),
  incidentId: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const incidentAttachmentSchema = z.object({
  id: z.string().optional(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
});

export const incidentSchema = z.object({
  status: z.enum(["Draft", "Submitted", "UnderInvestigation", "ClosedReported", "ClosedUnreported"]).default("Draft"),
  outcomeType: z.enum(["Hazard", "Incident", "NearMiss", "Medication"]).optional().nullable(),
  regionId: z.string().min(1, "Region is required"),
  reportedById: z.string().min(1, "Reported by is required"),
  reportedByName: z.string().optional().nullable(),
  reportedAt: z.date().optional().nullable(),

  dateOfIncident: z.date().optional().nullable(),
  timeOfIncident: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  locationDetails: z.string().optional().nullable(),

  participantIds: z.array(z.string()).min(1, "At least one participant must be selected"),
  workerId: z.string().optional().nullable(),
  visitorName: z.string().optional().nullable(),
  volunteerName: z.string().optional().nullable(),
  otherPersonName: z.string().optional().nullable(),
  responsiblePersonNotified: z.boolean().default(false),

  firstAidGiven: z.boolean().default(false),
  ambulanceRequired: z.boolean().default(false),
  policeInvolved: z.boolean().default(false),
  injuries: z.boolean().default(false),
  prnGiven: z.boolean().default(false),
  medicalReview: z.boolean().default(false),

  incidentCategories: z.array(z.string()).default([]),

  summary: z.string().optional().nullable(),
  behaviourPlanExists: z.boolean().default(false),
  regulatedRestrictivePracticesUsed: z.boolean().default(false),
  taskAtTime: z.string().optional().nullable(),
  incidentEnd: z.string().optional().nullable(),
  whatHappened: z.string().optional().nullable(),
  circumstancesLeadingUp: z.string().optional().nullable(),
  immediateAction: z.string().optional().nullable(),

  injuriesToParticipant: z.boolean().default(false),
  responsiblePersonNotifiedQuestion: z.boolean().default(false),
  firstAidQuestion: z.boolean().default(false),
  ambulanceQuestion: z.boolean().default(false),
  policeQuestion: z.boolean().default(false),
  prnQuestion: z.boolean().default(false),
  medicalReviewQuestion: z.boolean().default(false),

  signatoryName: z.string().optional().nullable(),
  signatureData: z.string().optional().nullable(),

  witnesses: z.array(incidentWitnessSchema).max(5).default([]),
  attachments: z.array(incidentAttachmentSchema).max(5).default([]),
});

export const incidentInvestigationSchema = z.object({
  status: z.enum(["NotStarted", "InProgress", "Completed"]).default("InProgress"),
  isReportable: z.boolean().optional().nullable(),
  reportableDeterminedAt: z.date().optional().nullable(),

  participantNotes: z.array(z.string()).default([]),
  staffNotes: z.array(z.string()).default([]),

  advocacyOffered: z.boolean().optional().nullable(),
  advocacyDetails: z.string().optional().nullable(),

  siteVisitConducted: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  occurredDuringRoutineActivities: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  equipmentContributed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  equipmentDesignedForTask: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  equipmentMaintained: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  equipmentFailed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  riskAssessmentDone: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  safetyInstructionsProvided: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  safeWorkProceduresDocumented: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  safeWorkProceduresFollowed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  ppeUsed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  personTrained: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  knownBehaviourIssueContributed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  behaviourManagementPlanExists: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  behaviourManagementPlanFollowed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  poorHousekeepingContributed: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  workEnvironmentContributed: z.enum(["Yes", "No", "NA"]).optional().nullable(),

  rootCauseAnalysis: z.string().optional().nullable(),
  remedialActions: z.array(z.string()).default([]),
});

export const incidentReviewSchema = z.object({
  investigationSummary: z.string().optional().nullable(),
  reportable: z.boolean().optional().nullable(),
  reportableOutcome: z.string().optional().nullable(),

  riskNewRisksIdentified: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  riskMitigationRequired: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  riskRecurrenceRating: z.enum(["Nil", "Low", "Medium", "High"]).optional().nullable(),

  furtherActionNeeded: z.enum(["Yes", "No", "NA"]).optional().nullable(),
  furtherActionDetails: z.string().optional().nullable(),

  finalStatus: z.enum(["ReportedToCommission", "ClosedWithoutReporting"]).optional().nullable(),
});
