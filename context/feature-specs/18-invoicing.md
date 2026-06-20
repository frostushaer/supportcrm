# Invoicing Module - Feature Specification

---

## 1. Module Purpose

The Invoicing module turns **approved timesheets/shifts** into **customer invoices**, and lets users:

- Allocate funding codes to approved timesheets (Code Allocation).
- Generate invoices from those allocated timesheets (Invoice Generation).
- View, filter, and export all generated invoices (Invoices list).

Invoicing is read-only with respect to Participants and Workers; it consumes existing data from Rostering/Timesheets and Funding/Support Items.

---

## 2. Data Model

### 2.1 Invoice

Represents a single invoice document to a payer (e.g. NDIS plan, participant, organisation).

Fields:

- `id`
- `invoiceNumber` – human-readable, e.g. INV-000123 (unique).
- `participantId` – link to Participant.
- `participantName` – snapshot.
- `createdById` – User who generated the invoice.
- `createdByName` – snapshot.
- `createdDate` – timestamp.
- `serviceDeliveredFrom` – earliest service date on related lines.
- `serviceDeliveredTo` – latest service date on related lines.
- `status` – enum: `Draft`, `Pending`, `Sent`, `Paid`, `Cancelled`.
- `numDelivered` – total quantity units across all lines (for display).
- `totalValue` – decimal total.
- `regionId` – region for filtering.
- `notes` – optional free text.
- `externalReference` – optional (e.g. Xero/NDIS reference).

Relations:

- `invoiceLines` – one‑to‑many InvoiceLine.

### 2.2 InvoiceLine

Represents a line item on an invoice, usually derived from one or more timesheets.

Fields:

- `id`
- `invoiceId`
- `timesheetId` – optional link to the original Timesheet (or `Shift`).
- `workerId` – optional link to Worker / Support Worker.
- `workerName` – snapshot.
- `participantId` – optional for multi-participant invoices.
- `participantName` – snapshot.
- `deliveredDate` – date of service.
- `typeOfService` – e.g. NDIS support item name/description.
- `supportItemCode` – e.g. 01_011_0107_1_1.
- `quantity` – number of units (hours, kms, etc.).
- `unitPrice` – price per unit.
- `totalAmount` – `quantity * unitPrice`.
- `fundingSource` – e.g. `NDIS`, `Private`, `Other`.
- `notes` – optional.

### 2.3 CodeAllocation (optional explicit model)

Approved timesheets can be “allocated” to support item codes before invoicing. You can either:

- Store allocation directly on `Timesheet` (`supportItemCode`, `quantity`, `unitPrice`, `fundingSource`), or
- Create a `CodeAllocation` model:

Fields:

- `id`
- `timesheetId`
- `supportItemCode`
- `quantity`
- `unitPrice`
- `totalAmount`
- `status` – `Pending`, `Allocated`, `Invoiced`.

For this first pass it is acceptable to:

- Enhance the `Timesheet` model with billing fields and a `billingStatus` enum:
  - `NotReady`, `Allocated`, `Invoiced`.

---

## 3. Invoicing Dashboard

Route: `/invoicing/dashboard` (or `/invoicing` redirect).

Layout (from screenshot):

- Header: “Invoicing Dashboard”.
- Region selector on the right.
- Greeting banner: “Good Morning, [Name]”.
- Three tiles:

  1. **Code Allocation** – “All Approved Timesheets” → `/invoicing/allocation`.
  2. **Invoice Generation** – “All Timesheets Ready For Invoices” → `/invoicing/create`.
  3. **Invoices** – “All Generated Invoices” → `/invoicing/invoices`.

Create a shared `InvoicingTile` component similar to `ReportTile`.

---

## 4. Code Allocation Page

Route: `/invoicing/allocation` (screenshot: “Invoicing > Code Allocation”).

Purpose:

- Show all **Approved Timesheets** that are not yet allocated or invoiced.
- Let user filter and assign funding codes, unit prices, and quantities.

### Filters bar

- Select Participant – dropdown.
- Select Worker – dropdown.
- Delivered Date Range – date range picker.
- Region selector (global).
- Button: “Redirect To Invoice Generation” (navigates to `/invoicing/create`).

### Table: “Approved Timesheets”

Columns:

- Checkbox (for multi‑select).
- Worker.
- Participants.
- Delivered Date.
- Type Of Service.
- Quantity.
- Total Amount.

Behind the scenes:

- Load timesheets with `status = 'Approved'` and `billingStatus != 'Invoiced'`.
- Allow inline editing or row dialogs to set:
  - `supportItemCode`
  - `quantity`
  - `unitPrice`
  - `totalAmount` (derived).
- Once a timesheet has all billing fields filled, mark `billingStatus = 'Allocated'`.

For this phase you can:

- Provide a “Edit Allocation” dialog per row (Type of Service, Support Item Code, Unit Price, Quantity).
- Or assume the allocation is pre‑computed (then Code Allocation just shows them as read-only).

---

## 5. Invoice Generation Page

Route: `/invoicing/create` (screenshot: “Invoicing > Create Invoice”).

Purpose:

- Let the user select **allocated** timesheets and generate invoice(s).

### Filters bar

From screenshot:

- Select Participant – dropdown.
- Select Worker – dropdown.
- Delivered Date Range – date range picker.
- Region selector.
- Buttons:
  - “Redirect To Code Allocation” – back to `/invoicing/allocation`.
  - “Generate Invoice” – primary action.

### Table: “Approved Timesheets”

Shows all timesheets where `billingStatus = 'Allocated'` and not yet linked to an Invoice.

Columns:

- Checkbox.
- Worker.
- Participants.
- Delivered Date.
- Type Of Service.
- Status.
- Quantity.
- Total Amount.

Behaviour:

1. **Filtering**  
   - Apply Participant, Worker, Delivered Date, Region filters before listing.

2. **Selecting rows**  
   - User can select one or more timesheets via the checkbox column.

3. **Generate Invoice**  
   - If nothing selected, show a validation message.
   - On click:
     - Group selected timesheets by Participant (simplest rule: one invoice per participant per generation run).
     - For each group:
       - Create an `Invoice` record with:
         - `participantId`, `participantName` from the group.
         - `createdBy` from current user.
         - `serviceDeliveredFrom` = min deliveredDate in group.
         - `serviceDeliveredTo` = max deliveredDate in group.
         - `status = 'Draft'` or `'Pending'`.
         - `numDelivered` = sum of quantities.
         - `totalValue` = sum of timesheet `totalAmount`.
       - Create an `InvoiceLine` per timesheet with billing details.
       - Set selected timesheets’ `billingStatus = 'Invoiced'` and link `invoiceId` (or store it on Timesheet).

4. **After generation**  
   - Show success toast summarising:
     - “Created 2 invoices for 2 participants (10 line items).”
   - Navigate to `/invoicing/invoices` or stay on page with table refreshed.

---

## 6. Invoices List Page

Route: `/invoicing/invoices` (screenshot: “Invoicing > Invoices”).

Purpose:

- Show all generated invoices with filters, for review and export.

### Filters bar

From screenshot:

- Select Participant – dropdown.
- Status filter – e.g. All, Draft, Pending, Sent, Paid, Cancelled.
- Created Date Range – date range picker.
- Service Delivered Date Range – date range picker.
- Region selector.
- Right‑side “Action ▾” button for bulk actions (future: Export, Mark as Sent, etc.).

### Table: “Invoices”

Columns:

- Checkbox (for bulk actions).
- Invoice #.
- Participant.
- Created By.
- Created Date.
- Service Delivered From.
- Service Delivered To.
- Status.
- No. Delivered.
- Total Value.
- Actions (view / export / delete).

Actions column:

- View (eye icon) – opens an Invoice detail page or dialog.
- Export (download icon) – CSV/PDF stub for now.
- Delete (trash icon) – confirmation dialog; soft delete or hard delete per your preference.

Empty state:

- When no invoices: “No Data Found !” in red text.

---

## 7. Invoice Detail / View

Route: `/invoicing/invoices/[id]` (optional but recommended).

Contents:

- Header: “Invoice #INV‑000123”.
- Summary panel:
  - Participant.
  - Created Date.
  - Service Delivered From–To.
  - Status.
  - Total Value.
- Lines table:
  - Type Of Service, Delivered Date, Worker, Quantity, Unit Price, Total Amount, Support Item Code.
- Actions:
  - Back to Invoices.
  - Mark as Sent / Mark as Paid (if you want simple status mutations).

Use a simple route + API `GET /api/invoices/[id]` to load invoice with lines.

---

## 8. API & Hooks

### 8.1 API Endpoints

- `GET /api/invoicing/allocation`
  - Returns timesheets with `status='Approved'` and `billingStatus != 'Invoiced'`.
  - Accepts filters: `participantId`, `workerId`, `from`, `to`, `regionId`.

- `PATCH /api/invoicing/allocation/[timesheetId]`
  - Updates billing fields for a timesheet (support item code, quantity, unit price, etc.).
  - Optionally sets `billingStatus`.

- `GET /api/invoicing/ready-for-invoice`
  - Returns timesheets with `billingStatus='Allocated'` and not yet invoiced.

- `POST /api/invoicing/generate`
  - Body: list of timesheet IDs.
  - Logic:
    - Load timesheets and their billing data.
    - Group by participant.
    - Create Invoice + InvoiceLine records in a transaction.
    - Update timesheets’ `billingStatus='Invoiced'`.
  - Returns created invoices.

- `GET /api/invoices`
  - Returns paginated list with filters:
    - `participantId`, `status`, `createdFrom`, `createdTo`, `serviceFrom`, `serviceTo`, `regionId`.

- `GET /api/invoices/[id]`
  - Returns invoice + lines.

- `DELETE /api/invoices/[id]`
  - Deletes invoice and lines (or marks as cancelled).

Export can be either:

- `GET /api/invoices/export` (with same filters) returning CSV, or
- Local CSV built from fetched `GET /api/invoices` data.

### 8.2 Hooks

Create hooks similar to other modules:

- Allocation:
  - `useAllocationTimesheets(filters)`
  - `useUpdateAllocation()`

- Invoice generation:
  - `useReadyForInvoiceTimesheets(filters)`
  - `useGenerateInvoices()`

- Invoice list & detail:
  - `useInvoices(filters)`
  - `useInvoice(id)`
  - `useDeleteInvoice()`

All should use region from `useRegionStore`.

---

## 9. UI Components

1. `app/(dashboard)/invoicing/dashboard/page.tsx`
2. `app/(dashboard)/invoicing/allocation/page.tsx`
3. `app/(dashboard)/invoicing/create/page.tsx`
4. `app/(dashboard)/invoicing/invoices/page.tsx`
5. Optional: `app/(dashboard)/invoicing/invoices/[id]/page.tsx`.

Shared components:

- `components/invoicing/invoicing-tile.tsx`
- `components/invoicing/allocation-table.tsx`
- `components/invoicing/create-invoice-table.tsx`
- `components/invoicing/invoices-table.tsx`

Use existing `PageHeader`, `ReportFilterBar`-style layout, `DataTable`, `EmptyState`, etc.

---

## 10. Success Criteria

Invoicing is complete for this phase when:

- Invoicing Dashboard shows the three tiles and links correctly.
- Code Allocation page lists approved timesheets with filters and allows updating billing fields.
- Invoice Generation page lists allocated timesheets and can generate one or more invoices from selected rows.
- Invoices list page shows generated invoices with filters, empty state, and basic actions.
- Basic CSV export for invoices (or for individual invoice lines) works.
- All pages respect the Region selector.
- `pnpm build` passes with 0 TypeScript/ESLint errors.
