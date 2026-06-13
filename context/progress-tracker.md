# Progress Tracker

---

## Current Phase

**Phase 3 Enhanced: Participants Module (spec-09) — COMPLETE**

---

## Current Goal

**Forms Home MGT Module (spec-14) — COMPLETE**

---

## Completed

### ✅ Forms Home MGT Module — Form Builder & List (spec-14)

- [x] Step 1: Prisma models — `FormTemplate`, `FormSection`, `FormSubSection`, `FormField`
- [x] Step 2: API routes — `GET/POST /api/home-forms` and `GET/PATCH/DELETE /api/home-forms/[id]`
- [x] Step 3: TanStack Query hooks — `useHomeForms`, `useHomeForm`, `useCreateHomeForm`, `useUpdateHomeForm`, `useDeleteHomeForm`
- [x] Step 4: List page — `/forms-home-mgt` with filters, search, and delete
- [x] Step 5: Builder components — Dialogs and main `FormBuilder`
- [x] Step 6: Builder pages — `/forms-home-mgt/new` and `/forms-home-mgt/[id]/edit`
- [x] Step 7: Viewer page — `/forms-home-mgt/[id]/view`
- [x] Step 8: Database synced and `pnpm build` passes clean.

### ✅ Policies Module — Full Feature Spec (spec-13)

- [x] Step 1: Prisma schema — `Policy` model added
- [x] Step 2: Validation schema — `lib/validations/policies.ts`
- [x] Step 3: API routes — `GET/POST /api/policies`, `GET/DELETE /api/policies/[id]`
- [x] Step 4: TanStack Query hooks — `usePolicies`, `usePolicy`, `useCreatePolicy`, `useDeletePolicy`
- [x] Step 5: Main page — `/policies` with Region selector, Search, Table, and Empty state
- [x] Step 6: Dialogs — `AddPolicyDialog` (with drag & drop upload zone), `PolicyInfoDialog`, `DeletePolicyDialog`
- [x] Step 7: Database synced and `pnpm build` passes clean.

### ✅ Feedback Module — Full Feature Spec (spec-11)

- [x] Step 1: Prisma schema — `Feedback` model added
- [x] Step 2: Validation schema — `lib/validations/feedback.ts`
- [x] Step 3: API routes — `GET/POST /api/feedback`, `GET/PATCH/DELETE /api/feedback/[id]`
- [x] Step 4: TanStack Query hooks — `useFeedbacks`, `useFeedback`, `useCreateFeedback`, `useUpdateFeedback`, `useDeleteFeedback`
- [x] Step 5: Main page — `/feedback` with DataTable, filters, search, empty state
- [x] Step 6: Dialogs — `AddFeedbackDialog`, `FeedbackInfoDialog` (with status change dropdown), `EditFeedbackDialog`
- [x] Step 7: Migration generated and database synced (`pnpm prisma db push`). `pnpm build` passes clean.

---

### ✅ Ask a Question Module — Full Feature Spec (spec-10)

- [x] Step 1: Prisma schema — `Question` model added with fields: id, name, subject, category, details, userRole, submittedBy, regionId, createdAt, updatedAt
- [x] Step 2: `pnpm prisma generate` — Prisma Client regenerated with Question model
- [x] Step 3: Zod validation schema — `questionSchema` in `lib/validations/questions.ts` (name, subject, category, details, userRole, regionId)
- [x] Step 4: API routes — `GET/POST /api/questions` (list with search + create), `GET /api/questions/[id]` (single question)
- [x] Step 5: TanStack Query hooks — `useQuestions`, `useQuestion`, `useCreateQuestion` in `hooks/use-questions.ts`
- [x] Step 6: Main page — `/ask-a-question` with DataTable, region filter, search, empty state
- [x] Step 7: Ask Question Dialog — `AskQuestionDialog` component with form (name, subject, category, details)
- [x] Step 8: Question Info Dialog — `QuestionInfoDialog` component for viewing question details
- [x] Step 9: `pnpm build` passes clean — 18 routes, 0 TypeScript errors

**Notes:**
- Migration pending database reset (Prisma schema ready, client generated)
- Categories: Accounting, Compliance, IT, Legal Query, Marketing, Plan Review, Operations, HR, Finance
- Region filter integrated with global `regionStore`
- User role auto-populated from session
- Empty state: "Ask Vertex360 SME your first question!"

---

## Completed

### ✅ Phase 3 Enhanced: Participants Module — Full Feature Spec (spec-09)

- [x] Step 1: Prisma schema expanded — 13 new models added: `CaseNote`, `Medication`, `ShiftNote`, `Task`, `Appointment`, `Goal`, `Like`, `Dislike`, `RiskAssessment`, `FormSubmission`, `FundingAllocation` + expanded `Participant` (20+ new fields) + updated `NDISPlan` and `Document`
- [x] Step 2: `pnpm prisma generate` — Prisma Client regenerated with all new models
- [x] Step 3: Zod validation schemas expanded — `participantSchema` + 5 new schemas: `caseNoteSchema`, `taskSchema`, `goalSchema`, `medicationSchema`, `appointmentSchema` (all use `.optional()` not `.default()` to avoid `standardSchemaResolver` type mismatch)
- [x] Step 4: API routes — sub-entity CRUD routes created: `/api/participants/[id]/case-notes`, `/tasks`, `/goals`, `/medications`, `/appointments`, `/likes`, `/dislikes`
- [x] Step 5: `[id]/route.ts` GET updated to include all 12 relations
- [x] Step 6: TanStack Query hooks expanded — 10 new hooks: `useCaseNotes`, `useCreateCaseNote`, `useTasks`, `useCreateTask`, `useGoals`, `useCreateGoal`, `useMedications`, `useCreateMedication`, `useAppointments`, `useCreateAppointment`
- [x] Step 7: List page — enhanced with Import button, Eye icon Quick View, service support filter, badge columns, formatted dates
- [x] Step 8: `QuickViewSidebar` component — Sheet with participant snapshot + recent case notes
- [x] Step 9: `ImportParticipantDialog` — drag & drop .xlsx upload with template download stub
- [x] Step 10: `AddParticipantSheet` — rewritten as single-scroll form with all required fields
- [x] Step 11: Profile page — 11 tabs: Overview (Quick Snapshot + Goals/Likes/Dislikes), Case Notes (table), Medication (table), Shift Notes, Tasks (stats + table), Funding, Forms, Documents, Risk Assessment, Appointments, Settings
- [x] Step 12: All 5 dialogs wired with react-hook-form + standardSchemaResolver + toast feedback
- [x] Step 13: `pnpm build` passes clean — 17 routes, 0 TypeScript errors

### ✅ Phase 3: Participants Module (Original)

- [x] Step 1: Prisma schema — `Participant`, `NDISPlan`, `Document`, `Note`, `ServiceAgreement` models + Region back-relation
- [x] Step 2: `pnpm prisma generate` (no live DB; migration ready to run when DB available)
- [x] Step 3: Validation schema — `lib/validations/participants.ts` (Zod v4, `auditParticipation: z.boolean()` — no `.default()` to avoid resolver type mismatch)
- [x] Step 4: API routes — `GET/POST /api/participants`, `GET/PATCH/DELETE /api/participants/[id]` (Next.js 15 `Promise<params>`, `force-dynamic`)
- [x] Step 5: `QueryClientProvider` added to `app/providers.tsx`
- [x] Step 6: TanStack Query hooks — `hooks/use-participants.ts` (list, single, create, update, delete)
- [x] Step 7: List page — `/participants` with search, status filter, DataTable, avatar initials, region column
- [x] Step 8: `AddParticipantSheet` — 4-step form (Personal → Contact → NDIS → Region), `standardSchemaResolver`
- [x] Step 9: Profile page — `/participants/[id]` with 5 tabs (Overview, NDIS Plans, Documents, Notes, Service Agreements)
- [x] Step 10: `lib/db.ts` updated for Prisma v7 — `PrismaPg` adapter pattern
- [x] Step 11: `pnpm build` passes clean — 9 routes, middleware 91.2 kB

---

### ✅ Phase 2: Authentication

- [x] Step 1: Sign-in page at `/sign-in` (react-hook-form + Zod + NextAuth)
- [x] Step 2: Auth layout `app/(auth)/layout.tsx`
- [x] Step 3: Middleware — route protection via `auth.config.ts` authorized callback
- [x] Step 4: Sign Out wired to `signOut({ callbackUrl: '/sign-in' })`
- [x] Step 5: `SessionProvider` wrapper in `app/providers.tsx`
- [x] Step 6: Root layout updated to wrap with `<Providers>`
- [x] Step 7: Root page auth-aware redirect (`/dashboard` if session, `/sign-in` if not)
- [x] Step 8: `tsconfig.json` excludes stray `gogo-vite-mui-admin-template-v7.4.0` folder
- [x] Step 9: `pnpm build` passes clean — 8 routes, middleware 91.2 kB

---

### ✅ Phase 1: Foundation & Layout

- [x] Step 1: Create Zustand stores (region-store, ui-store)
- [x] Step 2: Build AppSidebar (16 items, 5 sections, collapse)
- [x] Step 3: Build TopNavbar (toggle, region selector, user menu)
- [x] Step 4: Build DashboardLayout (app/(dashboard)/layout.tsx)
- [x] Step 5: Build shared components (PageHeader, KPICard, StatusBadge, EmptyState, DataTable)
- [x] Step 6: Build Dashboard page (4 KPI cards, Quick Actions)
- [x] Step 7: Final build verification — `pnpm build` passes clean

---

### ✅ Phase 0: Project Initialization

- [x] Step 1: Initialize Next.js 15 with TypeScript and Tailwind CSS v4
- [x] Step 2: Install and configure shadcn/ui components (16 components)
- [x] Step 3: Set up Prisma ORM with Region model
- [x] Step 4: Configure NextAuth v5 with credentials provider
- [x] Step 5: Install additional dependencies (Zustand, TanStack Query, react-hook-form, Zod, Lucide, Geist, Sonner)
- [x] Step 6: Apply SupportCRM brand tokens to `globals.css`
- [x] Step 7: Set up Geist Sans and Geist Mono fonts
- [x] Step 8: Create initial project folder structure
- [x] Step 9: Final verification build — `pnpm build` passes clean

---

## In Progress

### Phase 1: Foundation & Layout

- [x] **Step 1:** Create Zustand stores (`store/region-store.ts`, `store/ui-store.ts`)
- [x] **Step 2:** Build `AppSidebar` component
- [x] **Step 3:** Build `TopNavbar` component
- [x] **Step 4:** Build `DashboardLayout` component
- [x] **Step 5:** Build shared components (`DataTable`, `StatusBadge`, `PageHeader`, `KPICard`, `EmptyState`)
- [x] **Step 6:** Build Dashboard placeholder page (4 KPI cards)
- [x] **Step 7:** Verify `pnpm build` passes

---

## Phase Roadmap

### Phase 0: Project Initialization ✅ COMPLETE
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

### Phase 1: Foundation & Layout ⬅️ YOU ARE HERE
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
- [x] Install NextAuth: `pnpm add next-auth@beta`
- [x] Install Zustand: `pnpm add zustand`
- [x] Install TanStack Query: `pnpm add @tanstack/react-query`
- [x] Install react-hook-form + Zod: `pnpm add react-hook-form @hookform/resolvers zod`
- [x] Install Lucide icons: `pnpm add lucide-react`
- [x] Install Geist fonts: `pnpm add geist`
- [x] Install toast notifications: `pnpm add sonner`
- [x] Apply SupportCRM theme tokens to `app/globals.css`
- [x] Create folder structure
- [x] Run `pnpm build` to verify setup

**Notes:**
- Starting fresh with Next.js 15 (latest stable).
- Using Tailwind CSS v4 with `@theme inline` for token-based design system.
- PostgreSQL connection string will be added to `.env` after database setup.
- **Step 1 completed:** Next.js 15.5.18, React 19.1.0, Tailwind CSS 4.3.0, `@tailwindcss/postcss` 4.3.0, TypeScript 5.9.3, ESLint 9.x. `pnpm build` passes clean.
- **Step 2 completed:** shadcn/ui initialized (style: base-nova, baseColor: neutral, cssVariables: true, iconLibrary: lucide). 16 components installed: Button, Card, Dialog, Sheet, Input, Tabs, Textarea, ScrollArea, DropdownMenu, Select, Badge, Avatar, Separator, Tooltip, Skeleton, Table. `components.json` created. `lib/utils.ts` created with `cn()` helper. `pnpm build` passes clean.
- **Step 3 completed:** Prisma 7.8.0 installed. Region model defined in `prisma/schema.prisma`. `lib/db.ts` created with singleton PrismaClient. Database migration pending (PostgreSQL connection needed). Note: Prisma 7 moves `url` from schema to `prisma.config.ts`; `prisma-client-js` provider retained for `@prisma/client` import compatibility. `pnpm build` passes clean.
- **Step 4 completed:** NextAuth v5 configured with credentials provider. Demo login: admin@supportcrm.io / demo. Created `auth.config.ts` with route protection logic, `lib/auth.ts` with JWT and session callbacks for role/regionId. Added type declarations in `types/next-auth.d.ts`. `middleware.ts` deferred to Phase 2. `pnpm build` passes clean.
- **Step 5 completed:** All additional dependencies installed. Versions: zustand 5.0.13, @tanstack/react-query 5.100.11, react-hook-form 7.76.0, @hookform/resolvers 5.4.0, zod 4.4.3, lucide-react 1.16.0 (already via shadcn), geist 1.7.1, sonner 2.0.7. No store/hook files created yet. `pnpm build` passes clean.
- **Step 6 completed:** SupportCRM brand tokens applied to `globals.css` with Tailwind v4 `@theme inline`. Replaced shadcn default oklch theme with project hex tokens. shadcn aliases mapped to brand tokens. Background: #f4f6f9, Primary: #0284c7. `pnpm build` passes clean.
- **Step 7 completed:** Geist Sans and Geist Mono fonts applied via `geist` package. `app/layout.tsx` sets `--font-geist-sans` and `--font-geist-mono` CSS variables on `<html>`. `globals.css` maps `--font-sans` and `--font-mono` to those variables. `font-sans` Tailwind utility now resolves to Geist Sans. `pnpm build` passes clean.
- **Step 8 completed:** Project folder structure created per `context/architecture-context.md`. Module-specific folders ready for Phase 1. Folders: `components/{shared,layout,participants,hrm,rostering,incidents}`, `store/`, `hooks/`, `lib/validations/`, `app/(auth)/sign-in/`, `app/(dashboard)/{dashboard,participants,hrm}/`. `.gitkeep` files added to empty dirs. `pnpm build` passes clean.
- **Step 9 completed (Phase 0 COMPLETE):** Final verification build passed — 0 TypeScript errors, 0 ESLint errors. Phase 0 complete. Tech stack installed and verified. Ready for Phase 1.

**Phase 0 Package Summary:**
| Package | Version |
|---|---|
| next | 15.5.18 |
| react / react-dom | 19.1.0 |
| tailwindcss / @tailwindcss/postcss | 4.3.0 |
| typescript | 5.9.3 |
| shadcn (16 components) | 4.8.0 |
| prisma / @prisma/client | 7.8.0 |
| next-auth | 5.0.0-beta.31 |
| zustand | 5.0.13 |
| @tanstack/react-query | 5.100.11 |
| react-hook-form | 7.76.0 |
| @hookform/resolvers | 5.4.0 |
| zod | 4.4.3 |
| lucide-react | 1.16.0 |
| geist | 1.7.1 |
| sonner | 2.0.7 |

**Demo credentials (Phase 2):** `admin@supportcrm.io` / `demo`

---

### Session Notes — Phase 1

- **Step 1 completed:** Zustand stores created: `store/region-store.ts` (global region filter — `selectedRegionId`, `setSelectedRegionId`), `store/ui-store.ts` (sidebar state — `sidebarOpen`, `toggleSidebar`, `setSidebarOpen`). Navigation types defined in `types/navigation.ts` (`NavItem`, `NavSection` using `LucideIcon`). `store/.gitkeep` removed. `pnpm build` passes clean.
- **Feature spec created for AppSidebar component:** `context/feature-specs/02-app-sidebar.md` — includes full `navSections` array with all 16 icons/routes, complete component template, collapse logic, active route detection, tooltip behavior for collapsed mode, and styling rules.
- **Step 3 completed:** `components/layout/top-navbar.tsx` implemented. Sidebar toggle (`PanelLeftClose`/`PanelLeftOpen`) wired to `useUIStore.toggleSidebar`. Logo + wordmark. Region selector (4 hardcoded regions) wired to `useRegionStore`. Search input (placeholder). Notification bell + badge. User avatar dropdown (Admin User / Sign Out). Dynamic `marginLeft` via inline style tracks sidebar state. Fixed `@base-ui/react` API: `DropdownMenuTrigger` has no `asChild` — renders as `<button>` directly; user avatar rendered as child. `pnpm build` passes clean.
- **Step 2 completed:** `components/layout/app-sidebar.tsx` implemented. 16 nav items in 5 sections (Core, Operations, Compliance, Finance, System). Collapse: `w-60` ↔ `w-16` via `useUIStore`. Active route: exact match for `/dashboard`, `startsWith` for all others. Collapsed mode shows icon-only with `@base-ui/react` Tooltip on hover (`side="right"`). Fixed base-ui API differences (`delay` not `delayDuration`, no `asChild` on `TooltipTrigger`). `pnpm build` passes clean.
- **Step 4 completed:** `components/layout/dashboard-layout.tsx` implemented — wraps `AppSidebar` + `TopNavbar`, dynamic `marginLeft` (240px/64px) via `useUIStore`, `pt-16` clears fixed navbar, `min-h-screen` fills viewport. `app/(dashboard)/layout.tsx` wires it to the route group. `app/(dashboard)/dashboard/page.tsx` placeholder created. Root `/` redirects to `/dashboard`. `pnpm build` passes clean.
- **Step 5 completed:** 5 shared components in `components/shared/` — `PageHeader` (sticky top-16, title/description/action), `KPICard` (Card wrapper, value + trend + icon), `StatusBadge` (7 statuses mapped to token colors with dot indicator), `EmptyState` (centered icon/title/description/action), `DataTable` (generic scaffold, search input, rounded-xl table). `components/shared/.gitkeep` removed. Test page at `/test-components`. `pnpm build` passes clean — 7 routes.
- **Steps 6 & 7 completed:** `app/(dashboard)/dashboard/page.tsx` fully implemented — `PageHeader` with description, 4 `KPICard`s in `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, Quick Actions panel with 4 buttons. Page metadata added. `pnpm build` passes clean — Phase 1 complete.
- **Phase 3 completed:** Participants module fully implemented. Key decisions: (1) `auditParticipation: z.boolean()` — removed `.default(false)` which caused resolver type mismatch between Zod v4 input/output types in `react-hook-form`. (2) API routes use `export const dynamic = 'force-dynamic'` + `Promise<params>` for Next.js 15. (3) `lib/db.ts` updated to Prisma v7 pattern — `PrismaPg` adapter from `@prisma/adapter-pg`; `new PrismaClient()` without adapter throws `PrismaClientInitializationError` in v7. (4) `prisma/schema.prisma` datasource has no `url` field in v7 — config is in `prisma.config.ts`. (5) `standardSchemaResolver` used for form validation (Zod v4 + `@hookform/resolvers` v5 incompatibility). Migration pending live DB; `pnpm build` passes clean — 9 routes.
- **Phase 2 completed:** Sign-in page at `/sign-in` — `react-hook-form` + Zod v4 via `standardSchemaResolver` (Zod v4 + `@hookform/resolvers` v5 require `standard-schema` resolver, not `zodResolver`). Auth layout `app/(auth)/layout.tsx`. Middleware uses `NextAuth(authConfig).auth` — keeps Node.js-only modules out of Edge runtime. Sign Out wired to `signOut({ callbackUrl: '/sign-in' })` in `DropdownMenuItem`. `SessionProvider` in `app/providers.tsx` wraps root layout. Root page `async` with `auth()` session check → redirects to `/dashboard` or `/sign-in`. **Bonus fix:** `tsconfig.json` now excludes `gogo-vite-mui-admin-template-v7.4.0` (stray folder in project root was breaking TypeScript type-check). `pnpm build` passes clean — 8 routes, middleware 91.2 kB.
- **UI enhanced with gradient KPI cards, shadows, and improved dashboard layout:** Gradient tokens added to `globals.css` (`--gradient-purple/teal/blue/red/orange-from/to`). `KPICard` updated with `variant` prop using `inline style` for gradients (code-standards compliant — no raw hex in components). Dashboard redesigned with dynamic greeting (`GreetingHeader` client component), 3-column layout, Compliance Tracker panel with progress bars, right sidebar (Shifts Today, Expiring Documents, This Week stats). `ui-context.md` updated with Gradient Backgrounds and Shadows & Elevation sections. `pnpm build` passes clean.

---

## Critical Rules Reminder

- **Do not modify `components/ui`** → generated shadcn primitives.
- **Use token variables for all colours** → `bg-[var(--color-bg)]`, `text-[var(--color-text)]`, etc.
- **No raw hex values** or Tailwind colour shortcuts.
- **Region filter is global state** → Zustand `regionStore`.
- **Single-organisation architecture** → no multi-tenancy in Phase 1.
- **Update this file** (`progress-tracker.md`) after each meaningful step.
