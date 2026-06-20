# Forms Management HRM Module - Feature Specification

---

## 1. Module Purpose

Forms Management HRM manages all **HR-related form templates** such as:

- Declaration of Workers (Code Of Conduct)
- Induction Checklist
- Exit Interview
- Staff Performance Review Feedback
- Staff Training Needs And Planning
- Training Evaluation Form

It uses the same builder engine as Forms Home MGT, but:

- Lives under the **HRM area**.
- Uses HR-specific categories (Onboarding, Performance Management, Training and Development, Exit/Transition, etc.).
- Has its own list page and routes.

There are three user flows:

1. **HR Forms list** – table of all HRM form templates.
2. **HR Form builder** – create/edit HR-specific templates.
3. **HR Form viewer** – view/fill a published HR form.

The underlying data structures (FormTemplate, FormSection, FormSubSection, FormField) are shared with Forms Home MGT and distinguished by a **kind/tag**.

---

## 2. Data Model (Shared with spec‑14)

Reuse the same models from Forms Home MGT:

- `FormTemplate`
- `FormSection`
- `FormSubSection`
- `FormField`

The key difference is the **kind**:

### 2.1 FormTemplate.kind

Add or reuse an enum/string field on `FormTemplate`:

- `kind = 'HOME_MGT'` for Forms Home MGT.
- `kind = 'HRM'` for Forms Management HRM.
- (Future: `kind = 'CRM'` for Forms Management CRM.)

For HRM:

- All list, create, edit, and view operations **must filter on** `kind = 'HRM'`.

Everything else (sections, sub‑sections, fields structure) remains identical to spec‑14.

---

## 3. HRM Forms List Page

Route: `/forms-hrm` (or equivalent; match the “Forms Management HRM” sidebar link).

### Header

- Title: “Forms”.
- Subtitle: “All your Forms in one place”.
- Right side:
  - Region selector (“Selected Regions”).
  - Filter dropdown (status) – shows values such as “Publish”, “Draft”.
  - “+ Create Form HRM” button.
  - Bell icon.

### Filters

- Left dropdown: category or status filter (same layout as Home Forms).
- Middle dropdown: status filter (e.g. “Publish”).
- Right search input: placeholder “Search”.

Filters apply to:

- Category (if selected).
- Status (`FormTemplate.status`).
- Search (matches title).

All filters combine with AND logic and include `kind = 'HRM'`.

### Table

Columns:

1. **Title**  
   - Displays `FormTemplate.title`.  
   - Sortable.

2. **Category**  
   - Displays `FormTemplate.category` (e.g. Onboarding, Performance Management, Training And Development, Exit/Transition).

3. **Subcategory**  
   - Optional field; shows `FormTemplate.subcategory` or `-` when not set.

4. **Action**  
   - Four icons per row (matching screenshot):
     - Green pencil icon – Edit (opens builder `/forms-hrm/[id]/edit`).
     - Yellow eye icon – View/preview (opens viewer `/forms-hrm/[id]/view`).
     - Blue duplicate icon – Clone (creates a new Draft template copying structure; can be implemented now or stubbed with a toast “Coming soon”).
     - Red trash icon – Delete (opens confirmation dialog, then deletes template and nested items).

### Empty State

- When there are no HRM forms:
  - Show “No Data Found !” in red, centered.

### Pagination

- Same pattern as other modules:
  - “Showing X to Y of Z results”.
  - Prev/Next arrows.

---

## 4. HRM Form Builder Page

Route examples:

- `/forms-hrm/new` – create new HRM template.
- `/forms-hrm/[id]/edit` – edit existing HRM template.

### Header

- Breadcrumb: “Dashboard > Forms List > New Form” / “Edit Form”.
- Main title: “Create New Form” / “Edit Form”.
- Subtitle: “Supercharge your business with customisation on the standard forms.”
- Right side: Region selector + icons (same as other pages).

### Top Form Info

Inputs at the top (same as Home MGT):

1. **Title** – required.
2. **Form Category** – dropdown. HRM-specific options:
   - Onboarding
   - Performance Management
   - Training And Development
   - Exit/Transition
   - HR Compliance
   - WHS / Safety
   - General HR
3. **Description** – multiline.

On create:

- Set `kind = 'HRM'` automatically.
- Default `status = 'Draft'`.

Below the main info, show:

- List of sections and their sub‑sections/fields.
- Under each section:
  - Text: section title.
  - “+ Add new field”.
  - “+ Add new Sub Section”.
- Bottom:
  - “+ Add New Section”.

### Footer Buttons

Bottom-right buttons identical to Home MGT:

- **Clear & Exit**  
  - Optional confirmation if there are unsaved changes.
  - Returns to `/forms-hrm`.

- **Publish**  
  - Opens confirmation dialog:
    - “Confirm your action?”  
    - “Are you sure to publish this form?”
    - Buttons: “No, take me back!” / “Yes, go ahead!”
  - On confirm sets `status = 'Published'` and saves.

- **Save As Draft**  
  - Saves JSON structure and keeps `status = 'Draft'`.

---

## 5. Section / Sub‑Section / Field Dialogs (Reuse)

Reuse the exact behaviour from Forms Home MGT (spec‑14):

### 5.1 Add New Section Dialog

- Trigger: “+ Add New Section”.
- Field: Section Title (required).
- Buttons: Close / Save Changes.
- On save: append new `FormSection` with highest order value.

### 5.2 Add New Sub Section Dialog

- Trigger: “+ Add new Sub Section” under a given section.
- Fields:
  - Sub Section Title (required).
  - Add Other (Yes/No).
- On save: create `FormSubSection` under that section.

### 5.3 Add Section Input Field Dialog

- Trigger: “+ Add new field” under a section or sub‑section.
- Fields:
  - Label (required).
  - Type (Text, Textarea at minimum).
  - Required (Yes/No).
  - Full Width Column (Yes/No).
  - Added In Support Plan (Yes/No).
  - Is Dependent On Other Field? (Yes/No).
    - If Yes, show dependent field select.
  - Hint (rich text).
  - Legal Reference (rich text).
- On save: create `FormField` tied to the appropriate section/sub‑section.

All the internal logic and validations can be shared with the Home MGT builder by reusing the same components and just passing `kind='HRM'`.

---

## 6. HRM Form Viewer Page

Route: `/forms-hrm/[id]/view`.

Purpose:

- Show the **published** template in a read-only layout (or fillable layout) — similar to Home MGT “Nearby Facilities”, but for HR modules like “Induction Checklist” or “Exit Interview”.

Layout:

- Page title: Form title.
- Region selector still visible in top bar.
- Main card(s) that render:

  - Section titles.
  - Sub‑section titles if any.
  - Fields as labeled inputs/text areas arranged in a grid (2 columns where possible).
  - Optional buttons like “Add Other” for sub‑sections where `addOther = true`.

Buttons at bottom:

- For this spec, minimal:
  - “Clear & Exit” – resets any local state and returns to list.
- Actual submission handling can be out of scope for now (like Home MGT viewer).

If you already added submission behaviour for Home MGT, mirror the same approach for HRM.

---

## 7. API & Hooks (Reuse with kind='HRM')

### 7.1 API

You can reuse the same routes used for Home MGT, but:

- Ensure all HRM operations pass or enforce `kind = 'HRM'`.
- Two options:
  1. Separate routes (e.g. `/api/hrm-forms`) that always set and filter `kind='HRM'`.
  2. Single shared `/api/forms` with `kind` parameter in queries and body.

For parity with Forms Home MGT (spec‑14), this spec assumes HRM-specific endpoints:

- `GET /api/hrm-forms`  
  - Query params: `regionId`, `status`, `search`.  
  - Always filters `kind = 'HRM'`.

- `POST /api/hrm-forms`  
  - Creates/updates `FormTemplate` with `kind = 'HRM'` and top‑level fields (title, category, description, status, region).

- `GET /api/hrm-forms/[id]`  
  - Returns the template plus its sections, sub‑sections, and fields.

- `PATCH /api/hrm-forms/[id]`  
  - Updates template fields and nested structure.

- `DELETE /api/hrm-forms/[id]`  
  - Deletes the template and all nested sections/sub‑sections/fields.

### 7.2 Hooks

Create HRM-specific hooks that are thin wrappers over the same underlying logic:

- `useHrmForms` – list (filters by region, status, search).
- `useHrmForm` – single template (with nested structure).
- `useCreateHrmForm` – create new.
- `useUpdateHrmForm` – update existing.
- `useDeleteHrmForm` – delete.

If you already built generic hooks for `useHomeForms` that accept a `kind` param, you can reuse them and just pass `kind='HRM'` from HRM-specific hooks.

---

## 8. Success Criteria

Forms Management HRM is considered complete when:

- `/forms-hrm` lists only templates with `kind = 'HRM'`.
- Filters (status, region, search) work correctly.
- “+ Create Form HRM” opens the builder and creates a new HRM template.
- HR templates can be edited with sections, sub‑sections, and fields using the same dialogs as Home MGT.
- Publish and Save Draft flows set `status` correctly and show confirmation.
- Viewer page for HRM forms renders sections and fields in a similar layout to Home MGT.
- Actions (edit, view, delete) work from the list.
- Duplicate (blue icon) is either implemented (clone Draft) or cleanly stubbed.
- `pnpm build` passes with 0 TypeScript errors after implementation.
