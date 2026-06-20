# Incident Management Module - Feature Specification

---

## 1. Module Purpose

The Incident Management module lets users:

- Create and edit detailed incident reports involving participants, workers, visitors, or others.
- Track an incident lifecycle from Draft → Submitted (Pending Investigation) → Under Investigation → Closed.
- Capture all NDIS‑style compliance data for reportable incidents.
- View an Incident dashboard with metrics, filters, and a table of incidents.
- Perform Investigation and Review & Close workflows on each incident.

Screens to implement (mirroring Vertex360):

1. Incident Management Dashboard
2. New / Resume Incident Report (multi‑step wizard)
3. View Incident
4. Investigation (Start/Edit Investigation)
5. Review & Close Incident

---

## 2. Data Model (Prisma)

### 2.1 Incident

Represents a single incident.

Fields:

- `id`
- `incidentNumber` (string, e.g. “IN-40723”, unique)
- `status` (enum)
  - `Draft`
  - `Submitted`          // “Pending Investigation”
  - `UnderInvestigation`
  - `ClosedReported`
  - `ClosedUnreported`
- `outcomeType` (enum)
  - `Hazard`
  - `Incident`
  - `NearMiss`
  - `Medication`
- `regionId` (Region relation)
- `reportedByUserId` (User)
- `reportedByName` (string snapshot)
- `reportedAt` (DateTime)

Incident timing & location:

- `dateOfIncident` (Date)
- `timeOfIncident` (DateTime or time-as-string)
- `address` (string, optional)
- `location` (string, optional)
- `locationDetails` (string, optional)

People involved:

- Many‑to‑many to Participant (main participants)
- Optional `workerId` (Worker)
- `visitorName` (string, optional)
- `volunteerName` (string, optional)
- `otherPersonName` (string, optional)
- `responsiblePersonNotified` (boolean)

Response summary flags:

- `firstAidGiven` (boolean)
- `ambulanceRequired` (boolean)
- `policeInvolved` (boolean)
- `injuries` (boolean)
- `prnGiven` (boolean)
- `medicalReview` (boolean)

Incident categorisation:

- `incidentCategories` (string[] or enum[]):
  - Abuse Of A PWD
  - Unlawful Physical Contact
  - Theft
  - Death Of A PWD
  - Neglect Of A PWD
  - Alleged Theft
  - Unlawful Sexual Contact
  - Behaviour
  - Serious Injury of a PWD
  - Sexual Misconduct
  - Non‑serious injury of a PWD
  - Travel (Company Car)
  - Travel (Worker Car)
  - Travel (Public Transport)
  - Others

Narrative / context:

- `summary` (string) – “Summarise the incident and/or allegation”
- `behaviourPlanExists` (boolean)
- `regulatedRestrictivePracticesUsed` (boolean)
- `taskAtTime` (string)
- `incidentEnd` (string)
- `whatHappened` (string)
- `circumstancesLeadingUp` (string)
- `immediateAction` (string)

Additional compliance:

- `injuriesToParticipant` (boolean)
- `responsiblePersonNotifiedQuestion` (boolean)
- `firstAidQuestion` (boolean)
- `ambulanceQuestion` (boolean)
- `policeQuestion` (boolean)
- `prnQuestion` (boolean)
- `medicalReviewQuestion` (boolean)

Sign‑off:

- `signatoryName` (string)
- `signatureData` (string)   // raw signature or URL

Audit:

- `createdAt`
- `updatedAt`

Relations:

- `witnesses` – IncidentWitness[]
- `attachments` – IncidentAttachment[]
- `investigation` – IncidentInvestigation?
- `review` – IncidentReview?

---

### 2.2 IncidentWitness

Fields:

- `id`
- `incidentId`
- `firstName`
- `lastName`
- `dateOfBirth` (Date, optional)
- `gender` (string or enum)
- `address` (string, optional)
- `createdAt`
- `updatedAt`

Max 5 per incident (enforced in UI, not necessarily DB).

---

### 2.3 IncidentAttachment

Fields:

- `id`
- `incidentId`
- `fileName`
- `fileUrl`
- `fileSize` (int)
- `uploadedAt`

---

### 2.4 IncidentInvestigation

Fields:

- `id`
- `incidentId`
- `status` (enum: `NotStarted`, `InProgress`, `Completed`)
- `isReportable` (boolean)
- `reportableDeterminedAt` (DateTime, optional)

Interview notes:

- `participantNotes` (string[] JSON)
- `staffNotes` (string[] JSON)

Advocacy:

- `advocacyOffered` (boolean)
- `advocacyDetails` (string)

Investigation checks: 17 fields storing `Yes` / `No` / `NA` (enum):

- `siteVisitConducted`
- `occurredDuringRoutineActivities`
- `equipmentContributed`
- `equipmentDesignedForTask`
- `equipmentMaintained`
- `equipmentFailed`
- `riskAssessmentDone`
- `safetyInstructionsProvided`
- `safeWorkProceduresDocumented`
- `safeWorkProceduresFollowed`
- `ppeUsed`
- `personTrained`
- `knownBehaviourIssueContributed`
- `behaviourManagementPlanExists`
- `behaviourManagementPlanFollowed`
- `poorHousekeepingContributed`
- `workEnvironmentContributed`

Root cause and actions:

- `rootCauseAnalysis` (string)
- `remedialActions` (string[] JSON) // checklist values + “Other” text if needed

Audit:

- `createdAt`
- `updatedAt`
- `completedAt` (optional)

---

### 2.5 IncidentReview

Fields:

- `id`
- `incidentId`
- `investigationSummary` (string)
- `reportable` (boolean)
- `investigationStartedAt` (DateTime, optional)
- `reportableOutcome` (string or enum, e.g. `Reportable`, `NonReportable`)

Risk assessment:

- `riskNewRisksIdentified` (enum: `Yes` | `No` | `NA`)
- `riskMitigationRequired` (enum: `Yes` | `No` | `NA`)
- `riskRecurrenceRating` (enum: `Nil` | `Low` | `Medium` | `High`)

Further action:

- `furtherActionNeeded` (enum: `Yes` | `No` | `NA`)
- `furtherActionDetails` (string, optional)

Manager review:

- `finalStatus` (enum: `ReportedToCommission` | `ClosedWithoutReporting`)
- `closedAt` (DateTime)
- `createdAt`
- `updatedAt`

---

## 3. Routes & Pages

### 3.1 Dashboard – `/incident-management`

Sections:

1. **Operational Overview** (top row cards):
   - Total Incidents
   - This Week
   - Closed This Week
   - Investigation Pending

2. **Compliance Status** (second row cards):
   - Reportable (Pending)
   - Reported This Week
   - Non-Reportable

3. **Table section**:
   - Filters:
     - Search by Reported By (text)
     - Status (select)
     - Outcome Type (select)
     - Participant (select)
     - Worker (select)
     - Date Range (from/to)
   - Buttons:
     - Apply Filters
     - Clear
     - “+ New Incident” → `/incident-management/create`
   - Table columns:
     - ID (Incident Number)
     - Participant(s)
     - Workers Involved
     - Reported By
     - Date
     - Outcome
     - Status
     - Actions (View, Edit if Draft)
   - Empty state: “No incidents found. Adjust filters or create a new incident.”

---

### 3.2 New Incident Wizard – `/incident-management/create`

Multi‑step wizard with:

Step 1: **Instructions**

- Static critical incident / NDIS rules text.
- Button: “Continue To Report”.

Step 2: **Basic Details**

- Participant Name (multi‑select, required).
- Worker Name (optional).
- Incident Outcome (radio: Hazard / Incident / Near Miss / Medication).
- Buttons: Back, Save & Exit, Continue.

Step 3: **Incident Overview**

- People involved:
  - Visitor name/role.
  - Volunteer name/role.
  - Other person name/role.
- Location & Timing:
  - Date of incident (required).
  - Time of incident (required).
  - Address (optional).
  - Location details (optional).
- Buttons: Back, Save & Exit, Continue.

Step 4: **Incident Details**

- Summary (text area).
- Behavioural context:
  - Behaviour management plan? (Yes/No).
  - Regulated restrictive practices used? (Yes/No).
  - What participant was doing / task at time.
  - How the incident ended.
  - What happened (details).
  - Circumstances leading up / triggers.
  - Immediate action taken.
- Incident Category (multi-select buttons for all categories).
- Injuries & notification:
  - Any injuries to the participant? (Yes/No).
  - Has the responsible person been notified? (Yes/No).
- Compliance questions (Yes/No):
  - Was first aid given?
  - Need for ambulance?
  - Reported to police?
  - Was PRN administered?
  - Was medical review appointment offered?
- Witnesses:
  - Up to 5 witness blocks:
    - First Name, Surname, DOB, Gender, Address.
  - “Add Another Witness” until 5.

- Buttons: Back, Save & Exit, Continue.

Step 5: **Attachments & Sign**

- Signatory Name.
- Attachment upload (max 5 files, same formats as other modules).
- Signature (required).
- Clear Signature.
- Buttons: Back, Save & Exit, Submit Incident.

On Submit:

- Create Incident (+ Witnesses, Attachments).
- Generate `incidentNumber`.
- Set `status = Submitted` and `reportedAt = now`.
- Redirect to `/incident-management/view/[id]`.

Save & Exit:

- Save partial data as Draft (`status = Draft`).
- Redirect to dashboard.

---

### 3.3 Resume Incident – `/incident-management/edit/[id]`

- Reuses the same wizard and schema.
- Pre-populates from existing Incident.
- Steps show check icons when their fields are completed.
- Submit upgrades Draft to Submitted if needed.

---

### 3.4 View Incident – `/incident-management/view/[id]`

Header:

- Back button (to dashboard).
- “Incident #IN‑xxxx”.
- “Reported on [Date Time]”.
- Status pill.
- Right‑side actions:
  - If `Submitted`: “Start Investigation” → `/incident-management/investigation/[id]`.
  - If `UnderInvestigation`: “Edit Investigation” and “Review & Close Incident” (→ `/incident-management/review/[id]`).

Sections:

1. **Basic Details**
   - Date, Time, Type (outcome), Reported By, Participants.

2. **Response Summary**
   - Grid of 6 items showing Yes/No:
     - First Aid, Ambulance, Police, Injuries, PRN Given, Medical.

3. **Incident Overview**
   - Location, Location Details.
   - Incident Category chips.
   - People involved (Visitor, Volunteer, Other).
   - Responsible person notified? (Yes/No).

4. **Incident Details**
   - Summary.
   - Behaviour plan? (Yes/No).
   - Regulated restrictive practices? (Yes/No).
   - Task at time.
   - What happened.
   - Circumstances leading up.
   - Immediate action.
   - How the incident ended.

5. **Witnesses**
   - List with name, DOB, gender, address summary.

6. **Attachments**
   - List of files with open/download links.

7. **Signature**
   - Signed by.

8. **Activity Timeline**
   - Simple chronological list:
     - Incident created.
     - Submitted.
     - Investigation started/completed.
     - Review & close with status.

---

### 3.5 Investigation – `/incident-management/investigation/[id]`

Purpose: complete IncidentInvestigation.

Top:

- Title: “Complete the investigation for Incident #xxxx”.
- Expand All / Collapse All controls.

Sections:

1. **Is the incident reportable?** (Yes/No, required).

2. **Interview Notes**
   - Participant interview notes (1–10 items, “Add another”).
   - Staff members interview notes (1–10 items, “Add another”).

3. **Advocacy**
   - Has Advocacy been offered to Participant? (Yes/No).
   - Details (text).

4. **Investigation Checks**
   - 17 prompts, each with Yes / No / N/A.
   - Show completion count: “4/17 completed”.

5. **Root Cause Analysis**
   - Large textarea for root causes.

6. **Remedial Actions Recommended**
   - Multi-select checklist with all actions from the screenshot (Conduct task analysis, Reinstruct person(s) involved, Improve design, etc., plus “Others”).

Buttons:

- Cancel.
- Save Draft (keeps IncidentInvestigation with status InProgress).
- Save Investigation:
  - Mark IncidentInvestigation as Completed (status = Completed, completedAt now).
  - Set Incident.status = UnderInvestigation (if not already).
  - Redirect back to View Incident.

---

### 3.6 Review & Close – `/incident-management/review/[id]`

Purpose: final review and closure.

Header:

- “Review & Close Incident”.
- “Complete the review for Incident #xxxx”.

Sections:

1. **Investigation Summary**
   - Read‑only: investigation started date, reportable yes/no, root cause summary.

2. **Risk Assessment**
   - Are there any new risks identified? (Yes/No/N/A).
   - Are any risk prevention or mitigation strategies required? (Yes/No/N/A).
   - Rate risk for recurrence (Nil / Low / Medium / High).

3. **Further Action**
   - Is further action needed? (Yes/No/N/A).
   - If Yes: textarea for actions and timeline.

4. **Manager’s Review**
   - Final Status (radio):
     - Reported – “Reported to NDIS Commission”.
     - Closed – “Close without reporting”.
   - Under the hood:
     - Reported → Incident.status = ClosedReported.
     - Closed → Incident.status = ClosedUnreported.

Buttons:

- Cancel.
- Save Draft (save IncidentReview but don’t close).
- “Review & Close Incident”:
  - Persist IncidentReview,
  - Set final status and closedAt,
  - Redirect to View Incident.

---

## 4. API & Hooks

### 4.1 API Endpoints

Under `/app/api/incidents`:

- `GET /api/incidents`
  - Query params: `status`, `outcomeType`, `participantId`, `workerId`, `reportedBy`, `fromDate`, `toDate`, `regionId`, `search`.
  - Returns list for dashboard table + metrics.

- `POST /api/incidents`
  - Create Draft/Submitted incident from wizard.

- `GET /api/incidents/[id]`
  - Returns Incident with witnesses, attachments, investigation, review.

- `PATCH /api/incidents/[id]`
  - Update Draft/Submitted incident (wizard save & exit, resume).

- `DELETE /api/incidents/[id]`
  - Only allowed for Draft incidents.

Investigation:

- `GET /api/incidents/[id]/investigation`
- `PATCH /api/incidents/[id]/investigation`

Review:

- `GET /api/incidents/[id]/review`
- `PATCH /api/incidents/[id]/review`

All inputs validated with Zod in `lib/validations/incidents.ts`.

---

### 4.2 Hooks (TanStack Query)

`hooks/use-incidents.ts`:

- `useIncidents(filters)`
- `useIncident(id)`
- `useCreateIncident()`
- `useUpdateIncident()`
- `useDeleteIncident()`
- `useIncidentInvestigation(id)`
- `useSaveIncidentInvestigation(id)`  // mutation
- `useIncidentReview(id)`
- `useSaveIncidentReview(id)`        // mutation

All hooks:

- Include `selectedRegionId` from region store in query keys where appropriate.
- Follow patterns used in participants / reporting / invoicing hooks.

---

## 5. UI Components

New components (examples):

- `components/incidents/incident-dashboard.tsx` (or inline in page).
- `components/incidents/incident-wizard.tsx` + step components.
- `components/incidents/incident-view.tsx`.
- `components/incidents/investigation-form.tsx`.
- `components/incidents/review-form.tsx`.

Pages:

- `app/(dashboard)/incident-management/page.tsx`
- `app/(dashboard)/incident-management/create/page.tsx`
- `app/(dashboard)/incident-management/edit/[id]/page.tsx`
- `app/(dashboard)/incident-management/view/[id]/page.tsx`
- `app/(dashboard)/incident-management/investigation/[id]/page.tsx`
- `app/(dashboard)/incident-management/review/[id]/page.tsx`

All pages must:

- Use `PageHeader`, `KPICard`, `DataTable`, `EmptyState` where appropriate.
- Respect design tokens and region selector.

---

## 6. Success Criteria

Incident Management is complete when:

- Dashboard metrics, filters, and table work and respect region.
- Users can create Draft incidents, resume them, and submit.
- View Incident shows full summary including witnesses, attachments, and response summary.
- Investigation form supports all fields, persists correctly, and transitions status to UnderInvestigation.
- Review & Close form stores review, sets final status (Reported / Closed), and closes the incident.
- All new endpoints and hooks are typed, and `pnpm build` + `pnpm lint` pass with no errors.
