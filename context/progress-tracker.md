# Progress Tracker

---

## Current Phase

**Phase 0: Project Initialization**

---

## Current Goal

**Install the required tech stack and initialize the Next.js 15 project with all dependencies.**

---

## Completed

None yet. Project is starting from scratch.

---

## In Progress

- [x] **Step 1:** Initialize Next.js 15 with TypeScript and Tailwind CSS v4
- [x] **Step 2:** Install and configure shadcn/ui components
- [x] **Step 3:** Set up PostgreSQL database and Prisma ORM
- [ ] **Step 4:** Configure NextAuth.js v5 for authentication
- [ ] **Step 5:** Install additional dependencies (Zustand, TanStack Query, etc.)
- [ ] **Step 6:** Apply SupportCRM brand tokens to `globals.css`
- [ ] **Step 7:** Set up Geist fonts
- [ ] **Step 8:** Create initial project structure (folders, layouts)
- [ ] **Step 9:** Verify clean build with `pnpm build`

---

## Phase Roadmap

### Phase 0: Project Initialization ⬅️ YOU ARE HERE
**Goal:** Set up the development environment and install all required dependencies.

**Steps:**
1. Initialize Next.js 15 with TypeScript, ESLint, Tailwind CSS v4
2. Install shadcn/ui and add core components (Button, Card, Dialog, Sheet, Input, Tabs, etc.)
3. Set up PostgreSQL locally and configure Prisma
4. Install NextAuth.js v5 and configure credentials provider
5. Install Zustand for global state management
6. Install TanStack Query for server state
7. Install react-hook-form and Zod for form handling
8. Apply SupportCRM theme tokens to `globals.css`
9. Install Geist fonts via `pnpm add geist`
10. Create folder structure (`components/ui`, `components/shared`, `store`, `hooks`, `lib`, etc.)
11. Verify `pnpm build` passes with no errors

---

### Phase 1: Foundation & Layout
**Goal:** Build the core layout (Sidebar, TopNavbar, Dashboard placeholder).

**Steps:**
1. Create Zustand stores (`region-store.ts`, `ui-store.ts`)
2. Build `AppSidebar` component (16 items, section labels, active route highlight, collapse to icon-only)
3. Build `TopNavbar` component (toggle, logo, Region selector, search, user avatar menu)
4. Build `DashboardLayout` component (sidebar + navbar wrapper, dynamic margin on collapse)
5. Build shared components (`DataTable`, `StatusBadge`, `PageHeader`, `KPICard`, `EmptyState`)
6. Build Dashboard placeholder page (4 KPI cards)
7. Verify `pnpm build` passes

---

### Phase 2: Authentication
**Goal:** Implement NextAuth.js sign-in flow with credentials provider.

**Steps:**
1. Set up NextAuth v5 configuration in `lib/auth.ts`
2. Create `middleware.ts` for route protection
3. Build sign-in page (`app/(auth)/sign-in/page.tsx`)
4. Test authentication flow (sign in, session, sign out)
5. Protect all `/dashboard/*` routes

---

### Phase 3: Core Data Models (Participants & HRM)
**Goal:** Build Participant and Worker modules with full CRUD functionality.

**Participants:**
1. Prisma schema (`Participant`, `NDISPlan`, `Document`, `Note`, `ServiceAgreement`, `Region`)
2. Run `prisma migrate dev --name add-participants`
3. Create Zod schema in `lib/validations/participants.ts`
4. Build API routes (`app/api/participants/route.ts` - GET list, POST create)
5. Create TanStack Query hook (`hooks/use-participants.ts`)
6. Build Participants list page with DataTable (region + status filter toolbar)
7. Build Add New Participant Sheet (multi-field form with react-hook-form)
8. Build Participant Profile page (5 inner tabs: Details, NDIS Plans, Documents, Notes, Service Agreements)

**HRM (Workers):**
1. Prisma schema (`Worker`, `ComplianceRecord`)
2. Run `prisma migrate dev --name add-workers`
3. Create Zod schema in `lib/validations/workers.ts`
4. Build API routes (`app/api/workers/route.ts`)
5. Create TanStack Query hook (`hooks/use-workers.ts`)
6. Build HRM Worker list page
7. Build Add Worker Sheet
8. Build Hiring Pipeline view (future)

---

### Phase 4: Operations (Rostering & Allied Health)
**Goal:** Build shift scheduling and Allied Health service tracking.

**Rostering:**
1. Prisma schema (`Shift`, `Timesheet`, `SupportItem`)
2. FullCalendar integration (Participant/Worker toggle, Weekly/Fortnightly)
3. Add Shift modal
4. Timesheets list with approval workflow

**Allied Health:**
1. Allied Health sub-tabs and dashboard charts
2. Service delivery tracking
3. NDIS claims generation

---

### Phase 5: Workflows (Incidents, Invoicing & Remaining Modules)
**Goal:** Complete all remaining modules.

**Modules:**
1. Incident Management (form + workflow board)
2. Invoicing pipeline (timesheet → invoice → export)
3. Home Management (property registry)
4. Forms Management (dynamic builder)
5. Reporting dashboards
6. Policies, Complaints, Feedback, Ask a Question
7. Settings (RBAC, Branding, Regions)

---

## Open Questions

1. **Database hosting:** Local PostgreSQL for development. Use Supabase or Neon for production?
2. **File storage:** Vercel Blob vs AWS S3 for document uploads?
3. **NDIS invoice export format:** PACE format or legacy PRODA CSV?
4. **Email provider:** Resend or Nodemailer for notifications?

---

## Architecture Decisions

- **Tailwind v4** via `@tailwindcss/postcss`. Tokens via `@theme inline` (no `tailwind.config.js`).
- **Light theme default.** Dark mode via `data-theme="dark"`. All tokens in `:root`.
- **shadcn aliases** mapped to project tokens in `globals.css`.
- **Right-side Sheet** for complex forms. Centered Dialog for confirmations only.
- **Single-org architecture** (Phase 1). No multi-tenancy.
- **NextAuth v5** credentials. Session: `{ user: { id, name, email, role, regionId } }`.

---

## Session Notes

### Session 1 (Current)
**Date:** May 21, 2026

**Goal:** Initialize project and install all dependencies.

**Tasks:**
- [x] Run `npx create-next-app@15 supportcrm` with TypeScript, ESLint, Tailwind CSS v4, App Router
- [x] Install shadcn/ui CLI: `npx shadcn@latest init`
- [x] Add shadcn components: Button, Card, Dialog, Sheet, Input, Tabs, Textarea, ScrollArea, DropdownMenu, Select, Badge, Avatar, Separator, Tooltip, Skeleton, Table
- [x] Install Prisma: `pnpm add prisma @prisma/client && pnpm prisma init`
- [ ] Install NextAuth: `pnpm add next-auth@beta`
- [ ] Install Zustand: `pnpm add zustand`
- [ ] Install TanStack Query: `pnpm add @tanstack/react-query`
- [ ] Install react-hook-form + Zod: `pnpm add react-hook-form @hookform/resolvers/zod zod`
- [ ] Install Lucide icons: `pnpm add lucide-react`
- [ ] Install Geist fonts: `pnpm add geist`
- [ ] Install toast notifications: `pnpm add sonner`
- [ ] Apply SupportCRM theme tokens to `app/globals.css`
- [ ] Create folder structure
- [ ] Run `pnpm build` to verify setup

**Notes:**
- Starting fresh with Next.js 15 (latest stable).
- Using Tailwind CSS v4 with `@theme inline` for token-based design system.
- PostgreSQL connection string will be added to `.env` after database setup.
- **Step 1 completed:** Next.js 15.5.18, React 19.1.0, Tailwind CSS 4.3.0, `@tailwindcss/postcss` 4.3.0, TypeScript 5.9.3, ESLint 9.x. `pnpm build` passes clean.
- **Step 2 completed:** shadcn/ui initialized (style: base-nova, baseColor: neutral, cssVariables: true, iconLibrary: lucide). 16 components installed: Button, Card, Dialog, Sheet, Input, Tabs, Textarea, ScrollArea, DropdownMenu, Select, Badge, Avatar, Separator, Tooltip, Skeleton, Table. `components.json` created. `lib/utils.ts` created with `cn()` helper. `pnpm build` passes clean.
- **Step 3 completed:** Prisma 7.8.0 installed. Region model defined in `prisma/schema.prisma`. `lib/db.ts` created with singleton PrismaClient. Database migration pending (PostgreSQL connection needed). Note: Prisma 7 moves `url` from schema to `prisma.config.ts`; `prisma-client-js` provider retained for `@prisma/client` import compatibility. `pnpm build` passes clean.

---

## Critical Rules Reminder

- **Do not modify `components/ui`** → generated shadcn primitives.
- **Use token variables for all colours** → `bg-[var(--color-bg)]`, `text-[var(--color-text)]`, etc.
- **No raw hex values** or Tailwind colour shortcuts.
- **Region filter is global state** → Zustand `regionStore`.
- **Single-organisation architecture** → no multi-tenancy in Phase 1.
- **Update this file** (`progress-tracker.md`) after each meaningful step.
