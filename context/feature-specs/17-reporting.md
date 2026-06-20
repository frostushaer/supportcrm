# Reporting Module - Feature Specification

---

## 1. Module Purpose

The Reporting module gives admins a **Reporting Dashboard** with tiles linking to individual reports such as:

- ROC Report
- ROC Weekly Report
- Timesheet Report
- Payroll Report
- Feedback Report
- Complaints Report
- Participant/Worker list and expiring documents
- Incident-related reports
- COS Funding, Case Note, and Invoicing reports

Each report page:

- Shows a **filter toolbar** (dates, participants, workers, statuses, etc.).
- Shows a **results table**.
- Has **Search**, **Clear Filter**, and **Export** actions.
- Always respects the **Selected Regions** filter.

This spec focuses on wiring the overall Reporting system and implementing the **first 3–4 key reports** end‑to‑end using real data you already modelled (Participants, Workers, Shifts/Timesheets, Incidents, Feedback, Complaints).

---

## 2. Reporting Dashboard Page

Route: `/reporting`.

### Layout

- Header:
  - Title: `Reporting Dashboard`.
  - Right side: Region selector + search icon + bell (same as other dashboard pages).
- Below: responsive grid of **report tiles**.

Each tile:

- Icon + title (e.g. ROC Report).
- Optional short description.
- Click navigates to its report route (e.g. `/reporting/roc-reports`).

Initial tiles to implement:

1. ROC Report → `/reporting/roc-reports`
2. ROC Weekly Report → `/reporting/roc-weekly-reports`
3. Timesheet Report → `/reporting/timesheet-reports`
4. Payroll Report → `/reporting/payroll-reports`
5. Feedback Report → `/reporting/feedback-reports`
6. Complaints Report → `/reporting/complaints-reports`
7. Participant List Report → `/reporting/participant-list-reports`
8. Worker List Report → `/reporting/worker-list-reports`

Other tiles can be present but may be stubs that just show “Coming soon”.

Use a shared `ReportTile` component with props: `title`, `icon`, `description`, `href`, `accentColor`.

---

## 3. Common Report Page Pattern

Each specific report page will use a shared layout:

- Breadcrumb: `Reporting Dashboard > [Report Name]`.
- Title: `[Report Name]`.
- Filter toolbar (top).
- Results table with sortable columns.
- Empty state message: `No data found. Please adjust your filters to get relevant results`.

Create a reusable `ReportLayout` component that accepts:

- `title`
- `breadcrumbs`
- `filters` (React children rendered in a filter bar).
- `table` (React children for the results table).

---

## 4. ROC Report

Route: `/reporting/roc-reports`.

Purpose:

- Show **rostered shifts** (planned) for ROC (Rostering) over a date range.
- Provide participant + worker filters and export.

### Filters (from screenshot)

- Search by participant name (search input).
- Participant name dropdown.
- Support Worker dropdown.
- Status dropdown (shift status).
- Overtime dropdown.
- Scheduled Shift Date Range (Max 3 Months) – date range picker.
- Region selector (global).

### Table Columns

- Participant
- Worker
- Scheduled Shift Date
- Shift Start Time
- Shift End Time
- Shift Length
- Overtime
- Status

### Data Source

- Use your `Shift` / `Roster` model (from Rostering spec), filtered by:
  - `regionId`
  - `participantId` or search on participant name
  - `workerId`
  - `status`
  - `overtime` flag/category
  - `scheduledShiftDate` between selected dates.

### Actions

- **Search** button:
  - Calls a dedicated API endpoint with current filter values.
- **Clear Filter**:
  - Resets filters to defaults and refreshes list.
- **Export**:
  - Triggers CSV export of the currently filtered data.

---

## 5. ROC Weekly Reports

Route: `/reporting/roc-weekly-reports`.

Purpose:

- Show weekly summary of worker hours and overtime.

### Filters

- Search by worker name (search input).
- Support Worker dropdown.
- Status dropdown.
- Shift Date Range (Max one week) – date range picker.
- Overtime dropdown.
- Region selector.

### Table Columns

- Worker
- Over Time (total overtime hours in the week).
- Weekly Hours (total worked hours in the week).

### Data Source

- Same underlying `Shift`/`Timesheet` data as ROC.
- When querying, **aggregate per worker**:
  - Sum of worked hours in range.
  - Sum of overtime hours.

Use a server‑side query/Prisma aggregation, or compute in the API route.

---

## 6. Timesheet Reports

Route: `/reporting/timesheet-reports`.

Purpose:

- Provide a line‑by‑line view of submitted timesheets.

### Filters (from screenshot)

- Search by participant name (search input).
- Participant dropdown.
- Worker dropdown.
- Date Range of Timesheet (Max 3 Months) – date range picker.
- Status dropdown (timesheet status).
- Time Format dropdown (24 Hour / 12 Hour).
- Region selector.

### Table Columns

- Participant
- Worker
- Timesheet Date
- Worker Start Time
- Worker End Time
- Total Time
- Status
- Shift Notes
- Incidents (boolean / count)
- KMs
- Shift Associated Cost $

### Data Source

- `Timesheet` model (or `Shift`/`Timesheet` combo) from Rostering / Invoicing.
- Filter by region, participant, worker, status, and timesheet date range.

### Actions

- **Search** → fetch filtered results.
- **Clear Filter** → reset filters.
- **Export** → CSV export of current list respecting Time Format setting.

---

## 7. Payroll Report

Route: `/reporting/payroll-reports`.

Purpose:

- Summarise worker hours by day / overtime category for payroll export (e.g. Xero).

### Filters (from screenshot)

- Date Range (Max 1 Month) – required date range.
- Employee Type dropdown.
- Workers dropdown.
- Region selector.

### Table Columns

For each worker row:

- Name
- Total Hours
- Day
- Evening
- Night
- Saturday
- Sunday
- Public Holiday
- Sleepover
- OT 1.5x
- OT 2x
- Wkly OT 1.5x
- Wkly OT 2x
- KM’s

### Data Source

- Same timesheet/shift data, but:
  - Group by worker.
  - Break down hours by:
    - Time of day (Day / Evening / Night).
    - Day type (Saturday, Sunday, Public Holiday).
    - Overtime categories and KMs.

Implementation detail:

- This spec does not dictate exact award interpretation; approximate:
  - Use shift start/end times + public holiday calendar to derive buckets.
  - Summation logic can live in a server-side helper used by the Payroll report API.

### Actions

- **Search**.
- **Export** – CSV specifically shaped for payroll (can be a generic CSV for now).
- **Clear Filter**.

---

## 8. Feedback & Complaints Reports (Outline)

Implement at least simple versions that reuse existing modules.

### Feedback Report

Route: `/reporting/feedback-reports`.

Filters:

- Date range.
- Status.
- Category.
- Region.

Table columns:

- Date
- Participant / Submitter
- Category
- Status
- Assigned To (if any)

Data source:

- `Feedback` model and existing APIs.

### Complaints Report

Route: `/reporting/complaints-reports`.

Very similar pattern, driven by the `Complaint` model.

---

## 9. API & Hooks

### 9.1 API Routes

For each report, create dedicated endpoints under `/api/reporting`:

- `GET /api/reporting/roc`
- `GET /api/reporting/roc-weekly`
- `GET /api/reporting/timesheets`
- `GET /api/reporting/payroll`
- `GET /api/reporting/feedback`
- `GET /api/reporting/complaints`

Common behaviour:

- Accept query parameters for filter fields (e.g. `participantId`, `workerId`, `status`, `from`, `to`, `regionId`, etc.).
- Validate with Zod schemas (e.g. `reportFiltersSchema` per report).
- Perform Prisma queries, including aggregations for weekly/payroll.
- Return strongly typed arrays.

Optional:

- `GET /api/reporting/payroll/export` etc., which return CSV text; or:
  - Reuse the same endpoints with `format=csv` query and respond with CSV.

### 9.2 Hooks

Create one hook per report, e.g.:

- `useRocReport(filters)`
- `useRocWeeklyReport(filters)`
- `useTimesheetReport(filters)`
- `usePayrollReport(filters)`
- `useFeedbackReport(filters)`
- `useComplaintsReport(filters)`

Each:

- Uses TanStack Query with appropriate key (e.g. `['reporting', 'roc', filters]`).
- Encapsulates data fetching and loading/error states.

---

## 10. UI Components

1. `components/reporting/report-layout.tsx`
   - Accept `title`, optional breadcrumb, children for filters and table.

2. `components/reporting/report-filter-bar.tsx`
   - Common bar layout used across reports.

3. `components/reporting/report-tile.tsx`
   - Used on `/reporting` dashboard.

4. For each report:
   - `components/reporting/roc-report-table.tsx`
   - `components/reporting/roc-weekly-report-table.tsx`
   - `components/reporting/timesheet-report-table.tsx`
   - `components/reporting/payroll-report-table.tsx`

Tables should use the existing shared `DataTable` styles for consistency.

---

## 11. Export Behaviour

For this phase:

- CSV export is sufficient (no PDF).
- Export button:
  - Either:
    - Calls a dedicated `export` endpoint to download a file, or
    - Uses the already fetched data to build a CSV on the client and trigger a download.
- CSV filename should include:
  - Report name.
  - Date/time stamp.

---

## 12. Success Criteria

The Reporting module is considered complete for this phase when:

- `/reporting` dashboard shows clickable tiles for the main reports.
- ROC, ROC Weekly, Timesheet, and Payroll reports are fully functional:
  - Filters work and are validated.
  - Tables show real data from existing models.
  - Empty state message matches the UI in the screenshots.
  - Export produces a valid CSV file with the rows currently visible.
- Feedback and Complaints reports at least provide filtered tables over their respective models.
- All report pages respect the global Region selector.
- `pnpm build` passes with 0 TypeScript and ESLint errors.
