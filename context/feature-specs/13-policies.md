# Policies Module - Feature Specification

---

## 1. Module Purpose

The Policies module stores organisation policies as uploaded documents. It allows staff to:

- Upload a policy file with a friendly display name and category.
- View and download existing policy documents.
- Delete policies that are no longer needed.
- Optionally scope policies by region via a region selector.

This is a simple CRUD module focused on file upload and listing.

---

## 2. Data Model

### Policy

Each Policy record represents one uploaded file.

Fields:

- `id`  
  Unique identifier.

- `fileName`  
  Human‑friendly name visible in the “Policies” table (entered by the user).

- `category`  
  Text field for the policy category (for now typically “Policy Document”).

- `fileUrl`  
  URL for the uploaded file in storage (S3, Vercel Blob, etc.).

- `fileType`  
  File extension or MIME type (optional, but useful for display and validation).

- `fileSize`  
  Size in bytes (optional; used for information and limits).

- `uploadedBy`  
  ID of the user who uploaded the policy.

- `uploadedByName`  
  Snapshot of the uploader’s name for easy display.

- `regionId`  
  Optional relation to Region, used by the region selector.

- `createdAt`  
  Timestamp when the policy was created.

- `updatedAt`  
  Timestamp when the policy was last updated.

Relations:

- Optional relation from `Policy.regionId` → `Region.id`.
- Optional relation from `Policy.uploadedBy` → `User.id`.

---

## 3. Main Page: `/policies`

### Header

- Title: “Policies”.
- Subtitle: “Directory of all policies”.
- Right‑side controls:
  - Region selector dropdown labelled “Selected Regions” with a “Select…” placeholder.
  - “Policy Categories” button (can be a stub that navigates to a future page or does nothing for now).
  - “+ Policy” button that opens the Add Policy dialog.
  - Notification/bell icon.

### Search

- Right‑aligned search input.
- Placeholder: “Search”.
- Filters rows by:
  - `fileName`.
  - `category`.

### Table

Columns:

1. **Policies**  
   - Displays `fileName`.  
   - Sortable ascending/descending by clicking the header.

2. **Category**  
   - Displays `category`.

3. **Actions**  
   - Three icons in a row:
     - Eye icon – opens Policy Information dialog.
     - Download icon – downloads the file at `fileUrl`.
     - Trash icon – opens delete confirmation.

Behaviour:

- Region selector filters the list by `regionId`.
- Search works together with region filter (AND logic).
- Pagination at the bottom:
  - “Showing X to Y of Z results”.
  - Page controls with previous/next arrows.

Empty state:

- When there are no policies after filters/search:
  - Show “No Data Found !” in red text, centered in the table row.

---

## 4. Add Policy Dialog

Trigger: “+ Policy” button.

### Layout

- Title: “Add Policy”.
- Intro text (optional): “Please add your policy here”.
- Large file upload zone at the top.
- Form fields below for File Name and Category.
- Primary action button at the bottom labelled “Upload Document”.

### File Upload Zone

Behaviour:

- Single file upload.
- Drag‑and‑drop area and click‑to‑select.
- Displays:
  - Icon.
  - Text similar to:
    - “Upload a file or drag and drop”
    - “PNG, JPG, JPEG, GIF, PDF, DOC, DOCX, XLSX, CSV, XLS up to 10MB”
- After selecting a file:
  - Show file name and size.
  - Allow replacing/removing the file before submitting.

Validation:

- File is required.
- File type must be in the allowed list.
- File size must be ≤ 10MB.

### Form Fields

1. **File Name***  
   - Required text input.  
   - Can be pre‑filled from the original file name (minus extension) but must be editable by the user.

2. **Category***  
   - Required dropdown.  
   - For now, a simple static list is enough, at minimum:
     - “Policy Document”.
   - Later this can be wired to the “Policy Categories” screen.

### Submit Behaviour

- On “Upload Document”:
  - Validate file, file name, and category.
  - Upload the file to the app’s storage using the same pattern as existing uploads (e.g., Documents).
  - Receive a `fileUrl` (and optionally type and size).
  - Create a new Policy record with:
    - `fileName`, `category`, `fileUrl`, `fileType`, `fileSize`.
    - `uploadedBy`, `uploadedByName` from the session.
    - `regionId` from the current region selector, if present.
  - Show a success toast.
  - Close the dialog.
  - Refresh the policies list.

---

## 5. Policy Information Dialog (View)

Trigger: Eye icon in the Actions column.

Behaviour:

- Title: “Policy Information”.
- Read‑only, no editing.

Content (label–value pairs):

- **File Name**: `fileName`.
- **Category**: `category`.
- **Uploaded By**: `uploadedByName` (if available).
- **Uploaded On**: `createdAt` formatted to a human‑friendly date.

Optional:

- A “Download” button inside the dialog that uses `fileUrl`, in addition to the table icon.

Bottom actions:

- “Close” button dismisses the dialog.

---

## 6. Delete Policy Flow

Trigger: Trash icon in Actions column.

Behaviour:

- Opens confirmation dialog:
  - Title: “Delete Policy”.
  - Message: “Are you sure you want to delete [File Name]? This action cannot be undone.”
  - Buttons:
    - “Cancel”.
    - “Delete” (destructive).

On confirm:

- Delete the Policy record from the database.
- Optionally trigger file deletion from storage using the same pattern as other modules.
- Show success toast.
- Refresh the policies list.

If storage deletion is not yet implemented, it is acceptable initially to delete only the database record.

---

## 7. API Requirements

### Endpoints

1. `GET /api/policies`
   - Returns a list of policies.
   - Supports query parameters:
     - `regionId` – filter by region.
     - `search` – filters by `fileName` or `category`.

2. `POST /api/policies`
   - Creates a new policy.
   - Accepts body with:
     - `fileName`, `category`, `fileUrl`, `fileType`, `fileSize`, `regionId`.
   - On the server, fills:
     - `uploadedBy`, `uploadedByName` from the authenticated user.

3. `GET /api/policies/[id]`
   - Returns a single policy record for the information dialog.

4. `DELETE /api/policies/[id]`
   - Deletes the policy record.
   - Optionally also deletes the file from storage.

Authentication:

- All endpoints require an authenticated user.
- `POST` and `DELETE` should be restricted to appropriate roles if role‑based access control is implemented.

---

## 8. Hooks and Client Behaviour

Create TanStack Query hooks following existing patterns:

- `usePolicies(search?: string)`  
  - Fetches list of policies.
  - Uses `regionId` from the region store and `search` string as part of the query key.

- `usePolicy(id: string)`  
  - Fetches a single policy by ID for the information dialog.

- `useCreatePolicy()`  
  - Mutation to create a new policy.
  - Invalidates the `usePolicies` query on success.

- `useDeletePolicy()`  
  - Mutation to delete a policy.
  - Invalidates the `usePolicies` query on success.

The main `/policies` page should:

- Read current region from the shared region store.
- Pass `regionId` and `search` to the `usePolicies` hook.
- Handle loading and empty states.

---

## 9. UI Components to Implement

1. `app/(dashboard)/policies/page.tsx`  
   - Header with region selector, Policy Categories button, + Policy button, search field.  
   - Policies table with columns: Policies, Category, Actions.  
   - Empty state and pagination.

2. `components/policies/add-policy-dialog.tsx`  
   - File upload area.  
   - File Name and Category fields.  
   - Upload Document button and validation.

3. `components/policies/policy-info-dialog.tsx`  
   - Read‑only view of File Name, Category, Uploaded By, Uploaded On.  
   - Close button (and optional Download button).

4. Optional: shared confirmation dialog if not already available, or reuse an existing one for deletes.

---

## 10. Success Criteria

The Policies module is considered complete when:

- Policies can be uploaded with:
  - A valid file.
  - File Name.
  - Category.
- Policies appear in the main table with correct columns.
- Region selector and search filter the list correctly.
- Eye icon opens the Policy Information dialog with correct details.
- Download icon downloads the correct file.
- Delete icon opens a confirmation dialog and removes the policy on confirmation.
- Empty state “No Data Found !” appears when applicable.
- The module follows the same visual language and interaction patterns as other modules (e.g. Feedback, Complaints, Ask a Question).