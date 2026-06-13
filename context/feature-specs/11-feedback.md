# Feedback Module - Feature Specification

---

## Module Purpose
Allow staff to submit feedback about participants or workers, track feedback status (Pending/In Progress/Completed), view feedback details, and edit existing feedback. This module supports continuous improvement plans with manager mentions and attachments.

---

## Database Schema

### Model: Feedback

**Fields:**
- `id` - Unique identifier (auto-generated)
- `participantId` - Link to participant (optional, can be null if feedback is about a worker)
- `participantName` - Text field storing participant name
- `workerId` - Link to worker (optional, can be null if feedback is about a participant)
- `workerName` - Text field storing worker name
- `mentionManagerId` - Link to manager to notify (optional)
- `mentionManagerName` - Text field storing manager name
- `type` - Feedback type: "Positive", "Negative", or "Neutral"
- `subject` - Short subject line
- `details` - Long text field (rich text content)
- `attachmentUrl` - File upload URL (optional)
- `status` - Current status: "Pending", "In Progress", or "Completed"
- `continuousImprovementPlan` - Boolean checkbox (yes/no)
- `date` - Date of feedback (date field)
- `submittedBy` - User who submitted (auto-filled from session)
- `regionId` - Region filter (optional)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Relations:**
- Links to Participant model (optional)
- Links to Worker model (optional)
- Links to Region model (optional)

---

## API Routes Required

1. **GET /api/feedback** - List all feedback with filters
   - Query params: `regionId`, `status`, `participantId`, `workerId`, `search`, `dateRange`
   - Returns array of feedback entries

2. **POST /api/feedback** - Create new feedback
   - Body: All feedback fields
   - Validates required fields
   - Auto-fills `submittedBy` from session

3. **GET /api/feedback/[id]** - Get single feedback details
   - Returns full feedback with relations

4. **PATCH /api/feedback/[id]** - Update existing feedback
   - Body: Partial feedback fields
   - Used by Edit dialog

5. **DELETE /api/feedback/[id]** - Delete feedback (optional for future)

---

## Page Structure

### Main Page: `/feedback`

**Header Section:**
- Page title: "Feedback"
- Description: "Directory of all Feedback"
- Right side actions:
  - Region selector dropdown
  - "+ Feedback" button (opens Add dialog)
  - Search icon
  - Notification bell icon

**Filter Row:**
- **Status** dropdown (Select Status, Pending, In Progress, Completed)
- **Participant** dropdown (No participants available / list of participants)
- **Manager** dropdown (No managers available / list of managers)
- **Worker** dropdown (No worker available / list of workers)
- **Date Range** picker (Select Date Range)
- **Search** input field (right-aligned with search icon)
- **Clear Filter** button (right side)

**Data Table Columns:**
1. **ID** - Feedback ID (sortable with ↕)
2. **Subject** - Subject line
3. **Submitted By** - Name of submitter
4. **Status** - Badge with status (Pending = yellow, In Progress = blue, Completed = green)
5. **Date** - Feedback date
6. **Participant(s)** - Participant name or "No participants"
7. **Manager(s)** - Manager name or "No managers"
8. **Worker(s)** - Worker name or "No workers"
9. **Action** - Icons for view (eye), edit (pencil), delete (trash)

**Empty State:**
- Red text: "No data found !"
- Shown when no feedback matches filters

**Pagination:**
- "Showing X to Y of Z results"
- Page numbers with prev/next arrows

---

## Add Feedback Dialog

**Trigger:** Click "+ Feedback" button

**Dialog Header:**
- Title: "Add Feedback"
- Close button (X)

**Form Fields (in order):**

1. **Please add your Feedback here** - Section label

2. **Participants** - Searchable dropdown
   - Placeholder: "Select..."
   - Can select one participant
   - Shows participant names from database
   - Optional field

3. **Workers** - Searchable dropdown
   - Placeholder: "Select..."
   - Can select one worker
   - Shows worker names from database
   - Optional field

4. **Mention Manager** - Searchable dropdown
   - Placeholder: "Select..."
   - Select manager to notify
   - Optional field

5. **Type*** - Required dropdown
   - Options: Negative, Positive, Neutral
   - Placeholder: "Select..."

6. **Date*** - Required date picker
   - Format: DD/MM/YYYY
   - Has calendar icon

7. **Subject*** - Required text input
   - Single line text

8. **Details*** - Required rich text editor
   - Toolbar with formatting options:
     - Paragraph dropdown
     - Bold, Italic
     - Link
     - Bullet list, Numbered list
     - Indent, Outdent
     - Image, Quote
     - Table, Video
     - More options
   - Placeholder: "Enter feedback details here..."
   - Validation: "This field is required!" shown in red if empty

9. **Attachments** - File upload area
   - Paperclip icon
   - Allowed formats: PDF, DOC, DOCX, CSV, XLSX, XLS, PNG, JPG, JPEG, GIF, ZIP
   - Max size: 5MB
   - Drag-and-drop or click to upload

10. **Continuous Improvement Plan** - Toggle/checkbox
    - Optional
    - Shows green checkmark when active

**Bottom Actions:**
- **Submit** button (primary, blue)

**Validation Rules:**
- Type, Date, Subject, Details are required (marked with *)
- Show error "This field is required!" below Details if empty
- At least one of Participants OR Workers should be selected (optional but recommended)

**On Submit:**
- Validate all required fields
- Show success toast message
- Close dialog
- Refresh feedback list

---

## Feedback Information Dialog (View)

**Trigger:** Click eye icon in Action column

**Dialog Header:**
- Title: "Feedback Information"
- Close button (X)

**Content (Read-only):**
- **ID**: [Feedback ID] 
- **Status**: Badge showing current status (with dropdown to change)
  - Dropdown options: Pending, In Progress, Completed
  - Changing status updates immediately
- **Continuous Improvement Plan**: Icon (green checkmark or red X)

**Two-column layout showing:**

**Left Column:**
- **Participants**: Name or "No participants"
- **Workers**: Name or "No workers"
- **Date**: Formatted date (DD/MM/YYYY)

**Right Column:**
- (Empty in screenshots, available for future fields)

**Full-width sections:**
- **Feedback Type**: Badge (Negative/Positive/Neutral)
- **Subject**: Subject text
- **Details**: Full formatted content (preserves rich text)
- **Attachments**: "No attachments available" or list of files with download

**Bottom Actions:**
- **Close** button (light red/pink)

---

## Edit Feedback Dialog

**Trigger:** Click pencil icon in Action column

**Dialog Header:**
- Title: "Edit Feedback"
- Close button (X)

**Content:**
- Section label: "Update the feedback information"
- **ID**: [Feedback ID] - Display only, not editable

**Form Fields (same as Add, pre-filled):**
1. Participants dropdown (pre-selected, with X to remove)
2. Workers dropdown (pre-selected)
3. Mention Manager dropdown (pre-selected)
4. Type dropdown (pre-selected, e.g., "Negative")
5. Date picker (pre-filled)
6. Subject input (pre-filled)
7. Details rich text editor (pre-filled with existing content)
8. Attachments section (shows existing files if any)
9. Continuous Improvement Plan toggle (pre-set)

**Bottom Actions:**
- **Update** button (primary, blue)
- **Close** button (light red/pink)

**On Update:**
- Validate required fields
- Save changes via PATCH API
- Show success toast
- Close dialog
- Refresh feedback list

---

## Status Change Behavior

**In Feedback Information Dialog:**
- Status shown as dropdown with current selection highlighted
- Clicking different status immediately updates via API
- Options: Pending, In Progress, Completed
- No confirmation needed (instant save)

---

## Filter Behavior

**All filters work together (AND logic):**
- Status filter shows only selected status
- Participant filter shows only feedback for that participant
- Worker filter shows only feedback for that worker
- Manager filter shows only feedback mentioning that manager
- Date range filters by feedback date
- Search searches across: Subject, Details, Participant name, Worker name

**Clear Filter button:**
- Resets all filters to default (empty)
- Reloads full list

---

## Empty States

**When no feedback exists at all:**
- Show centered message: "No data found !"
- Red text
- Encourage user to add first feedback

**When filters return no results:**
- Same "No data found !" message
- Suggest clearing filters

---

## Success Criteria

- ✅ Feedback can be created with all fields
- ✅ Feedback list displays with all filters working
- ✅ View dialog shows full feedback details
- ✅ Edit dialog allows updating feedback
- ✅ Status can be changed inline in View dialog
- ✅ Rich text editor works for Details field
- ✅ File attachments can be uploaded (up to 5MB)
- ✅ Date picker works correctly
- ✅ Participant/Worker/Manager dropdowns populate from database
- ✅ Region filter applies correctly
- ✅ Search filters across multiple fields
- ✅ Pagination works for large datasets
- ✅ All validation rules enforce required fields
- ✅ Success messages show on create/update

---

## Implementation Notes

- Use existing shared components: PageHeader, DataTable, StatusBadge
- Follow Participants module pattern for structure
- Rich text editor: Use same component as Case Notes
- File upload: Use same pattern as Documents
- Status badge colors follow existing color token patterns
- Date picker: Use shadcn/ui DatePicker component
- Dropdowns: Use shadcn/ui Select component
- Form validation: react-hook-form + Zod schema
- API calls: TanStack Query hooks pattern

---

## Component Files to Create

1. `app/(dashboard)/feedback/page.tsx` - Main list page
2. `components/feedback/add-feedback-dialog.tsx` - Create dialog
3. `components/feedback/feedback-info-dialog.tsx` - View dialog with inline status change
4. `components/feedback/edit-feedback-dialog.tsx` - Edit dialog
5. `lib/validations/feedback.ts` - Zod validation schema
6. `hooks/use-feedback.ts` - TanStack Query hooks (list, single, create, update, delete)
7. `app/api/feedback/route.ts` - GET list, POST create
8. `app/api/feedback/[id]/route.ts` - GET single, PATCH update, DELETE

---

## Migration Steps

1. Add Feedback model to `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name add-feedback`
3. Run `pnpm prisma generate`
4. Build API routes
5. Build TanStack Query hooks
6. Build validation schema
7. Build main page with filters and table
8. Build Add dialog
9. Build View dialog (with inline status change)
10. Build Edit dialog
11. Test all workflows
12. Update `progress-tracker.md`