# Support Coordination (COS) Module - Feature Specification

---

## 1. Module Purpose

The Support Coordination (COS) module helps track:

- COS participants and their funding.
- NDIS service catalogue items.
- External service providers.
- Case notes and their billing history.
- NDIS claims and COS invoices.
- COS reporting (funding and service delivery).

Main areas (from Vertex360):

1. COS Dashboard – `/cos`
2. Participant List – `/cos/participants`
3. Catalogue Services – `/cos/catalogue-services`
4. External Service Providers – `/cos/service-providers`
5. Case Note History – `/cos/case-notes-history`
6. NDIS Claims – `/cos/ndis-claims`
7. COS Invoices – `/cos/invoices`
8. Reporting – `/cos/reporting`

---

## 2. Data Model (Prisma)

### 2.1 CosParticipantProfile

Extends existing Participant with COS‑specific fields.

Fields:

- `id`
- `participantId` (FK to Participant)
- `managementStyle` (enum/string – e.g. Agency, Plan Managed, Self Managed, Both)
- `serviceRegionId` (Region)
- `ndisNumber` (string)
- `planStartDate` (Date)
- `planEndDate` (Date)
- `quickSnapshot` (string, optional – one‑line summary)
- `createdAt`
- `updatedAt`

---

### 2.2 CosFunding (per participant)

Represents a COS funding line used in reporting.

Fields:

- `id`
- `participantId`
- `cosCoordinatorWorkerId` (optional FK to Worker)
- `serviceName` (string – e.g. “Support Coordination Level 2”)
- `serviceTotalBudget` (Decimal)
- `fundingStartDate` (Date)
- `fundingEndDate` (Date)
- `totalFunding` (Decimal)        // alias of budget if needed
- `fundingRemaining` (Decimal)
- `fundingDelivered` (Decimal)
- `notes` (string, optional)
- `createdAt`
- `updatedAt`

Funding will be driven mainly by case notes, claims, and invoices.

---

### 2.3 CosSupportCatalogueItem

Catalogue service item row (from “Catalogue Services” screen).

Fields:

- `id`
- `supportItemNumber` (string)
- `supportItemName` (string)
- `supportCategoryName` (string)
- `priceCatalogueLabel` (string – e.g. “NDIS Support Catalogue 2024-25”)
- `price` (Decimal)
- `isActive` (boolean)
- `createdAt`
- `updatedAt`

This list can be seeded (like NDIS services) and mostly read‑only in the UI.

---

### 2.4 ExternalServiceProvider

Fields:

- `id`
- `name` (Service Provider)
- `contactInformation` (string – address, phone, email)
- `billingContact` (string – contact person)
- `regionIds` (many‑to‑many to Region)
- `createdAt`
- `updatedAt`

---

### 2.5 CosCaseNote

Case note entry (used for history, claims, and invoices).

Fields:

- `id`
- `participantId`
- `fundingId` (optional FK to CosFunding)
- `serviceRegionId` (Region)
- `supportCoordinatorId` (Worker)
- `deliveredDate` (Date)
- `durationMinutes` (int)
- `kilometres` (Decimal, optional)
- `amount` (Decimal)
- `noteContactType` (enum/string – e.g. Phone, Email, FaceToFace)
- `caseNoteText` (string)
- `createdByUserId`
- `createdAt`
- `status` (enum/string – e.g. Draft, ReadyForClaim, Claimed, Invoiced)

Used by Case Notes History, NDIS claims (case‑note‑based), and COS invoices.

---

### 2.6 NdisClaim

NDIS claim entry (from NDIS Claims screen).

Fields:

- `id`
- `reference` (string, unique)
- `participantId`
- `claimType` (enum/string – e.g. CaseNoteBased, Manual)
- `createdByUserId`
- `createdAt`
- `deliveredFrom` (Date)
- `deliveredTo` (Date)
- `totalAmount` (Decimal)
- `status` (enum/string – e.g. Draft, Submitted, Paid, Rejected)
- `caseNotesSummary` (string, optional)
- `regionId`
- `createdAt`
- `updatedAt`

Optional link table:

- `NdisClaimCaseNote` (`claimId`, `caseNoteId`) if you want to attach multiple case notes.

---

### 2.7 CosInvoice

COS invoice (from “Cos Invoices” screen).

Fields:

- `id`
- `reference` (string, unique)
- `invoiceType` (enum: `ParticipantBased`, `Other` for future)
- `participantId`
- `createdByUserId`
- `createdAt`
- `serviceDeliveredFrom` (Date)
- `serviceDeliveredTo` (Date)
- `numDeliveredServices` (int)
- `totalValue` (Decimal)
- `status` (enum/string – Draft, Sent, Paid, Cancelled)
- `regionId`
- `createdAt`
- `updatedAt`

Optional link:

- `CosInvoiceCaseNote` (`invoiceId`, `caseNoteId`).

---

## 3. Screens & Flows

### 3.1 COS Dashboard – `/cos`

Header:

- Title: “Coordination Of Support”.
- Region selector.

Tiles row (buttons):

- Participant List
- Catalogue Service
- Service Providers
- Case Note History
- NDIS Claims
- Invoices
- Reporting

Below tiles:

1. **Billable Hours card**
   - Shows total billable hours (`sum(durationMinutes)/60`) in a time window (last week by default) and total amount.
2. **Weekly Hours Breakdown chart**
   - Stacked or grouped bars: Billable vs Non‑Billable hours per day.
3. **Total COS Clients**
   - Count of COS participants (CosParticipantProfile).
4. **Leaderboard**
   - Table by Support Coordinator:
     - Name, Email, Number of Active Participants, Billable Hours this period.

Use existing KPICard and chart components.

---

### 3.2 Participant List – `/cos/participants`

Table columns (from screenshot):

- Participant Name.
- Management Style.
- Service Region.
- NDIS No.
- Plan Start Date.
- Plan End Date.
- Quick Snapshot.

Filters:

- Type (dropdown: “Both”, “Agency”, “Plan Managed”, “Self Managed”, etc).
- Another dropdown (e.g. Active/Inactive) – treat as COS participant filter.
- Search box.
- Region selector.

Clicking a participant opens the existing Participant profile page, not a new COS page.

---

### 3.3 Catalogue Services – `/cos/catalogue-services`

Header: “Catalogue Services”.

Elements:

- Pills / buttons for price catalogues:
  - E.g. “Price Catalog for Year 2020 to 2021”, “NDIS Support Catalogue 2023‑24”, “NDIS Support Catalogue 2024‑25”.
- Region selector.

Table columns:

- Support Item Number.
- Support Item Name.
- Support Category Name.
- Action (view icon / open details).

Filters:

- Simple dropdown filter (e.g. Category).
- Search box.

Functionality:

- Read‑only list of `CosSupportCatalogueItem`.
- For v1, no create/edit UI (seed via script).

---

### 3.4 External Service Providers – `/cos/service-providers`

Header: “External Service Providers”.

Elements:

- Region selector.
- “+ Service Provider” button (opens create dialog).
- Search box.

Table columns:

- Service Provider (name).
- Contact Information.
- Billing Contact.
- Actions (view / edit / delete).

Add/Edit Service Provider dialog:

- Name.
- Contact Information.
- Billing Contact.
- Regions (multi-select).
- Save / Cancel.

---

### 3.5 Case Note History – `/cos/case-notes-history`

Header: “Case Notes History”.

Filters:

- Participant (select from Participants who have COS profile).
- Note Contact Type (dropdown).
- Delivered Date Range (From, To).
- Buttons: Search, Clear Filter.
- Export button (exports results to CSV/Excel).

Table columns (per screenshot):

- Participant.
- Funding ID.
- Note Contact Type.
- Created Date.
- Created By.
- Delivered Date.
- Duration.
- Km.
- Amount.
- Status.
- Service Region.
- Note (preview or icon to view full note).

Data source: `CosCaseNote` joined with Participant, CosFunding, Worker, and Region.

---

### 3.6 NDIS Claims – `/cos/ndis-claims`

Header: “NDIS Claims”.

Filters:

- Claim type (dropdown – e.g. Case note based).
- Region selector.
- “+ NDIS Claim” button.

Table columns:

- Reference.
- Participant.
- Created By.
- Created Date.
- Delivered From.
- Delivered To.
- Case Notes.
- Total Amount.
- Status.
- Action.

New NDIS Claim flow:

- Clicking “+ NDIS Claim” opens a page or dialog:
  - Choose Participant.
  - Choose date range (delivered from/to).
  - Show list/summary of matching `CosCaseNote` entries and calculated total.
  - Allow editing of total amount and notes.
  - Save as `NdisClaim` with status Draft or Submitted.

---

### 3.7 COS Invoices – `/cos/invoices`

Header: “Cos Invoices”.

Filters:

- Invoice type (dropdown: Participant based).
- Show invoices for (dropdown: All participants / specific participant).
- Region selector.
- Bulk action (Action dropdown – future: Generate PDF, Export etc).
- “+ Cos Invoice” button.

Table columns:

- Reference.
- Participant.
- Created By.
- Created Date.
- Service Delivered From.
- Service Delivered To.
- Num Delivered Services.
- Total Value.
- Status.
- Actions.

New Invoice flow:

- “+ Cos Invoice” opens page/dialog:
  - Invoice type (default ParticipantBased).
  - Participant.
  - Date range.
  - Pull eligible case notes that are not already invoiced.
  - Calculate number of services and total value.
  - Save `CosInvoice` and mark linked case notes as Invoiced or keep link table.

---

### 3.8 Reporting – `/cos/reporting`

Header: “Reporting”.

Filters:

- Select Report (dropdown):
  - Funding (as in screenshot).
  - Service Usage (future).
- Participant.
- Support Coordinators.
- Created Date Range (From, To).
- Buttons: Search, Clear Filter.
- Export button.

Funding report table columns:

- Participant Name.
- NDIS No.
- Funding Start Date.
- Funding End Date.
- Total Funding.
- Funding Remaining.
- Funding Delivered.
- Notes.
- Service Name.
- Service Total Budget.
- Service Remaining.
- Service Delivered.

Data drawn from `CosFunding` and aggregated case notes / invoices.

---

## 4. API & Hooks

### 4.1 API Endpoints

All endpoints under `/api/cos/*` (App Router).

Participants:

- `GET /api/cos/participants`
  - Joins Participant + CosParticipantProfile.
  - Filters: managementStyle, activeStatus, regionId, search.

Catalogue:

- `GET /api/cos/catalogue-services`
  - Filters: priceCatalogueLabel, category, search.

Service providers:

- `GET /api/cos/service-providers`
- `POST /api/cos/service-providers`
- `PATCH /api/cos/service-providers/[id]`
- `DELETE /api/cos/service-providers/[id]` (optional).

Case notes:

- `GET /api/cos/case-notes`
  - Filters: participantId, noteContactType, deliveredFrom, deliveredTo, regionId.
- (Create/update case notes may exist in another module; if not, add `POST` / `PATCH` as needed.)

NDIS claims:

- `GET /api/cos/ndis-claims`
- `POST /api/cos/ndis-claims`
- `GET /api/cos/ndis-claims/[id]`
- `PATCH /api/cos/ndis-claims/[id]`

Invoices:

- `GET /api/cos/invoices`
- `POST /api/cos/invoices`
- `GET /api/cos/invoices/[id]`
- `PATCH /api/cos/invoices/[id]`

Funding:

- `GET /api/cos/funding`
  - For reporting: filters by participantId, coordinatorId, createdFrom/To, regionId.

Catalogue seeding:

- Optional internal `POST /api/cos/catalogue-services/seed` used in dev only.

All inputs validated with Zod schemas in `lib/validations/cos.ts`.

---

### 4.2 Hooks (TanStack Query)

Create `hooks/use-cos.ts` with:

Dashboard / common:

- `useCosDashboardSummary(filters)` – billable hours, clients count, leaderboard.

Participants:

- `useCosParticipants(filters)`

Catalogue:

- `useCosCatalogue(filters)`

Service providers:

- `useServiceProviders(filters)`
- `useCreateServiceProvider()`
- `useUpdateServiceProvider()`

Case notes:

- `useCaseNotes(filters)`

NDIS claims:

- `useNdisClaims(filters)`
- `useNdisClaim(id)`
- `useCreateNdisClaim()`
- `useUpdateNdisClaim()`

Invoices:

- `useCosInvoices(filters)`
- `useCosInvoice(id)`
- `useCreateCosInvoice()`
- `useUpdateCosInvoice()`

Reporting:

- `useCosFundingReport(filters)`

All hooks:

- Use `selectedRegionId` from region store in query keys and APIs.
- Mirror patterns used in Reporting/HRM hooks.

---

## 5. UI Components

New components:

- `components/cos/dashboard-cards.tsx`
- `components/cos/participant-list.tsx`
- `components/cos/catalogue-table.tsx`
- `components/cos/service-providers-table.tsx`
- `components/cos/case-notes-history-table.tsx`
- `components/cos/ndis-claims-table.tsx`
- `components/cos/cos-invoices-table.tsx`
- `components/cos/funding-report-table.tsx`

Pages:

- `app/(dashboard)/cos/page.tsx` or `/cos/dashboard`
- `app/(dashboard)/cos/participants/page.tsx`
- `app/(dashboard)/cos/catalogue-services/page.tsx`
- `app/(dashboard)/cos/service-providers/page.tsx`
- `app/(dashboard)/cos/case-notes-history/page.tsx`
- `app/(dashboard)/cos/ndis-claims/page.tsx`
- `app/(dashboard)/cos/invoices/page.tsx`
- `app/(dashboard)/cos/reporting/page.tsx`

Each page:

- Uses `PageHeader`, `KPICard`, `DataTable`, `EmptyState`, `StatusBadge`.
- Respects global Region selector.

---

## 6. Success Criteria

COS module is complete when:

- `/cos` dashboard shows billable hours, weekly breakdown, total COS clients, and coordinator leaderboard.
- Participant List, Catalogue Services, Service Providers, Case Notes History, NDIS Claims, Invoices, and Reporting pages all load from real data and support their filters.
- NDIS Claims and COS Invoices can be created based on case note data.
- Funding Reporting returns correct aggregated funding and service information.
- All new endpoints and hooks are typed and pass `pnpm build` and `pnpm lint` with 0 errors.