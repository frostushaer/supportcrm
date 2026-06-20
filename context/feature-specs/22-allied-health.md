# Allied Health Module - Feature Specification

---

## 1. Module Purpose

The Allied Health module is structurally the same as Support Coordination (COS) but focused on Allied Health services and workers.

It provides:

- Allied Health dashboard (billable hours, clients, leaderboard).
- Participant list for Allied Health clients.
- Allied Health service catalogue.
- External service providers.
- Case note history.
- NDIS claims.
- Allied Health invoices.
- Reporting.

Everything should reuse COS patterns, types, and components where possible, with minimal duplication.

---

## 2. Data Model (Prisma)

Preferred approach: **reuse the COS models with a “stream” or “program” discriminator**, instead of creating an entirely new set.

Add an enum:

- `ProgramType` enum:
  - `COS`
  - `AlliedHealth`

Then:

1. Extend these existing COS models to include `program`:

- `CosParticipantProfile`
- `CosFunding`
- `CosSupportCatalogueItem`
- `ExternalServiceProvider`
- `CosCaseNote`
- `NdisClaim`
- `CosInvoice`

Each gets:

- `program ProgramType @default(COS)`

For Allied Health use:

- All Allied Health records are the same tables but with `program = AlliedHealth`.

No new Prisma tables are needed; the “Allied Health” module is a filtered view over the same data.

---

## 3. Screens & Flows (Allied Health)

All pages live under `/ah` and mirror `/cos`, but:

- Replace “Coordination Of Support” with “Allied Health”.
- Replace “Support Coordinators” with “Allied Health Workers”.
- Replace “COS Clients” with “Allied Health Clients”.

### 3.1 Allied Health Dashboard – `/ah`

Header:

- Title: “Allied Health”.
- Region selector.

Tiles row (same order as COS):

- Participant List → `/ah/participants`
- Catalogue Service → `/ah/catalogue-services`
- Service Providers → `/ah/service-providers`
- Case Note History → `/ah/case-notes-history`
- NDIS Claims → `/ah/ndis-claims`
- Invoices → `/ah/invoices`
- Reporting → `/ah/reporting`

Filter:

- “Filter by Allied Health Workers” dropdown (Worker list filtered by Allied Health roles).

Cards:

- Billable Hours – total billable hours and total amount last week for Allied Health case notes.
- Weekly Hours Breakdown – chart of billable vs non-billable for Allied Health.
- Total Allied Health Clients – count of participants with `CosParticipantProfile.program = AlliedHealth`.
- Leaderboard – Allied Health workers, with billable hours and number of active Allied Health clients.

All numbers are computed by reusing COS dashboard logic but with `program = AlliedHealth`.

---

### 3.2 Participant List – `/ah/participants`

Identical to `/cos/participants` but filtered by `program = AlliedHealth`.

Table columns:

- Participant Name.
- Management Style.
- Service Region.
- NDIS No.
- Plan Start Date.
- Plan End Date.
- Quick Snapshot.

Filters:

- Management Style (Both / Agency / Plan Managed / Self Managed).
- Status (All / Active / Inactive).
- Search.
- Region selector.

Clicking a participant opens your existing Participant profile page.

Under the hood:

- Use `CosParticipantProfile` + Participant with `program = AlliedHealth`.

---

### 3.3 Catalogue Services – `/ah/catalogue-services`

Same as `/cos/catalogue-services`, but only showing rows with `program = AlliedHealth`.

Header: “Catalogue Services”.

Controls:

- Catalogue chips (e.g. “AH Price Catalogue 2023-24”, etc., if you add separate labels).
- Category filter.
- Search.
- Region selector.

Table:

- Support Item Number.
- Support Item Name.
- Support Category Name.
- Action.

---

### 3.4 External Service Providers – `/ah/service-providers`

Same UI as `/cos/service-providers`, just scoped to Allied Health.

- Filters and table identical.
- “+ Service Provider” creates an `ExternalServiceProvider` with `program = AlliedHealth`.

---

### 3.5 Case Note History – `/ah/case-notes-history`

Copy of `/cos/case-notes-history` but:

- Header: “Case Notes History”.
- Filter label: “Allied Health Workers” (for worker dropdown, if shown).
- All queries only return `CosCaseNote` records where `program = AlliedHealth`.

Columns remain:

- Participant, Funding ID, Note Contact Type, Created Date, Created By, Delivered Date, Duration, Km, Amount, Status, Service Region, Note.

---

### 3.6 NDIS Claims – `/ah/ndis-claims`

Same as `/cos/ndis-claims`:

- Claim type dropdown.
- Region selector.
- “+ NDIS Claim” button.
- Table columns: Reference, Participant, Created By, Created Date, Delivered From, Delivered To, Case Notes, Total Amount, Status, Action.

Implementation:

- Use the same `NdisClaim` table, but set `program = AlliedHealth` for records created here and filter by that for listing.

---

### 3.7 Allied Health Invoices – `/ah/invoices`

Equivalent to `/cos/invoices`:

- Invoice type dropdown (Participant based).
- Show invoices for (All participants / specific).
- Region selector.
- Bulk action (Action dropdown).
- “+ Allied Health Invoice” button (label can be “+ AH Invoice” or “+ Invoice”).

Table:

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

Backend:

- Uses `CosInvoice` with `program = AlliedHealth`.

---

### 3.8 Allied Health Reporting – `/ah/reporting`

Similar to `/cos/reporting`.

Filters:

- Select Report (start with Funding).
- Participant.
- Allied Health Workers.
- Created Date Range.
- Buttons: Search, Clear Filter.
- Export button.

Funding report columns:

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

Data: same aggregation logic as COS, but restricted to `program = AlliedHealth`.

---

## 4. API & Hooks

### 4.1 API Endpoints

**Reuse the existing COS endpoints**, but extend them to accept a `program` parameter and create thin Allied Health routes that forward `program = AlliedHealth`.

Option A (preferred): introduce `program` query param.

For example, under `/api/cos`:

- `GET /api/cos/participants?program=AlliedHealth`
- `GET /api/cos/service-providers?program=AlliedHealth`
- `GET /api/cos/case-notes?program=AlliedHealth`
- `GET /api/cos/ndis-claims?program=AlliedHealth`
- `GET /api/cos/invoices?program=AlliedHealth`
- `GET /api/cos/funding?program=AlliedHealth`

And POST/PATCH endpoints accept `program` in the body or infer it from the route.

Option B: Add `/api/ah/*` routes that internally call the same service functions with `program = AlliedHealth` (no separate Prisma code).

For clarity in the spec:

- Implement wrappers under `/api/ah/*` that call shared COS service layer with `program = AlliedHealth`.
- Example:
  - `/api/ah/participants` → calls `getCosParticipants({ program: 'AlliedHealth', ...filters })`.

### 4.2 Hooks (TanStack Query)

Reuse `hooks/use-cos.ts` logic in a new file `hooks/use-allied-health.ts`, or generalize to a common hook that accepts `program`.

Simplest spec:

- New hooks in `hooks/use-allied-health.ts`:

Dashboard / common:

- `useAhDashboardSummary(filters)` – calls COS dashboard summary with `program = AlliedHealth`.

Participants:

- `useAhParticipants(filters)`

Catalogue:

- `useAhCatalogue(filters)`

Service providers:

- `useAhServiceProviders(filters)`
- `useCreateAhServiceProvider()`
- `useUpdateAhServiceProvider()`

Case notes:

- `useAhCaseNotes(filters)`

NDIS claims:

- `useAhNdisClaims(filters)`
- `useAhNdisClaim(id)`
- `useCreateAhNdisClaim()`
- `useUpdateAhNdisClaim()`

Invoices:

- `useAhInvoices(filters)`
- `useAhInvoice(id)`
- `useCreateAhInvoice()`
- `useUpdateAhInvoice()`

Reporting:

- `useAhFundingReport(filters)`

Internally, each hook either:

- Calls the corresponding `/api/ah/*` endpoint, or
- Reuses `useCos…` hook logic with `program: 'AlliedHealth'` baked in, depending on how you share the code.

All hooks:

- Include `selectedRegionId` in the query key and request, same as COS.

---

## 5. UI Components & Pages

Pages under `app/(dashboard)/ah/`:

- `page.tsx` → dashboard.
- `participants/page.tsx`
- `catalogue-services/page.tsx`
- `service-providers/page.tsx`
- `case-notes-history/page.tsx`
- `ndis-claims/page.tsx`
- `invoices/page.tsx`
- `reporting/page.tsx`

Each page:

- Can reuse the same components as COS but with different titles and hook imports.
- Example: `components/cos/dashboard.tsx` could accept a `program` and a label; Allied Health dashboard just passes `program="AlliedHealth"` and label overrides.

Success Criteria:

- All Allied Health pages render correctly and show the same behaviours as COS pages.
- Data creation in Allied Health flows persists to the shared tables with `program = AlliedHealth`.
- `pnpm build` and `pnpm lint` pass with no errors.
- `context/progress-tracker.md` updated with **Allied Health module COMPLETE**.
