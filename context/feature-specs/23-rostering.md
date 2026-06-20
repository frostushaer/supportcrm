# Rostering Module - Feature Specification

---

## 1. Module Purpose

The Rostering module manages:

- Worker and participant schedules (shifts) on a calendar.
- Quick creation of one‑off and recurring shifts.
- Basic shift statuses (draft/unpublished, published, rejected, open).
- Timesheet redirection (hook into existing timesheet module).
- Leave Requests and Timesheet Export navigation from the Rostering Dashboard.

Main areas (from Vertex360 screenshots):

1. Rostering Dashboard – `/rostering`
2. Schedule – `/rostering/schedule`
3. Shift creation/edit modal (inside Schedule)
4. Leave Requests – `/rostering/leave-requests` (can reuse HRM WorkerLeave)
5. Timesheet list – `/rostering/timesheets`
6. Timesheet Export – `/rostering/timesheet-export`

---

## 2. Data Model (Prisma)

### 2.1 Shift

Represents a single scheduled shift.

Fields:

- `id`
- `workerId` (FK to Worker)
- `participantId` (FK to Participant, optional if open shift)
- `regionId` (FK to Region)
- `shiftDate` (Date)
- `startDateTime` (DateTime)
- `endDateTime` (DateTime)
- `serviceCategory` (string or FK to Service/Catalogue item)
- `ratioWorkerCount` (int, default 1)
- `ratioParticipantCount` (int, default 1)
- `tasks` (string[] JSON – list of short tasks/notes)
- `status` (enum):
  - `Unpublished`
  - `Published`
  - `Rejected`
  - `Open`
- Quick Settings flags (booleans):
  - `workerTrackingEnabled`
  - `isGroupShift`
  - `isOpenShift`
  - `requireParticipantSignature`
  - `enforceDistanceRestriction`
  - `allowShiftOverlapping`
  - `isSleepoverShift`
- Recurrence:

  For v1, store recurrence meta on the “master” shift:

  - `recurring` (boolean)
  - `recurrencePattern` (string, e.g. “Weekly”, “Fortnightly”)
  - `recurrenceEndDate` (Date, optional)
  - Optionally `recurrenceDaysOfWeek` (string[] JSON)

- Audit:
  - `createdByUserId`
  - `updatedByUserId`
  - `createdAt`
  - `updatedAt`

### 2.2 ShiftTemplate (optional)

Represents reusable quick‑create templates.

Fields:

- `id`
- `name`
- `workerId` (optional)
- `serviceCategory`
- `defaultStartTime` (string “HH:mm”)
- `defaultEndTime` (string “HH:mm”)
- `defaultSettings` (JSON – quick‑settings defaults)
- `createdByUserId`
- `createdAt`
- `updatedAt`

(You can implement this later; v1 can ignore.)

Rostering will also leverage:

- `Worker` and `WorkerLeave` from HRM.
- Participant data from Participants module.
- Existing Timesheet models (no schema change required in this spec).

---

## 3. Screens & Flows

### 3.1 Rostering Dashboard – `/rostering`

Header:

- Title: “Rostering Dashboard”.
- Greeting banner (“Good Evening! [Name]”).
- Region selector.

Tiles:

- **Schedule** – “All Worker Shifts In The Scheduling Calendar” → `/rostering/schedule`
- **Timesheet** – “All Timesheets” → `/rostering/timesheets`
- **Leave Requests** – “All Leave Requests And History” → `/rostering/leave-requests`
- **Timesheet Export** – “Export Timesheet” → `/rostering/timesheet-export`

Simple page – no heavy backend logic beyond tile navigation.

---

### 3.2 Schedule – `/rostering/schedule`

Calendar view for shifts.

Top controls:

- View:
  - Dropdown: `Worker View` | `Participant View`.
- (When Worker View):
  - Worker selector (searchable dropdown).
- (When Participant View):
  - Service Support / Participant selector.
- Choose Period:
  - Dropdown: `Fortnightly Period` (later: Weekly, Monthly).
- Select Date Range:
  - Date range with left/right arrows to page through periods.
- Region selector.
- Button: “Redirect To Timesheet” (link to `/rostering/timesheets`).

Calendar:

- One row per worker (in Worker View) or per participant (in Participant View).
- One column per day in the selected period.
- Day cells show:
  - Day label (Mon 8th).
  - Holiday/weekend labels (e.g. “Weekend” in pink).
- Shifts are displayed as blocks inside the day cell (for v1, it’s enough to show badge with start/end time).

Legend at bottom:

- 0 Unpublished Shifts (orange).
- 0 Published Shifts (green).
- 0 Rejected Shifts (red).
- 0 Open Shifts (yellow).

Toolbar buttons (right side above calendar):

- Add shift (“+”).
- Copy / paste schedule (future).
- Publish shifts.
- Delete shifts.
- Refresh.

For v1, implement:

- **+** → open Shift modal in create mode.
- Refresh → refetch shifts.

Workers and participants can be paged if there are many rows.

---

### 3.3 Shift Create/Edit Modal

Opened from:

- “+” on Schedule.
- Clicking an existing shift (edit mode).

Layout (see screenshot):

Left side:

1. **Who**
   - Worker (select from Workers).
   - Participant (search + select from Participants).

2. **When**
   - Shift Date (date picker).
   - Shift Start Time (HH:mm + AM/PM).
   - Shift End Time (HH:mm + AM/PM).

3. **What**
   - Service Category (select service category / catalogue item).
   - Display ratio “Ratio (Worker: Participants) 0 : 0”, update as worker/participant counts change.

4. **Tasks & Notes**
   - Multi‑line input: “Add your tasks here…”
   - Ability to “+ Add More Tasks” to create multiple small text entries.

Right side:

- **Quick Settings** (toggles with clear on/off icons):
  - Worker Tracking.
  - Group Shift.
  - Open Shift.
  - Participant’s Signature.
  - Enforce Distance Restriction.
  - Allow Shift Overlapping.
  - Sleepover Shift.
- **Recurring Shift** toggle:
  - When enabled, show additional controls:
    - Recurrence Pattern (e.g. Weekly, Fortnightly).
    - Recurrence End Date (or number of occurrences).

Buttons:

- “Create” – save shift as `Unpublished` (or draft).
- “Create And Publish” – save shift and mark `status = Published`.
- In edit mode, buttons can read “Update” and “Update And Publish”.

Flow for recurring shifts (v1):

- On save, generate child Shift records for each occurrence between `shiftDate` and `recurrenceEndDate` using the same start/end times and settings.

---

### 3.4 Leave Requests – `/rostering/leave-requests`

This page is mostly a **view** over the HRM WorkerLeave model.

Header: “Leave Requests”.

- Region selector.
- Filters:
  - Worker.
  - Status.
  - Date range.
- Table columns:
  - Worker.
  - Leave Type.
  - Start Date.
  - End Date.
  - Reason.
  - Comments.
  - Status.
  - Updated By.
  - Actions (view/edit).

New leave requests are still created from the Worker Profile “Add Leave Request” flow in HRM; Rostering can keep this page read‑only in v1, or link back to the worker profile if editing is needed.

---

### 3.5 Timesheets – `/rostering/timesheets`

If a dedicated Timesheet module already exists, Rostering just links to it.

For this spec:

- `/rostering/timesheets` can:
  - Either:
    - Redirect to existing `/timesheets` page.
  - Or:
    - Display a simple table of timesheets filtered by region and date range.

No new data model is added here in this spec; reuse the existing timesheet data.

---

### 3.6 Timesheet Export – `/rostering/timesheet-export`

Header: “Timesheet Export”.

- Filters:
  - Worker.
  - Date range.
  - Region.
- Actions:
  - “Export” button – triggers generation of export (CSV/XLSX) using existing export logic if present; otherwise, stub the call for v1.

---

## 4. API & Hooks

### 4.1 API Endpoints

Shifts:

- `GET /api/rostering/shifts`
  - Query params:
    - `view` (worker|participant).
    - `workerId` (optional).
    - `participantId` (optional).
    - `fromDate`, `toDate`.
    - `regionId`.
  - Returns list of Shift records for calendar rendering.

- `POST /api/rostering/shifts`
  - Creates a new shift (and recurrence if enabled).
  - Accepts full shift payload with quick settings and tasks.

- `GET /api/rostering/shifts/[id]`
  - Returns single Shift.

- `PATCH /api/rostering/shifts/[id]`
  - Update shift details and status.

- `DELETE /api/rostering/shifts/[id]`
  - Soft delete shift.

Bulk actions (optional v1):

- `POST /api/rostering/shifts/publish`
  - Body: list of shift IDs → set status to Published.
- `POST /api/rostering/shifts/delete`
  - Body: list of shift IDs → delete.

Leave Requests:

- Reuse `/api/hrm/workers/[id]/leaves` endpoints for data source on `/rostering/leave-requests`.

Timesheets & export:

- Reuse existing `/api/timesheets` and `/api/timesheets/export` if they exist, or stub similarly.

All request payloads validated with Zod in `lib/validations/rostering.ts`.

---

### 4.2 Hooks (TanStack Query)

Create `hooks/use-rostering.ts`:

Shifts:

- `useShifts(filters)` – fetch calendar shifts.
- `useCreateShift()`
- `useUpdateShift()`
- `useDeleteShift()`
- Optionally `usePublishShifts()` for bulk publish.

Leave requests:

- `useRosteringLeaveRequests(filters)` – wrapper around HRM WorkerLeave list.

Timesheets:

- `useRosteringTimesheets(filters)` – wrapper around shared timesheet hooks.

All hooks:

- Include `selectedRegionId` from region store.
- Follow hook patterns used in COS/Allied Health modules.

---

## 5. UI Components & Pages

Pages under `app/(dashboard)/rostering/`:

- `dashboard/page.tsx` (or `page.tsx` if you mount directly):
  - Rostering Dashboard with four tiles.

- `schedule/page.tsx`:
  - Top filters (View, Worker/Participant, Period, Date Range, Region, Redirect to Timesheet).
  - Calendar grid.
  - Legend and toolbar.
  - Shift modal overlay for create/edit.

- `leave-requests/page.tsx`:
  - Table of leave requests using `useRosteringLeaveRequests`.

- `timesheets/page.tsx`:
  - Either redirect or simple timesheet list.

- `timesheet-export/page.tsx`:
  - Filters + Export button.

Components:

- `components/rostering/schedule-calendar.tsx`
- `components/rostering/shift-modal.tsx`
- `components/rostering/leave-requests-table.tsx`

Re-use:

- `PageHeader`, `KPICard`, `DataTable`, `EmptyState`, `StatusBadge`, and design tokens.

Success Criteria:

- Rostering Dashboard tiles navigate correctly.
- Schedule page loads shifts and allows creating/editing/publishing basic shifts with quick settings stored.
- Leave Requests shows real WorkerLeave data.
- Timesheet and Timesheet Export navigation works.
- `pnpm build` and `pnpm lint` pass with no errors.
- `context/progress-tracker.md` updated with “Rostering Module COMPLETE”.
