# Architecture Context

**SupportCRM** is a Next.js 15 full-stack application with PostgreSQL and Prisma ORM.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 15.x | React framework with App Router |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with theme tokens |
| **UI Components** | shadcn/ui | Latest | Radix UI primitives |
| **Backend** | Next.js API Routes | 15.x | Server-side API handlers |
| **Database** | PostgreSQL | 16.x | Relational database |
| **ORM** | Prisma | 5.x | Type-safe database client |
| **Auth** | NextAuth.js | 5.x | Authentication with credentials |
| **State Management** | Zustand | 4.x | Global state (region filter, UI) |
| **Data Fetching** | TanStack Query | 5.x | Server state management |
| **Forms** | react-hook-form | 7.x | Form validation |
| **Validation** | Zod | 3.x | Schema validation |
| **Icons** | Lucide React | Latest | Icon library |
| **Fonts** | Geist | Latest | Sans & Mono fonts |

---

## Project Structure

```
supportcrm/
├── app/
│   ├── (auth)/
│   │   └── sign-in/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # DashboardLayout wrapper
│   │   ├── dashboard/
│   │   ├── participants/
│   │   ├── hrm/
│   │   ├── support-coordination/
│   │   ├── allied-health/
│   │   ├── rostering/
│   │   ├── home-management/
│   │   ├── incidents/
│   │   ├── invoicing/
│   │   ├── reporting/
│   │   ├── forms/
│   │   ├── policies/
│   │   ├── complaints/
│   │   ├── feedback/
│   │   ├── ask/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── participants/
│   │   ├── workers/
│   │   ├── shifts/
│   │   ├── incidents/
│   │   └── ...
│   └── layout.tsx                  # Root layout
├── components/
│   ├── ui/                         # shadcn primitives (DO NOT MODIFY)
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   ├── top-navbar.tsx
│   │   └── dashboard-layout.tsx
│   ├── shared/
│   │   ├── data-table.tsx
│   │   ├── status-badge.tsx
│   │   ├── page-header.tsx
│   │   ├── kpi-card.tsx
│   │   └── empty-state.tsx
│   └── {module}/                   # Module-specific components
├── hooks/
│   ├── use-participants.ts
│   ├── use-workers.ts
│   └── ...
├── lib/
│   ├── validations/
│   │   ├── participants.ts
│   │   ├── workers.ts
│   │   └── ...
│   ├── db.ts                       # Prisma client
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts                    # Utility functions
├── store/
│   ├── region-store.ts
│   └── ui-store.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── context/                        # AI agent context files
│   ├── AGENTS.md
│   ├── ai-workflow-rules.md
│   ├── architecture-context.md     # ← YOU ARE HERE
│   ├── code-standards.md
│   ├── ui-context.md
│   ├── progress-tracker.md
│   └── feature-specs/              # Incremental feature specs
└── public/
```

---

## Core Data Model

### Key Entities

```prisma
// Core NDIS participant
model Participant {
  id                    String   @id @default(cuid())
  firstName             String
  lastName              String
  gender                String
  dateOfBirth           DateTime
  primaryEmailAddress   String
  primaryPhoneNumber    String
  secondaryPhoneNumber  String?
  ndisNumber            String   @unique
  address               String
  suburb                String
  state                 String
  postcode              String
  status                String   // Active, Inactive
  serviceSupport        String   // Core, Capacity Building, Capital
  auditParticipation    Boolean  @default(false)
  regionId              String

  region                Region   @relation(fields: [regionId], references: [id])
  ndisPlans             NDISPlan[]
  documents             Document[]
  notes                 Note[]
  shifts                Shift[]
  incidents             Incident[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// NDIS Plan for participant
model NDISPlan {
  id              String      @id @default(cuid())
  participantId   String
  planStartDate   DateTime
  planEndDate     DateTime
  managementStyle String      // NDIA Managed, Plan Managed, Self Managed
  totalBudget     Float
  usedBudget      Float       @default(0)

  participant     Participant @relation(fields: [participantId], references: [id])

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// Staff/Support Worker
model Worker {
  id                  String   @id @default(cuid())
  firstName           String
  lastName            String
  email               String   @unique
  phoneNumber         String
  role                String   // Support Worker, Allied Health, Support Coordinator
  status              String   // Active, Inactive, On Leave
  policeCheckExpiry   DateTime?
  wwccExpiry          DateTime?
  regionId            String

  region              Region   @relation(fields: [regionId], references: [id])
  shifts              Shift[]
  incidentsReported   Incident[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// SIL/SDA Property
model HomeProperty {
  id                  String   @id @default(cuid())
  regionId            String
  streetAddress       String
  suburb              String
  state               String
  postalCode          String
  propertyType        String
  sdaType             String?  // Specialist Disability Accommodation
  totalRooms          Int
  totalBathrooms      Int
  totalKitchens       Int
  totalParkingSpaces  Int
  totalSharedSpaces   Int
  hasFrontYard        Boolean  @default(false)
  hasBackyard         Boolean  @default(false)
  hasSwimmingPool     Boolean  @default(false)
  vacancyStatus       String   // Available, Full, Partial
  status              String   // Active, Inactive

  region              Region   @relation(fields: [regionId], references: [id])

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// Incident reporting
model Incident {
  id                String      @id @default(cuid())
  participantId     String
  reportedById      String
  workersInvolved   String[]    // JSON array of worker IDs
  incidentDate      DateTime
  reportableType    String      // Reportable, Non-Reportable
  outcomeType       String
  description       String      @db.Text
  status            String      // Draft, Submitted, Under Review, Resolved
  regionId          String

  participant       Participant @relation(fields: [participantId], references: [id])
  reportedBy        Worker      @relation(fields: [reportedById], references: [id])
  region            Region      @relation(fields: [regionId], references: [id])

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

// Rostering & Shifts
model Shift {
  id              String      @id @default(cuid())
  participantId   String
  workerId        String
  supportItem     String      // NDIS support item code
  startDateTime   DateTime
  endDateTime     DateTime
  status          String      // Scheduled, Completed, Cancelled
  regionId        String

  participant     Participant @relation(fields: [participantId], references: [id])
  worker          Worker      @relation(fields: [workerId], references: [id])
  region          Region      @relation(fields: [regionId], references: [id])
  timesheet       Timesheet?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// Timesheet for invoicing
model Timesheet {
  id              String   @id @default(cuid())
  shiftId         String   @unique
  actualStartTime DateTime
  actualEndTime   DateTime
  breakMinutes    Int      @default(0)
  totalHours      Float
  approvedBy      String?
  approvedAt      DateTime?
  status          String   // Pending, Approved, Rejected

  shift           Shift    @relation(fields: [shiftId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Region (tenant segmentation within single org)
model Region {
  id              String         @id @default(cuid())
  name            String         @unique
  state           String
  isActive        Boolean        @default(true)

  participants    Participant[]
  workers         Worker[]
  homes           HomeProperty[]
  incidents       Incident[]
  shifts          Shift[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

---

## Architecture Invariants

**DO NOT VIOLATE THESE RULES:**

1. **Single Organisation:** All data belongs to one NDIS provider. No multi-tenancy in Phase 1.
2. **Region Filter is Global:** Every list query must accept `regionId` filter from Zustand store.
3. **Soft Deletes:** Never hard-delete records. Add `deletedAt` field and filter in queries.
4. **Audit Logging:** Every CUD operation (Create/Update/Delete) must log to `AuditLog` table.
5. **NDIS Compliance:** Incident workflow must enforce state transitions (Draft → Submitted → Under Review → Resolved).
6. **Timesheet → Invoice Pipeline:** Only "Approved" timesheets can be invoiced.
7. **Token-Based Styling:** Never use raw hex or Tailwind shortcuts. Always use CSS variables from `globals.css`.

---

## Authentication & Authorization

### NextAuth v5 Configuration

- **Provider:** Credentials (email + password).
- **Session Strategy:** JWT.
- **Session Data:**
  ```typescript
  {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;        // Admin, Support Coordinator, Worker, Allied Health
      regionId: string;    // Default region for user
    }
  }
  ```

### RBAC Rules

| Role | Can Access |
|------|------------|
| **Admin** | All modules, all regions |
| **Support Coordinator** | Participants, Support Coordination, Reporting (own region) |
| **Allied Health** | Allied Health module, assigned participants only |
| **Support Worker** | Rostering, Timesheets (own shifts only) |

**Middleware:** Protect all `/dashboard/*` routes. Redirect unauthenticated users to `/sign-in`.

---

## API Design Principles

1. **RESTful routes:** Follow Next.js App Router conventions.
2. **Response format:**
   ```typescript
   {
     success: boolean;
     data?: any;
     error?: string;
   }
   ```
3. **Pagination:** Use `page` and `limit` query params. Return `{ data, total, page, pageSize }`.
4. **Filtering:** Accept `regionId`, `status`, `search` query params.
5. **Error handling:** Return appropriate HTTP status codes (400, 401, 403, 404, 500).

---

## Database Migration Strategy

- Use **Prisma Migrate** for all schema changes.
- Never edit migration files manually.
- Migration naming: `prisma migrate dev --name add-participants`

---

## Performance Considerations

1. **Database Indexes:** Add indexes on foreign keys and frequently filtered columns.
2. **Query Optimization:** Use Prisma `select` to fetch only required fields.
3. **Caching:** Use TanStack Query's built-in caching (5 min default).
4. **Pagination:** Always paginate list queries (default 20 items per page).

---

## File Storage

**Phase 1:** Store file metadata in `Document` table, upload files to Vercel Blob Storage.

```prisma
model Document {
  id              String      @id @default(cuid())
  participantId   String
  fileName        String
  fileUrl         String
  fileType        String      // PDF, Image, etc.
  uploadedBy      String

  participant     Participant @relation(fields: [participantId], references: [id])

  createdAt       DateTime    @default(now())
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/supportcrm"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret"

# File Storage
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Database migrations
pnpm prisma migrate dev
pnpm prisma studio

# Build for production
pnpm build

# Linting
pnpm lint
```
