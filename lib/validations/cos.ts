import { z } from "zod";

// Shared common fields
const baseSchema = z.object({
  id: z.string().optional(),
  program: z.enum(['COS', 'AlliedHealth']).default("COS"),
  createdAt: z.string().optional().or(z.date().optional()),
  updatedAt: z.string().optional().or(z.date().optional()),
});

export const cosParticipantProfileSchema = baseSchema.extend({
  participantId: z.string().min(1, "Participant ID is required"),
  managementStyle: z.string().min(1, "Management Style is required"),
  serviceRegionId: z.string().min(1, "Service Region ID is required"),
  ndisNumber: z.string().min(1, "NDIS Number is required"),
  planStartDate: z.string().optional().nullable(),
  planEndDate: z.string().optional().nullable(),
  quickSnapshot: z.string().optional().nullable(),
});

export const cosFundingSchema = baseSchema.extend({
  participantId: z.string().min(1, "Participant ID is required"),
  cosCoordinatorWorkerId: z.string().optional().nullable(),
  serviceName: z.string().min(1, "Service Name is required"),
  serviceTotalBudget: z.number().min(0),
  fundingStartDate: z.string().min(1, "Start Date is required"),
  fundingEndDate: z.string().min(1, "End Date is required"),
  totalFunding: z.number().min(0),
  fundingRemaining: z.number(),
  fundingDelivered: z.number(),
  notes: z.string().optional().nullable(),
});

export const cosSupportCatalogueItemSchema = baseSchema.extend({
  supportItemNumber: z.string().min(1, "Item Number is required"),
  supportItemName: z.string().min(1, "Item Name is required"),
  supportCategoryName: z.string().min(1, "Category is required"),
  priceCatalogueLabel: z.string().min(1, "Catalogue Label is required"),
  price: z.number().min(0),
  isActive: z.boolean().default(true),
});

export const externalServiceProviderSchema = baseSchema.extend({
  name: z.string().min(1, "Provider Name is required"),
  contactInformation: z.string().optional().nullable(),
  billingContact: z.string().optional().nullable(),
  regionIds: z.array(z.string()).default([]),
});

export const cosCaseNoteSchema = baseSchema.extend({
  participantId: z.string().min(1, "Participant ID is required"),
  fundingId: z.string().optional().nullable(),
  serviceRegionId: z.string().min(1, "Region ID is required"),
  supportCoordinatorId: z.string().min(1, "Coordinator ID is required"),
  deliveredDate: z.string().min(1, "Delivered Date is required"),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  kilometres: z.number().optional().nullable(),
  amount: z.number().min(0),
  noteContactType: z.string().min(1, "Contact Type is required"),
  caseNoteText: z.string().min(1, "Case Note Text is required"),
  status: z.string().default("Draft"),
  createdByUserId: z.string().min(1, "Created By User ID is required"),
});

export const ndisClaimSchema = baseSchema.extend({
  reference: z.string().min(1, "Reference is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  regionId: z.string().min(1, "Region ID is required"),
  claimType: z.string().min(1, "Claim Type is required"),
  deliveredFrom: z.string().min(1, "Delivered From is required"),
  deliveredTo: z.string().min(1, "Delivered To is required"),
  totalAmount: z.number().min(0),
  status: z.string().default("Draft"),
  caseNotesSummary: z.string().optional().nullable(),
  caseNoteIds: z.array(z.string()).default([]),
  createdByUserId: z.string().min(1, "Created By is required"),
});

export const cosInvoiceSchema = baseSchema.extend({
  reference: z.string().min(1, "Reference is required"),
  invoiceType: z.string().min(1, "Invoice Type is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  regionId: z.string().min(1, "Region ID is required"),
  serviceDeliveredFrom: z.string().min(1, "Service Delivered From is required"),
  serviceDeliveredTo: z.string().min(1, "Service Delivered To is required"),
  numDeliveredServices: z.number().min(0),
  totalValue: z.number().min(0),
  status: z.string().default("Draft"),
  caseNoteIds: z.array(z.string()).default([]),
  createdByUserId: z.string().min(1, "Created By is required"),
});
