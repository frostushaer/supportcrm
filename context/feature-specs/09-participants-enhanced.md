# Participants Module - Complete Feature Spec
## Based on Vertex360 Reference

---

## Goal
Build a complete Participants module matching Vertex360 functionality with 11 tabs, Quick View sidebar, bulk import, and comprehensive participant management.

---

## Routes

- `/participants` → List page with filters, search, Quick View
- `/participants/[id]` → Profile page with 11 tabs

---

## Database Schema Updates

### Add to `prisma/schema.prisma`:

```prisma
model Participant {
  id                      String    @id @default(cuid())
  
  // Personal Details
  firstName               String
  lastName                String
  gender                  String
  dateOfBirth             DateTime
  languageSpoken          String?
  culturalBackground      String?
  ethnicity               String?
  aboutMe                 String?   @db.Text
  
  // Contact
  primaryEmailAddress     String
  primaryPhoneNumber      String
  secondaryPhoneNumber    String?
  address                 String
  suburb                  String
  state                   String
  postcode                String
  
  // Emergency Contact
  emergencyContactName    String?
  emergencyContactNumber  String?
  
  // NDIS
  ndisNumber              String    @unique
  planNominee             String?
  serviceStartDate        DateTime?
  serviceEndDate          DateTime?
  
  // Support Coordination
  serviceSuppor           String    // Core, Capacity Building, Capital
  auditParticipation      Boolean   @default(false)
  participantConditions   String?
  importantAlert          String?   @db.Text
  shiftInstructions       String?   @db.Text
  
  // External Coordinator
  externalCoordinatorName     String?
  externalCoordinatorEmail    String?
  externalCoordinatorPhone    String?
  externalCoordinatorCompany  String?
  
  // Status & Settings
  status                  String    @default("Active") // Active, Inactive
  timezone                String?
  planManagedBy           String?
  
  // Meta
  regionId                String
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  
  // Relations
  region                  Region           @relation(fields: [regionId], references: [id])
  ndisPlans               NDISPlan[]
  documents               Document[]
  caseNotes               CaseNote[]
  medications             Medication[]
  shiftNotes              ShiftNote[]
  tasks                   Task[]
  appointments            Appointment[]
  goals                   Goal[]
  likes                   Like[]
  dislikes                Dislike[]
  riskAssessments         RiskAssessment[]
  formSubmissions         FormSubmission[]
  fundingAllocations      FundingAllocation[]
}

model NDISPlan {
  id                String      @id @default(cuid())
  participantId     String
  planStartDate     DateTime
  planEndDate       DateTime
  managementStyle   String      // NDIA Managed, Plan Managed, Self Managed
  totalFunding      Float
  totalAllocated    Float       @default(0)
  totalDelivered    Float       @default(0)
  status            String      // Active, Expired
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model CaseNote {
  id                String      @id @default(cuid())
  participantId     String
  subject           String?
  content           String      @db.Text
  date              DateTime    @default(now())
  timeSpent         String?     // "00:30" format
  howContacted      String?     // Phone, Email, In-Person
  travelKm          String?
  billable          Boolean     @default(false)
  showToWorker      Boolean     @default(false)
  attachmentUrl     String?
  createdBy         String
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Medication {
  id                String      @id @default(cuid())
  participantId     String
  medicationName    String
  dosage            String?
  frequency         String?
  prescribedBy      String?
  startDate         DateTime?
  endDate           DateTime?
  notes             String?     @db.Text
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model ShiftNote {
  id                String      @id @default(cuid())
  participantId     String
  shiftDate         DateTime
  workerId          String?
  content           String      @db.Text
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
}

model Task {
  id                String      @id @default(cuid())
  participantId     String
  title             String
  description       String?     @db.Text
  dueDate           DateTime?
  dueTime           String?
  priority          String      @default("Medium") // Low, Medium, High
  status            String      @default("Pending") // Pending, In Progress, Completed
  category          String?
  staffNotes        String?     @db.Text
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Appointment {
  id                String      @id @default(cuid())
  participantId     String
  title             String
  appointmentDate   DateTime
  appointmentTime   String?
  location          String?
  notes             String?     @db.Text
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
}

model Goal {
  id                String      @id @default(cuid())
  participantId     String
  description       String      @db.Text
  goalType          String      // Short Term, Long Term
  progress          Int         @default(0) // 0-100%
  achievementNotes  String?     @db.Text
  hurdles           String?     @db.Text
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model Like {
  id                String      @id @default(cuid())
  participantId     String
  description       String
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
}

model Dislike {
  id                String      @id @default(cuid())
  participantId     String
  description       String
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
}

model Document {
  id                String      @id @default(cuid())
  participantId     String
  fileName          String
  fileUrl           String
  fileType          String
  fileSize          Int
  uploadedBy        String
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
}

model RiskAssessment {
  id                String      @id @default(cuid())
  participantId     String
  formName          String
  status            String      // Draft, Submitted, Approved
  likelihood        String?
  impact            String?
  riskRating        String?
  submittedDate     DateTime?
  expiryDate        DateTime?
  createdBy         String
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model FormSubmission {
  id                String      @id @default(cuid())
  participantId     String
  formName          String
  status            String      // Draft, Submitted, Approved
  submittedBy       String
  submittedDate     DateTime?
  lastUpdatedBy     String?
  lastUpdatedDate   DateTime?
  expiryDate        DateTime?
  version           Int         @default(1)
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model FundingAllocation {
  id                String      @id @default(cuid())
  participantId     String
  fundingId         String
  startDate         DateTime
  endDate           DateTime
  totalFunding      Float
  totalAllocated    Float       @default(0)
  totalDelivered    Float       @default(0)
  unallocated       Float
  status            String      // Active, Expired
  
  participant       Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

---

## Part 1: List Page with Quick View

**File:** `app/(dashboard)/participants/page.tsx`

### Features:
- **Filter Toolbar**: Status, Service Support, Audit Participation, Search
- **Action Buttons**: Import Participant List, Add New Participant
- **Data Table** Columns:
  - Avatar with initials
  - Participant Name
  - Contact (phone + email)
  - Status badge
  - Service Type badge
  - Assigned Workers
  - Created Date
  - Actions (eye icon → Quick View)
- **Quick View Sidebar**: Slides from right, shows Quick Snapshot + Case Notes

---

## Part 2: Profile Page - 11 Tabs

**File:** `app/(dashboard)/participants/[id]/page.tsx`

### Tab Structure:

#### 1. Overview Tab
**Components:**
- Quick Snapshot card (blue gradient)
  - Address, Primary Disability, Emergency Contact
  - Participant Phone, Email
  - NDIS No., DOB, Service Start/End Date
  - Plan Nominee, Public Guardian, Child Safety Officer
  - External Coordinator (Name, Email, Phone, Company)
  
- Goals, Likes & Dislikes card (purple-to-red gradient)
  - Goals section with "Add Goal" button
    - Goal dialog: Description, Goal Type (Short/Long Term), Progress %, Achievement Notes, Hurdles
  - Likes section with "Add/Edit Likes" button
  - Dislikes section with "Add/Edit Dislikes" button

- Support Plan card (blue)
  - DOB display
  - Link: "To add Information on Support Plan, Please submit initial assessment form"

#### 2. Case Notes Tab
**Features:**
- Add Case Note button → opens rich text editor sheet
- Filter: By Shift Date (date range picker), By Worker dropdown
- Export button
- Table columns: Subject, Content preview, Date, Time Spent, How Contacted, Travel (KM), Billable, Show to Worker, Actions
- Case Note Form fields:
  - Subject Line
  - Rich text editor (Bold, Italic, Link, Lists, Indent, Image, Quote, Table, Video, More)
  - Date picker
  - Attachment upload (PDF, DOC, DOCX, CSV, XLSX, XLS, PNG, JPG, JPEG, GIF, ZIP - up to 5MB)
  - Time Spent (HH:MM)
  - How Contacted (dropdown)
  - Travel (KM)
  - Billable toggle
  - Show to worker toggle

#### 3. Medication Tab
**Dropdown sub-tabs:**
- Medication Listing
- Medication History

**Features:**
- Add Medication button
- Search medications by name
- Type filter dropdown
- Table: Medication name, Dosage, Frequency, Prescribed By, Dates, Actions

#### 4. Shift Notes Tab
**Features:**
- Filter By Shift Date (3 months max range)
- Filter By Worker dropdown
- Export button
- Table: Date, Worker, Note content, Actions
- Empty state: "No Notes Found! Try adjusting your filters to see more results"

#### 5. Tasks Tab
**Toggle views:**
- List view
- Calendar view (monthly grid)

**Features:**
- Create Task button → opens dialog
- Filter dropdowns: Time, Status, Priority, Category
- Task stats cards (colored):
  - Total Tasks (blue)
  - Overdue (red)
  - Due Today (orange)
  - This Week (yellow)
  - Upcoming (purple)
  - Completed (green)

**Task Dialog:**
- Title
- Description textarea
- Due Date + Due Time
- Priority dropdown (Low/Medium/High)
- Status dropdown (Pending/In Progress/Completed)
- Category dropdown
- Staff Notes textarea (internal, not visible to participant)

#### 6. Funding Tab
**Features:**
- Add Funding button
- Table: Funding ID, Start Date, End Date, Total Funding, Total Allocated, Total Delivered, Unallocated, Status, Actions
- Empty state: "No funding data found! Add funding setup to get started"

#### 7. Forms Tab
**Dropdown sub-tabs:**
- Participant Assessment
- Risk Management Forms (shows Risk Assessment subtab + Risk Rating subtab)

**Features:**
- Add button for each form type
- Filter dropdown (by status)
- Search bar
- Table: Form Name, Status, Created By, Submitted Date, Last Updated By, Last Updated Date, Expiry Date, Version, Actions

#### 8. Documents Tab
**Features:**
- Create Folder button
- Upload Document button
- Search files and folders
- Grid/List toggle
- Empty state: "No documents found! Upload a document to get started" with upload CTA

#### 9. Risk Assessment Tab
**Sub-tabs:**
- Risk Assessment
- Risk Rating

**Features:**
- Filter dropdown
- Search bar
- Table: Form Name, Status, Created By, Submitted Date, Last Updated By, Last Updated Date, Expiry Date, Version, Actions
- Empty state: "No Data found!"

#### 10. Appointments Tab
**Features:**
- Appointment button
- Table with empty state: "No Appointments Found! Schedule an appointment to get started"

#### 11. Settings Tab
**Sections:**

**Quick Snapshot:**
- Essential participant information card
- Add information button

**Additional Information:**
- Quick Snapshot textarea
- Status Description textarea

**Emergency Contact:**
- Name + Number fields

**Disability Information:**
- Primary Disability dropdown
- Secondary Disability dropdown
- Gender dropdown

**Additional Settings:**
- Timezone dropdown (with clock icon)
- Plan Managed By dropdown

**Support Coordination:**
- Region dropdown
- Service Support multi-select (with removable chips)
- Important Alert textarea (max 256 chars)
- Shift Instructions textarea

**Default Shift End Questions:**
- "Select up to 8 questions for participant shift end screen (Selected: 0/8)"
- Empty state: "No questions available"

**External Coordinator:**
- Name, Email, Phone, Company inputs (all with 0/255 char counters)

**Pricing:**
- Service Catalogue State dropdown
- Category Item Name dropdown
- Service Category dropdown
- Emails for Invoice input

**Payroll:**
- Xero Contact ID display
- "Connect Xero" link

**Toggles:**
- Is active (is the participant active)
- Opt-in Audit (Include this participant in audit reports and compliance checks)
- Support Coordination (Require Support Coordination Services)
- Allied Health (Require Allied Health Services)

---

## Part 3: Add New Participant Sheet

**File:** `components/participants/add-new-participant-sheet.tsx`

**Multi-section form** (right-side sheet, like Settings tab):

1. First Name, Last Name
2. Gender dropdown
3. Primary Email Address
4. Primary Phone Number, Secondary Phone Number
5. NDIS No.
6. Date of Birth (DD/MM/YYYY)
7. Street Address, Suburb
8. State dropdown, Postcode

**Add Participant button at bottom**

---

## Part 4: Import Participant List

**File:** `components/participants/import-participant-list-dialog.tsx`

**Dialog features:**
- Download Template button
- Browse / Upload File dropzone (XLSX up to 20MB)
- Supported formats: .xlsx
- Important warnings:
  - Do not change column headings
  - Remove dummy data row before proceeding
  - Fields marked with asterisk (*) are required
- Cancel / Import buttons

---

## Part 5: Quick View Sidebar

**File:** `components/participants/quick-view-sidebar.tsx`

**Triggered by:** Eye icon in list table Actions column

**Content:**
- Participant name + email header
- Close button (X)
- Quick Snapshot card (same as Overview tab)
- Case Notes section below

---

## API Routes

**New endpoints needed:**
