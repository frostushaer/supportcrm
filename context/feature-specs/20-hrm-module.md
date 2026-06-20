# Human Resources Management (HRM) Module - Feature Specification

---

## 1. Module Purpose

The HRM module manages:

- **Applicants** – people in the hiring pipeline.
- **Staff (Workers)** – hired team members, their profile, documents, HR settings, forms, and training.
- **Primary Portal Users** – staff who have login access and region assignments.

Screens (based on Vertex360):

1. HRM Dashboard – `/hrm`
2. All Applicants – `/hrm/applicants`
3. Applicant Profile & Assessment – `/hrm/applicants/[id]`
4. Team Management (Staff list) – `/hrm/team-management`
5. Worker Profile – `/hrm/workers/[id]`
   - Tabs: Profile, Documents, Settings, Forms, Training and Development
6. All Primary Portal Users – `/hrm/primary-portal-users`

The goal is to make these fully functional using existing Participants, Regions, Forms, and shared components.

---

## 2. Data Model (Prisma)

### 2.1 Applicant

Represents a candidate in the hiring pipeline.

Fields:

- `id`
- `firstName`
- `lastName`
- `email`
- `phoneNumber`
- `suburb`
- `appliedOn` (Date)
- `jobTitle` (string)
- `regionId` (optional – region responsible for hiring)
- `status` (enum):
  - `Applied`
  - `PhoneScreening`
  - `Interview`
  - `Pending`
  - `Offer`
  - `Hired`
  - `Rejected`
- `resumeUrl` (string, optional)
- `notes` (string, optional – internal notes)
- `interviewNotes` (string, optional)
- `createdAt`
- `updatedAt`

When an applicant is moved to `Hired`, a Worker record can be created via Applicant Assessment.

---

### 2.2 Worker (HRM staff)

Worker model already exists from earlier specs; extend it to support HRM features seen in the screenshots.

Core fields (many probably exist already – reuse, don’t duplicate):

- `id`
- `firstName`
- `lastName`
- `email`
- `phoneNumber`
- `employmentType` (enum: `Casual`, `PartTime`, `FullTime`, etc.)
- `role` (string – e.g. Support worker)
- `jobTitle` (string)
- `salarySlab` (string – e.g. “Level 1 - pay point 1`)
- `hourlyRate` (Decimal)
- `regionIds` (many‑to‑many to Region)
- `assignedParticipantIds` (many‑to‑many to Participant)
- `status` (enum: `Active`, `Inactive`)
- `joiningDate` (Date)
- `performanceReviewRequired` (boolean)
- `profilePictureUrl` (string, optional)
- `maxAllowedHours` (optional numeric)
- Payroll IDs:
  - `xeroEmployeeId`
  - `quickBooksEmployeeId`
  - `myobEmployeeId`
- `createdAt`
- `updatedAt`

Key strengths, likes & areas of improvement:

- Use a JSON field:
  - `traits` (JSON) – map of traitKey → rating (0–5).
  - Traits include those shown: Sporty, Detail‑Oriented, Goals Oriented, Resilient, Loves Talking/Chat, etc.

Availability and leave:

Create separate models.

### 2.3 WorkerLeave

Fields:

- `id`
- `workerId`
- `updatedByUserId`
- `leaveType` (string or enum)
- `startDate`
- `endDate`
- `reason` (string)
- `comments` (string)
- `status` (string or enum – e.g. Requested, Approved, Rejected)
- `createdAt`
- `updatedAt`

### 2.4 WorkerAvailability

Fields:

- `id`
- `workerId`
- `dayOfWeek` (enum: Mon–Sun)
- `availability` (string – e.g. “9am–5pm” or more structured JSON)
- `createdAt`
- `updatedAt`

### 2.5 WorkerDocumentFolder and WorkerDocument

For worker documents tab:

- `WorkerDocumentFolder`
  - `id`
  - `workerId`
  - `name` (e.g. “Required Documents”)
  - `createdAt`
  - `updatedAt`

- `WorkerDocument`
  - `id`
  - `workerId`
  - `folderId` (optional)
  - `fileName`
  - `fileUrl`
  - `fileSize`
  - `uploadedAt`

### 2.6 WorkerTrainingRecord

For “Training and Development” tab:

Fields:

- `id`
- `workerId`
- `formTemplateId` (optional link to FormTemplate, if training is a form)
- `formName` (string)
- `status` (string/enum – Assigned, Submitted, Completed, Expired)
- `createdByUserId`
- `submittedAt` (optional)
- `lastUpdatedByUserId` (optional)
- `lastUpdatedAt` (optional)
- `expiryDate` (optional)
- `version` (string, optional)
- `createdAt`
- `updatedAt`

---

### 2.7 PrimaryPortalUser

Represents a staff member with portal login & region visibility.

Fields:

- `id`
- `workerId` (link to Worker)
- `email` (portal login email)
- `status` (enum: `Active`, `Inactive`)
- `regionIds` (many‑to‑many)
- `role` (string or enum – Admin, Manager, SupportWorker, etc.)
- `createdAt`
- `updatedAt`

This can be derived from existing NextAuth User model or be a separate HRM-facing table referencing User ID; adapt to your existing auth design.

---

## 3. Screens & Flows

### 3.1 HRM Dashboard – `/hrm`

Header:

- Title: “Human Resources System”.
- Greeting banner (“Good Afternoon! [Name]”).

Summary cards:

- Applicants: Total.
- Staff: Total, Active, Inactive.
- Primary Portal Users: Total, Active, Inactive.

Navigation tiles:

- View All Applicants → `/hrm/applicants`
- View All Staff → `/hrm/team-management`
- Primary Portal Users → `/hrm/primary-portal-users`

Use KPICard or custom tiles, similar to Reporting/Participants dashboards.

---

### 3.2 All Applicants – `/hrm/applicants`

Layout (from screenshot):

- Header: “All Applicants”.
- Region selector on right.
- Status chips row:
  - Applied, Phone Screening, Interview, Pending, Offer, Hired, Rejected – each showing count.

Main list:

- Table or card list of applicants with:
  - Name
  - Email
  - Job Title
  - Applied date
  - Current status
- “Add Applicant” button opens dialog.

Add Applicant dialog:

- Fields:
  - First Name
  - Last Name
  - Applied On
  - Job Title
  - Email Address
  - Phone Number
  - Applicant Suburb
  - File attachment (resume upload)
- On submit: creates Applicant with `status = Applied`.

Clicking an applicant navigates to profile:

- `/hrm/applicants/[id]`.

---

### 3.3 Applicant Profile – `/hrm/applicants/[id]`

Top card (from screenshot):

- Avatar, name, email.
- Text: “Applied for the position of [Job Title]”.
- Applicant suburb and phone number.
- Status dropdown with pipeline statuses (Applied → Offer → Hired → Rejected etc).

Tabs/buttons:

- Profile (basic info).
- Resume (download resume).
- Notes (internal notes).
- Interview Notes.

On this page, show:

- Applicant details.
- Ability to update pipeline status.
- Button “Assessment” → `/hrm/applicants/[id]/assessment`.

### 3.4 Applicant Assessment – `/hrm/applicants/[id]/assessment`

Form fields (from screenshots):

- Applicant Name (read-only).
- Assessment Date.
- Interview Questions (textarea).
- Notes (textarea – note that these are shared with applicant).
- Status (dropdown – e.g. Hired, Rejected).
- Employee Type (Casual, etc).
- Role (select from Worker roles).
- Salary Slab (Level 1 - pay point 1, etc).
- Phone Number.
- Official Email Address.
- Password + Confirm Password (for portal access; may map to User creation).
- Notify via Email (checkbox).

Behaviour:

- When Status is set to “Hired” and form submitted:
  - Create a Worker record populated from Applicant and Assessment.
  - Optionally create a PrimaryPortalUser + User account (using official email + password).
  - Update Applicant.status to `Hired`.

- If Status is Rejected, just update Applicant status and save assessment notes.

---

### 3.5 Team Management – `/hrm/team-management`

List of staff (Workers).

Layout:

- Header: “Team Management”.
- Filter: Status dropdown (Active / Inactive / All).
- Region selector.
- Buttons:
  - “Import Worker List” (stub).
  - “+ Add Worker” – open Add Worker sheet/dialog.

Table columns:

- Full Name.
- Role.
- Email Address.
- Region.
- Status (Active/Inactive badge).
- Phone Number.
- Action (view icon → worker profile).

Pagination controls at bottom.

Add Worker:

- For v1, use a simplified version of Worker Profile > Settings form inside a sheet/dialog, or navigate straight to `/hrm/workers/new`.

---

### 3.6 Worker Profile – `/hrm/workers/[id]`

Tabs: Profile, Documents, Settings, Forms, Training And Development.

#### 3.6.1 Profile tab

Layout (based on screenshots):

- Banner image (optional).
- Left side: Quick Snapshot
  - Phone number
  - Email
  - Emergency contact name + phone
  - Role
  - Employment Type
  - Level / Salary Slab
  - Joining Date
  - Status
  - Xero ID, suburb, etc.
  - “Add Information” link to open Settings tab.

- Right side cards:
  - “Key Strengths, Likes & Areas of Improvement” – summary view of trait ratings.
  - Worker Leave table:
    - Columns: Updated By, Leave Type, Start Date, End Date, Reason, Comments, Status, Actions.
    - Empty state: “No leave requests found!”.
    - “+ Add Leave Request” button opens dialog to create WorkerLeave.
  - Worker Availability table:
    - Columns: Day, Availability.
    - “+ Add Availability” button to add WorkerAvailability records.
  - Training & Development summary: list of recent WorkerTrainingRecord.

#### 3.6.2 Documents tab

- Header: “Documents”.
- Buttons:
  - “+ Create Folder” – create WorkerDocumentFolder.
  - “Upload Document” – upload WorkerDocument (optionally into a folder).
- Show folder cards (e.g. Required Documents) and within them show documents.

#### 3.6.3 Settings tab

This is the main Worker details form.

Sections (from screenshots):

1. **Personal Information**
   - First Name
   - Last Name
   - Gender
   - Date of Birth
   - Profile Picture upload.
   - “Performance Review Required” toggle.

2. **Contact Information**
   - Email
   - Phone Number
   - Emergency Contact Name
   - Emergency Contact Number
   - Address fields: Street, Suburb, State, Postal Code.

3. **Employment / HR Settings**
   - Responsibility rating (0–5) – optional.
   - Life Experience rating (0–5) – optional.
   - Employee Type (Casual, etc).
   - Hourly Rate.
   - Role (Support worker etc).
   - Job Title.
   - Salary Slab.
   - Regions (multi-select).
   - Assigned Participants (multi-select).
   - Joining Date.
   - Max Allowed Hours.
   - Risk Assessed Roles (boolean + text box).
   - Trait ratings list (“Key Strengths, Likes & Areas of Improvement” – star rating 0–5 for each trait).

4. **Payrolls**
   - Xero Employee ID + “Connect Xero” link (stub).
   - QuickBooks Employee ID + “Connect QuickBook” (stub).
   - MYOB Payroll – “Connect MYOB” (stub).

5. **Deactivate / Delete**
   - “Deactivate User” button: sets status to Inactive.
   - “Delete Worker” button: soft delete or hard delete (your choice; for spec, soft delete via status is enough).

Button at bottom-right: “Update Setting” to save all changes.

#### 3.6.4 Forms tab

This should integrate with your existing Forms HRM module:

- Dropdown to select a form category/template.
- List of forms assigned/completed by this worker (e.g., policies acknowledgements).
- Actions: View / Complete / Edit form – reusing existing FormSubmission logic.

#### 3.6.5 Training And Development tab

Table of WorkerTrainingRecord:

- Columns:
  - Form Name
  - Status
  - Created By
  - Submitted Date
  - Last Updated By
  - Last Updated Date
  - Expiry Date
  - Version
  - Actions (view, mark complete, etc.)
- Filter dropdown for status.
- “+ Training and Development” button to assign new training (choose template, due date, etc).

---

### 3.7 Primary Portal Users – `/hrm/primary-portal-users`

Layout:

- Header: “All Primary Portal Users”.
- Subheading: “All primary portal users in one place”.
- Status filter dropdown: Active / Inactive.
- Region selector.
- “+ Add Primary Portal User” button.

Table columns:

- Name.
- Email.
- Status.
- Regions.
- Role.

Add Primary Portal User:

- Choose existing Worker.
- Email (portal email).
- Role.
- Regions access.
- Status (Active by default).
- Optionally create/update auth User record and link.

---

## 4. API & Hooks

### 4.1 API Endpoints

Applicants:

- `GET /api/hrm/applicants`
  - Filters: status, regionId, search.
- `POST /api/hrm/applicants`
  - Create new applicant.
- `GET /api/hrm/applicants/[id]`
- `PATCH /api/hrm/applicants/[id]`
  - Update details and status.
- `DELETE /api/hrm/applicants/[id]` (optional).

Applicant assessment:

- `POST /api/hrm/applicants/[id]/assessment`
  - Saves assessment data.
  - If status = Hired:
    - Creates Worker (and optionally PrimaryPortalUser/User).
    - Updates Applicant.status to Hired.

Workers:

- `GET /api/workers` (already exists – extend filters for HRM listing).
- `GET /api/workers/[id]`
- `PATCH /api/workers/[id]` – update Settings.
- `POST /api/workers` – create new Worker.
- `PATCH /api/workers/[id]/deactivate` – set status to Inactive.

Worker leaves:

- `GET /api/workers/[id]/leaves`
- `POST /api/workers/[id]/leaves`
- `PATCH /api/hrm/leaves/[leaveId]`
- `DELETE /api/hrm/leaves/[leaveId]` (optional).

Worker availability:

- Similar endpoints under `/api/workers/[id]/availability`.

Worker documents & folders:

- `GET /api/workers/[id]/folders`
- `POST /api/workers/[id]/folders`
- `GET /api/workers/[id]/documents`
- `POST /api/workers/[id]/documents`

Worker training:

- `GET /api/workers/[id]/training`
- `POST /api/workers/[id]/training`
- `PATCH /api/hrm/training/[trainingId]`

Primary Portal Users:

- `GET /api/hrm/primary-portal-users`
  - Filters: status, regionId, search.
- `POST /api/hrm/primary-portal-users`
- `PATCH /api/hrm/primary-portal-users/[id]`
- `DELETE /api/hrm/primary-portal-users/[id]` (optional).

All routes validated with Zod schemas in `lib/validations/hrm.ts`.

---

### 4.2 Hooks (TanStack Query)

Create `hooks/use-hrm.ts` (or separate files) with hooks:

Applicants:

- `useApplicants(filters)`
- `useApplicant(id)`
- `useCreateApplicant()`
- `useUpdateApplicant()`
- `useAssessApplicant()` // for assessment/hiring

Workers:

- `useWorkers(filters)`
- `useWorker(id)`
- `useCreateWorker()`
- `useUpdateWorker()`
- `useDeactivateWorker()`

Worker extras:

- `useWorkerLeaves(workerId)`
- `useCreateWorkerLeave(workerId)`
- `useUpdateWorkerLeave()`
- `useWorkerAvailability(workerId)`
- `useUpdateWorkerAvailability()`
- `useWorkerDocuments(workerId)`
- `useWorkerTraining(workerId)`

Primary portal users:

- `usePortalUsers(filters)`
- `useCreatePortalUser()`
- `useUpdatePortalUser()`

All hooks:

- Use `selectedRegionId` from region store where relevant.
- Follow the pattern used in participants/reporting.

---

## 5. UI Components

Suggested new components:

- `components/hrm/dashboard-cards.tsx`
- `components/hrm/applicant-list.tsx`
- `components/hrm/applicant-assessment-form.tsx`
- `components/hrm/worker-list.tsx`
- `components/hrm/worker-profile/*` (ProfilePanel, SettingsForm, DocumentsPanel, TrainingTable).
- `components/hrm/portal-users-table.tsx`

All components should reuse:

- `PageHeader`
- `KPICard`
- `StatusBadge`
- `DataTable`
- `EmptyState`
- Forms: `react-hook-form` + `standardSchemaResolver`.

---

## 6. Success Criteria

The HRM module is complete when:

- `/hrm` dashboard shows counts and navigation tiles.
- Applicants can be added, viewed, moved through statuses, and assessed; hiring an applicant creates a worker (and optionally a portal user).
- Team Management staff list shows workers, filters by status and region, and links to worker profiles.
- Worker Profile tabs (Profile, Documents, Settings, Forms, Training and Development) all load real data and allow updates where expected.
- Primary Portal Users page lists users, filters by status/region, and allows adding/updating records.
- All pages respect the global Region selector.
- `pnpm build` and `pnpm lint` pass with no errors.