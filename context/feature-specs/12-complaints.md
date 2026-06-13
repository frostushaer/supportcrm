# Complaints Module - Feature Specification

---

## Module Purpose
A simple complaint tracking system where users can submit complaints, view complaint details, and search/filter through all complaints. This is a lightweight module for internal complaint management.

---

## Database Schema

### Model: Complaint

**Fields:**
- `id` - Unique identifier (auto-generated)
- `name` - Name of person filing complaint (text field, required)
- `date` - Date of complaint (date field, required)
- `subject` - Subject/title of complaint (text field, required)
- `details` - Detailed description (long text field, required)
- `submittedBy` - User ID who submitted (auto-filled from session)
- `userRole` - Role of submitter (e.g., "SP Admin", auto-filled from session)
- `regionId` - Region filter (optional)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Relations:**
- Links to Region model (optional)
- Links to User model via `submittedBy`

---

## API Routes Required

1. **GET /api/complaints** - List all complaints
   - Query params: `regionId`, `search`
   - Returns array of complaints

2. **POST /api/complaints** - Create new complaint
   - Body: name, date, subject, details
   - Auto-fills: submittedBy, userRole from session
   - Validates all required fields

3. **GET /api/complaints/[id]** - Get single complaint details
   - Returns full complaint data

---

## Page Structure

### Main Page: `/complaints`

**Header Section:**
- Page title: "Complaints"
- Description: "Directory of all complaints"
- Right side actions:
  - Region selector dropdown ("Selected Regions" with "Select..." placeholder)
  - "+ Complaint" button (opens Add dialog)
  - Search icon
  - Notification bell icon

**Search Row:**
- Search input field (right-aligned)
- Placeholder: "Search"
- Icon: Search magnifying glass

**Data Table Columns:**
1. **Name** - Name of person who filed complaint
2. **Date** - Complaint date (format: DD/MM/YYYY)
3. **Subject** - Subject/title
4. **Submitted By** - Name of user who submitted
5. **User Role** - Role of submitter
6. **Details** - Brief preview of details text
7. **Action** - Eye icon for viewing (yellow/gold color)

**Empty State:**
- Red text: "No data found !"
- Centered in table area
- Shown when no complaints exist or no search results

**Pagination:**
- "Showing X to Y of Z results" (bottom left)
- Page number buttons with prev/next arrows (bottom right)

---

## Add Complaint Dialog

**Trigger:** Click "+ Complaint" button

**Dialog Header:**
- Title: "Add Complaint"
- Close button (X icon)

**Form Layout:**
Section label: "Please add your complaint here"

**Form Fields (grid layout):**

**Row 1 (two columns):**
1. **Name** - Text input
   - Label: "Name"
   - Placeholder: (empty)
   - Required field
   - Left column

2. **Date** - Date picker
   - Label: "Date"
   - Format: DD/MM/YYYY
   - Calendar icon on right
   - Required field
   - Right column

**Row 2 (full width):**
3. **Subject** - Text input
   - Label: "Subject"
   - Placeholder: (empty)
   - Required field
   - Full width

**Row 3 (full width):**
4. **Details** - Textarea
   - Label: "Details"
   - Placeholder: (empty)
   - Multi-line text area
   - Required field
   - Full width
   - Approximately 5-6 rows tall

**Bottom Actions:**
- **Submit** button (primary blue, bottom-right)

**Validation Rules:**
- All fields are required
- Show inline error messages if any field is empty on submit
- Name must be filled
- Date must be selected
- Subject must be filled
- Details must be filled

**On Submit:**
- Validate all fields
- Auto-fill submittedBy from current user session
- Auto-fill userRole from current user session
- POST to `/api/complaints`
- Show success toast: "Complaint submitted successfully!"
- Close dialog
- Refresh complaints list

---

## Complaint Information Dialog (View)

**Trigger:** Click eye icon in Action column

**Dialog Header:**
- Title: "Complaint Information"
- Close button (X icon)

**Content (Read-only):**
Section label: "Detailed complaint from [Name]"

**Display Format (label-value pairs):**

- **Name**: [Complaint name]
- **Date**: [DD/MM/YYYY]
- **Subjects**: [Subject text]  
  *(Note: Label says "Subjects" with 's')*
- **Details**: [Full details text]

**Layout:**
- All fields displayed as horizontal label-value pairs
- Labels aligned to left
- Values aligned to right side
- Clean, readable spacing

**Bottom Actions:**
- **Close** button (light red/pink color)

---

## Search Functionality

**Search input filters across:**
- Name field
- Subject field
- Details field
- Submitted By field

**Behavior:**
- Type-to-search (real-time filtering)
- Case-insensitive matching
- Shows "No data found !" if no matches

---

## Region Filter

**Located in:** Header (top right)

**Behavior:**
- Dropdown showing "Select..." placeholder
- Lists all available regions
- When selected, filters complaints to that region only
- Works together with search (AND logic)

---

## Empty States

**When no complaints exist:**
- Show "No data found !" message
- Red text color
- Centered in table area

**When search/filter returns no results:**
- Same "No data found !" message
- Suggest clearing search or changing region

---

## Success Criteria

- ✅ Complaints can be submitted with all required fields
- ✅ Complaints list displays properly with all columns
- ✅ View dialog shows full complaint details
- ✅ Search filters across name, subject, details, submittedBy
- ✅ Region filter works correctly
- ✅ Date picker allows date selection
- ✅ Validation enforces all required fields
- ✅ Auto-fills submittedBy and userRole from session
- ✅ Empty state shows when no data
- ✅ Pagination works for large datasets
- ✅ Success toast shows after submission
- ✅ Eye icon in action column is yellow/gold colored

---

## Implementation Notes

**Similarities to Ask a Question module:**
- Both are simple CRUD modules
- Both auto-fill submitter info from session
- Both have view-only dialogs
- No edit or delete functionality
- No status tracking

**Key Differences:**
- Complaints has a date field
- Complaints uses textarea (not rich text editor)
- Simpler than Feedback (no workers, participants, managers, attachments, status, etc.)

**Components to Reuse:**
- PageHeader
- DataTable
- Dialog components from shadcn/ui
- DatePicker
- Search input
- Region selector

**Patterns to Follow:**
- Same API structure as Ask a Question
- Same TanStack Query hooks pattern
- Same validation approach (react-hook-form + Zod)
- Same dialog structure

---

## Component Files to Create

1. `app/(dashboard)/complaints/page.tsx` - Main list page
2. `components/complaints/add-complaint-dialog.tsx` - Create dialog
3. `components/complaints/complaint-info-dialog.tsx` - View dialog (read-only)
4. `lib/validations/complaints.ts` - Zod schema
5. `hooks/use-complaints.ts` - TanStack Query hooks (list, create, single)
6. `app/api/complaints/route.ts` - GET list, POST create
7. `app/api/complaints/[id]/route.ts` - GET single

---

## Migration Steps

1. Add Complaint model to `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name add-complaints`
3. Run `pnpm prisma generate`
4. Build API routes (GET list, POST create, GET single)
5. Build validation schema
6. Build TanStack Query hooks
7. Build main page with search and region filter
8. Build Add Complaint dialog
9. Build Complaint Info dialog (view-only)
10. Test all workflows
11. Update `context/progress-tracker.md`

---

## Estimated Time
**30-45 minutes** - This is one of the simplest modules in the system.

---

## Design Notes

- Keep it simple - no rich text editor needed
- No edit/delete functionality (complaints are permanent records)
- No status tracking (unlike Feedback)
- No relationships to participants/workers (unlike Feedback)
- Just basic create + read operations
- Eye icon in actions should be yellow/gold colored (warning color)