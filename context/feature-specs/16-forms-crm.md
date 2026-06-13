# Forms Management CRM Module - Feature Specification

---

## 1. Module Purpose

Forms Management CRM manages all **client/service forms** used across the CRM side of the product (risk assessments, consents, intake forms, charts, etc.).

It reuses the shared form engine:

- `FormTemplate`, `FormSection`, `FormSubSection`, `FormField`.
- The reusable `FormBuilder` widget (now parameterised by `kind`, categories, and callbacks).
- The Viewer page layout established for Home MGT and HRM.

CRM gets:

- Its own list page under “Forms Management CRM”.
- Its own builder routes.
- Its own viewer routes.
- CRM-specific categories and subcategories.

All of this is distinguished by `FormTemplate.kind = 'CRM'`.

---

## 2. Data Model (Shared)

Same models as specs 14 and 15:

- `FormTemplate`
- `FormSection`
- `FormSubSection`
- `FormField`

### 2.1 FormTemplate.kind

Extend or reuse the `kind` discriminator with a third value:

- `HOME_MGT`
- `HRM`
- `CRM`  ← new

All CRM forms:

- Are created with `kind = 'CRM'`.
- Are queried with a filter `kind = 'CRM'`.

### 2.2 CRM Categories / Subcategories

Use categories that mirror the screenshot examples:

Categories (examples):

- Risk Management
- High Care
- Medication
- Behaviour Support
- Intake / Admission
- General

Subcategories (optional, free text):

- Intake Risks
- Activities
- Bowel Care Mgt
- Enteral Feed Mgt
- Urinary Catheter Mgt
- Or just `-` when not set.

`FormTemplate.subcategory` remains an optional string; list view shows `-` if empty.

---

## 3. CRM Forms List Page

Route: `/forms-crm` (match “Forms Management CRM” sidebar entry).

### Header

- Title: “Forms”.
- Subtitle: “All your Forms in one place”.
- Right side:
  - Region selector (“Selected Regions”).
  - Status filter dropdown (e.g. “Publish”).
  - “+ Create Form CRM” button.
  - Bell icon.

### Filters

- Left dropdown: category filter (or blank).
- Middle dropdown: status filter.
- Right search input: “Search”.

Filtering logic:

- `kind = 'CRM'` is always applied.
- Optional `category`, `status`, `regionId`, `search` all AND together.
- `search` matches at least `title` (and optionally category/subcategory).

### Table

Columns:

1. **Title**  
   - `FormTemplate.title`.  
   - Sortable.

2. **Category**  
   - `FormTemplate.category` (Risk Management, High Care, Medication, etc.).

3. **Subcategory**  
   - `FormTemplate.subcategory` or `-`.

4. **Action**  
   - Green pencil icon – Edit `/forms-crm/[id]/edit`.
   - Yellow eye icon – View `/forms-crm/[id]/view`.
   - Blue duplicate icon – Duplicate template (clone to new Draft) or simple “Coming soon” stub.
   - Red trash icon – Delete (confirmation dialog; removes template + nested sections/sub‑sections/fields).

### Empty State / Pagination

- Empty: “No Data Found !” in table row.
- Pagination behaviour: same as Home MGT/HRM (Showing X to Y of Z results, prev/next arrows).

---

## 4. CRM Form Builder Pages

Routes:

- `/forms-crm/new`
- `/forms-crm/[id]/edit`

Use the **same layout** as the Home MGT and HRM builder:

- Breadcrumb: “Dashboard > Forms List > New Form” (or “Edit Form”).
- Title: “Create New Form” / “Edit Form”.
- Subtitle: “Supercharge your business with customisation on the standard forms.”
- Region selector and bell in top-right.

### Top Form Fields

Same three fields, with CRM-specific categories:

1. **Title** – required.
2. **Form Category** – dropdown:
   - Risk Management
   - High Care
   - Medication
   - Behaviour Support
   - Intake / Admission
   - General
3. **Description** – multiline.

When creating a new CRM form:

- `kind = 'CRM'`.
- `status = 'Draft'` initially.

### Sections / Sub‑sections / Fields

Reuse `FormBuilder` directly:

- Pass `kind="CRM"`.
- Pass CRM categories list.
- Enable the same controls:
  - “+ Add New Section”.
  - “+ Add new Sub Section”.
  - “+ Add new field”.
- Dialogs:
  - AddNewSectionDialog.
  - AddNewSubSectionDialog (with Add Other toggle).
  - AddSectionFieldDialog (label, type, required, full width column, added in support plan, dependency, hint, legal reference).

### Footer Buttons

Exactly like other builders:

- **Clear & Exit** → back to `/forms-crm`, optional unsaved confirmation.
- **Publish** → confirmation modal, sets `status = 'Published'`.
- **Save As Draft** → persists as Draft.

---

## 5. CRM Form Viewer Page

Route: `/forms-crm/[id]/view`.

Purpose:

- Preview how a CRM form renders for staff.
- Optionally act as the actual fill screen (submissions can still be out of scope, as with previous specs).

Layout:

- Page header with form title.
- Region selector and bell in the top bar.
- Content:
  - For each section:
    - Section title.
    - For each sub‑section:
      - Sub‑section title (if any).
      - Fields in 2‑column grid where possible.
      - If sub‑section has `addOther = true`, show “Add Other” behaviour (extra row or input).
- Inputs can be standard text inputs and textareas.
- Bottom buttons:
  - At minimum: “Clear & Exit” → reset local state and return to `/forms-crm`.

Viewer behaviour should mirror whichever pattern you used for Home MGT and HRM.

---

## 6. API & Hooks

As with HRM, there are two design options; this spec chooses CRM-specific endpoints for clarity.

### 6.1 API Routes

Implement:

- `GET /api/crm-forms`
  - Returns list of templates with `kind = 'CRM'`.
  - Supports `regionId`, `status`, `category`, `search`.

- `POST /api/crm-forms`
  - Creates a new CRM template (shell).
  - Server enforces `kind = 'CRM'` regardless of client input.
  - Accepts `title`, `category`, `subcategory`, `description`, `status`, `regionId`.

- `GET /api/crm-forms/[id]`
  - Returns a single template including `sections`, `subSections`, and `fields`.

- `PATCH /api/crm-forms/[id]`
  - Updates template metadata and nested structure (sections, sub‑sections, fields) in a transaction, using the same pattern as Home MGT/HRM.

- `DELETE /api/crm-forms/[id]`
  - Deletes template and nested records in a transaction.

All endpoints require an authenticated user. You can mirror the same error handling and Zod validation used for Home MGT and HRM.

### 6.2 Hooks

Create CRM-specific hooks (thin wrappers around the shared logic):

- `useCrmForms`
- `useCrmForm`
- `useCreateCrmForm`
- `useUpdateCrmForm`
- `useDeleteCrmForm`

Suggested query keys:

- List: `['crm-forms', { regionId, status, search, category }]`.
- Single: `['crm-forms', id]`.

These hooks should integrate with the shared `FormBuilder` and viewer components exactly like the HRM hooks do.

---

## 7. Success Criteria

Forms Management CRM is complete when:

- `/forms-crm` lists only templates with `kind = 'CRM'` with Title, Category, Subcategory, Action.
- Filters (region, status, category, search) work.
- “+ Create Form CRM” opens the builder and creates a new CRM template.
- Builder reuses the shared `FormBuilder`, with CRM categories and `kind='CRM'`.
- Sections, sub‑sections, and fields can be added/edited just like in Home MGT/HRM.
- Publish/Draft flows work and update status correctly.
- Viewer page `/forms-crm/[id]/view` renders a published CRM form with the same layout behaviour.
- Delete (and duplicate if implemented) behave consistently with the other forms modules.
- `pnpm build` passes with 0 TypeScript errors after implementation.