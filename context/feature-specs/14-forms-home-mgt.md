# Forms Home MGT Module - Feature Specification

---

## 1. Module Purpose

Forms Home MGT lets admins build and manage **home management–specific forms** (e.g. “Nearby Facilities”, “Trades”, “Utility Provider Listing”) and lets staff fill those forms in a structured way.

It has two main experiences:

1. **Form Builder (Admin)** — Create, edit, publish, and manage form templates composed of sections, sub‑sections, and fields.
2. **Form Viewer (Staff)** — Fill in a published form template in a clean, read‑only‑layout style (like “Nearby Facilities”).

This spec covers:

- Forms list for Home MGT.
- Create/Edit Form builder.
- Section and Sub‑section dialogs.
- Section Input Field dialog.
- Publish / Save Draft / Clear & Exit behaviour.
- Simple form‑filling view for a published form.

---

## 2. Core Data Model

### 2.1 FormTemplate

Represents a reusable form design (not a single submission).

Fields:

- `id`
- `title` – e.g. “Nearby Facilities”.
- `category` – e.g. “Property Management”.
- `subcategory` – optional text (can be “-” in table).
- `description` – short description shown in builder.
- `status` – enum: “Draft”, “Published”, “Archived”.
- `kind` – enum or tag to distinguish “HomeMgt” vs other form areas (so Home MGT has its own page).
- `regionId` – optional region filter.
- `createdBy` / `createdByName`.
- `createdAt`, `updatedAt`.

### 2.2 FormSection

A top-level section inside a form template (e.g. a block under “Create New Form”).

Fields:

- `id`
- `formTemplateId` – relation to FormTemplate.
- `title` – section title.
- `order` – numeric order for sorting.
- `addOther` flag not required here (it belongs to sub‑sections).

### 2.3 FormSubSection

Optional grouping inside a section.

Fields:

- `id`
- `formSectionId` – relation to FormSection.
- `title`
- `order`
- `addOther` – boolean; if true, in the viewer you can show an “Add Other” text field or row (like the “Add Other” button in Nearby Facilities).

### 2.4 FormField

Represents one input in a section or sub‑section (e.g. “Nearby Shopping Centre”).

Fields:

- `id`
- `formSectionId` – if the field belongs directly under a section.
- `formSubSectionId` – if the field belongs under a sub‑section (one of section or subsection is required).
- `label` – field label.
- `type` – enum: “ShortText”, “LongText”, (you can keep this small to start; future: Select, Checkbox, etc.).
- `required` – boolean.
- `fullWidth` – boolean (matches “Full Width Column” Yes/No).
- `addedInSupportPlan` – boolean.
- `dependentOnFieldId` – optional ID; used if “Is Dependent On Other Field?” is Yes.
- `hint` – rich text for helper text.
- `legalReference` – rich text with legal reference content.
- `order` – numeric order among siblings.

### 2.5 FormSubmission (optional for now)

For this first pass you can keep submissions out of scope, or add a simple model:

- `id`
- `formTemplateId`
- `data` – JSON of responses.
- `regionId`, `createdBy`, `createdAt`.

Publisher/viewer wiring can be done so that publishing only concerns templates; submissions can be a later spec.

---

## 3. Forms Home MGT List Page

Route: `/forms-home-mgt` (or similar; match your sidebar slug).

### Header

- Title: “Forms”.
- Subtitle: “All your Forms in one place”.
- Right side:
  - Region selector (“Selected Regions”).
  - Status filter dropdown (e.g. “Publish” / “Draft”).
  - “+ Create Home Forms” button (opens New Form builder page).
  - Bell icon.

### Filters

- Left dropdown: filter by category or status (screenshot shows one blank select, one with “Publish”).
- Right search input: placeholder “Search”.

### Table Columns

- **Title** – form template title (sortable).
- **Category** – category text (e.g. “Property Management”).
- **Subcategory** – show text or “-”.
- **Action** – icons:
  - Green pencil – edit form builder.
  - Yellow eye – preview/read‑only view.
  - Blue duplicate – clone form template (optional).
  - Red trash – delete template (with confirmation).

### Empty State

- Show “No Data Found !” aligned with existing modules when list is empty.

### Behaviour

- Region filter + status filter + search work together (AND logic).
- Pagination like other modules (Showing X to Y of Z results).

---

## 4. Create / Edit Form Builder Page

Route example: `/forms-home-mgt/new` and `/forms-home-mgt/[id]/edit`.

### Header

- Top breadcrumb line: “Dashboard > Forms List > New Form” or “Edit Form”.
- Main title: “Create New Form” (or “Edit Form”).
- Subtitle: “Supercharge your business with customisation on the standard forms.”
- Right side: Region selector + icons (consistent with other pages).

### Main Form Info (top section)

Inputs:

1. **Title** – required text field.
2. **Form Category** – dropdown (e.g. “Property Management”).
3. **Description** – multiline text area.

Below that:

- A list of existing sections in order.
- For each section:
  - Section title row with menu (3 dots) for future actions.
  - Underneath:
    - List of existing sub‑sections and fields.
    - Two inline actions:
      - “+ Add new field”.
      - “+ Add new Sub Section”.
- At the bottom of the page:
  - “+ Add New Section” link to open the Add New Section dialog.

### Footer Buttons

Bottom‑right:

- **Clear & Exit** – resets builder and returns to list. Ask for confirmation if unsaved changes.
- **Publish** – opens confirmation modal.
- **Save As Draft** – saves current state with status “Draft” and stays on page (or navigates back, up to you).

### Publish Confirmation

Simple modal:

- Title: “Confirm your action?”
- Text: “Are you sure to publish this form?”
- Left button: “No, take me back!”
- Right button: “Yes, go ahead!”

On confirm:

- Set `status` to “Published”.
- Save template, redirect to list or stay with success toast.

---

## 5. Add New Section Dialog

Trigger: “+ Add New Section” link in the builder.

Dialog:

- Title: “Add New Section”.
- Text: “Please enter following details to add new section”.
- Fields:
  - **Section Title** – required text input.

Buttons:

- “Close” – cancels, no changes.
- “Save Changes” – creates section at the bottom (highest order index) and closes dialog.

---

## 6. Add New Sub Section Dialog

Trigger: “+ Add new Sub Section” under a specific section.

Dialog:

- Title: “Add New Sub Section”.
- Text: “Please enter following details to add new sub section”.
- Fields:
  - **Sub Section Title** – required text input.
  - **Add Other** – dropdown Yes/No.  
    - If “Yes”, the viewer should show an “Add Other” behaviour inside this sub‑section (e.g. extra free‑text row or button like in Nearby Facilities).

Buttons:

- “Close”.
- “Save Changes”.

On save:

- New sub‑section appears under the chosen section, initially with no fields.

---

## 7. Add Section Input Field Dialog

Trigger: “+ Add new field” under a section or sub‑section.

Dialog structure (from screenshots):

- Title: “Add Section Input Field”.
- Intro: “Please enter following details to add section input field”.

Fields, in order:

1. **Label** – required text input (the visible field label in the final form).
2. **Type** – dropdown:
   - Start minimal: Text, Textarea.  
   - Future expansion: Number, Select, Date, etc.
3. **Required** – dropdown Yes/No.
4. **Full Width Column** – dropdown Yes/No.
5. **Added In Support Plan** – dropdown Yes/No (boolean flag).
6. **Is Dependent On Other Field?** – dropdown Yes/No.
   - If Yes, show an extra dropdown to choose `dependentOnFieldId` from existing fields in same section/sub‑section.
7. **Hint** – rich text editor (Paragraph + formatting toolbar).
8. **Legal Reference** – rich text editor.

Buttons:

- “Close”.
- “Save Changes”.

On save:

- Create a FormField record attached either to the section or to the selected sub‑section, with appropriate `order` at the end.

---

## 8. Form Viewer (Read-Only Layout / Fill Mode)

The screenshot for “Nearby Facilities” suggests:

Route example: `/forms-home-mgt/[id]/view` or `/forms-home-mgt/[id]/publish/read-only`.

Layout:

- Page title: Form title (“Nearby Facilities”).
- The top header bar with a pill indicator (you can approximate with a simple banner).
- Card containing:
  - Section title: e.g. “Nearby Facilities”.
  - Sub‑section label, if present.
  - Inputs presented as text fields side‑by‑side (2‑column grid on desktop):
    - e.g. “Nearby Shopping Centre”, “Nearby Bus Stop”, “Nearby Train Station”, “Nearby Hospital”.
  - On the right: “Add Other” button if the sub‑section has `addOther = true`.
    - Clicking “Add Other” adds another row/field for an extra value (simple text input).
- Bottom of the card:
  - “Clear & Exit” button to reset fields and move back.

For this phase, you can implement viewer as a simple **client-only form** that:

- Uses FormTemplate → sections → sub‑sections → fields to render labeled text inputs.
- Saves responses in local state (no submission model required yet).
- “Clear & Exit” navigates back to list.

Later specs can add real FormSubmission storage.

---

## 9. API & Hooks (High Level)

You can follow the same pattern as other modules:

- Endpoints:
  - `GET /api/home-forms` – list with filters (region, status, search).
  - `POST /api/home-forms` – create new template.
  - `GET /api/home-forms/[id]` – fetch full form template with sections, sub‑sections, fields.
  - `PATCH /api/home-forms/[id]` – update template and its structure.
  - `DELETE /api/home-forms/[id]` – delete template.
- Hooks:
  - `useHomeForms` – list.
  - `useHomeForm` – single with nested structure.
  - `useCreateHomeForm`, `useUpdateHomeForm`, `useDeleteHomeForm`.

For this spec, the exact implementation details can follow your existing pattern in Participants and Policies.

---

## 10. Success Criteria

The Forms Home MGT module is considered complete when:

- The Forms list page shows Home MGT form templates with Title, Category, Subcategory, Action.
- Filters (status, region, search) work.
- New form can be created with Title, Category, Description.
- Sections can be added, edited (title), and ordered.
- Sub‑sections can be added with Add Other toggle.
- Fields can be added with the full dialog (label, type, required, full width, added in support plan, dependent, hint, legal reference).
- Draft vs Published status is handled via Save As Draft / Publish, with confirmation modal for Publish.
- “Nearby Facilities” style viewer page can render a published form with correct field layout and Add Other behaviour.
- `pnpm build` passes with no TypeScript errors.