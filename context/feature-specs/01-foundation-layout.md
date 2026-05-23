# Foundation & Layout - Feature Spec

## Goal
Build the core application shell with responsive sidebar navigation, top navbar with global region filter, and a dashboard landing page that serves as the entry point for all NDIS CRM modules.

---

## User Flow

1. User opens http://localhost:3000 → lands on Dashboard page
2. User sees:
   - Left sidebar with 16 navigation items (collapsed/expanded via toggle)
   - Top navbar with SupportCRM logo, region selector, search, notifications, user menu
   - Dashboard content area with 4 KPI cards
3. User clicks sidebar toggle → sidebar collapses to icon-only mode (64px width)
4. User clicks "Participants" in sidebar → navigates to /participants (placeholder for Phase 3)
5. User selects a region from navbar dropdown → region filter updates globally (stored in Zustand)
6. User clicks avatar → sees dropdown menu (Profile, Sign Out options - functional in Phase 2)

---

## Components to Build

### 1. Zustand Stores

**store/region-store.ts**
- State: `selectedRegionId: string | null`
- Action: `setSelectedRegionId(regionId: string | null)`
- Purpose: Global region filter consumed by all list pages

**store/ui-store.ts**
- State: `sidebarOpen: boolean`
- Actions: `toggleSidebar()`, `setSidebarOpen(open: boolean)`
- Purpose: Sidebar collapse state

---

### 2. AppSidebar Component

**components/layout/app-sidebar.tsx**

**Props:** None (reads from `useUIStore`)

**Features:**
- 16 navigation items from context/ui-context.md (Dashboard, Participants, HRM, etc.)
- Section labels: Core, Operations, Compliance, Finance, System
- Active route highlighting (using usePathname from next/navigation)
- Collapse to icon-only mode (240px → 64px)
- Lucide icons for each item
- Smooth transition animation

**Styling:**
- Fixed left position, full height
- Background: `var(--color-surface)`
- Border right: `var(--color-border)`
- Active item: `bg-[var(--color-primary-dim)] text-[var(--color-primary)]`
- Hover: `bg-[var(--color-subtle)]`

---

### 3. TopNavbar Component

**components/layout/top-navbar.tsx**

**Props:** None

**Features:**
- Left section:
  - Sidebar toggle button (PanelLeftOpen/PanelLeftClose icon)
  - SupportCRM logo + wordmark
- Center section:
  - Region selector (Select component from shadcn)
  - Search bar (Input with Search icon)
- Right section:
  - Notification bell (Bell icon with badge)
  - User avatar with DropdownMenu (Profile, Sign Out)

**Styling:**
- Fixed top, 64px height
- Background: `var(--color-surface)`
- Border bottom: `var(--color-border)`
- Flexbox layout with space-between

---

### 4. DashboardLayout Component

**components/layout/dashboard-layout.tsx**

**Props:**
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}
```

**Features:**
- Wraps AppSidebar and TopNavbar
- Main content area with dynamic left margin based on sidebar state:
  - Sidebar open: `ml-60` (240px)
  - Sidebar closed: `ml-16` (64px)
- Smooth transition on margin change
- Content area is scrollable

**Usage:**
Applied in `app/(dashboard)/layout.tsx` to wrap all dashboard routes

---

### 5. Shared Components

**components/shared/page-header.tsx**
```typescript
interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}
```
- Sticky header with title (left) and action button (right)
- Background: `var(--color-bg)`
- Border bottom: `var(--color-border)`

**components/shared/kpi-card.tsx**
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
}
```
- White card with rounded-xl corners
- Large metric value
- Optional trend indicator (green/red)
- Optional icon in top-right

**components/shared/status-badge.tsx**
```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'draft' | 'resolved' | 'submitted';
}
```
- Color mapping per context/ui-context.md
- Rounded-lg badge with dot indicator

**components/shared/empty-state.tsx**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}
```
- Centered layout with icon, title, description
- Optional action button

**components/shared/data-table.tsx**
- Generic table wrapper using shadcn Table
- Search input
- Filter dropdowns
- Pagination
- (Detailed implementation in Phase 3)

---

### 6. Dashboard Page

**app/(dashboard)/dashboard/page.tsx**

**Features:**
- PageHeader with title "Dashboard"
- 4 KPI cards in responsive grid:
  1. Total Participants
  2. Active Workers
  3. Shifts This Week
  4. Pending Invoices
- Placeholder values (real data in Phase 3)

**Layout:**
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Gap: `gap-4`
- Max width: `max-w-7xl mx-auto`
- Padding: `px-6 py-6`

---

## Route Structure

```
app/
└── (dashboard)/
    ├── layout.tsx → DashboardLayout wrapper
    └── dashboard/
        └── page.tsx → Dashboard page with KPIs
```

**Other routes (placeholders for future phases):**
- /participants
- /hrm
- /support-coordination
- /allied-health
- /rostering
- /home-management
- /incidents
- /invoicing
- /reporting
- /forms
- /policies
- /complaints
- /feedback
- /ask
- /settings

---

## Styling Rules

**Follow context/ui-context.md:**
- Use token variables for ALL colors: `bg-[var(--color-bg)]`
- Never use raw hex or Tailwind shortcuts (sky-500, gray-300)
- Responsive breakpoints: sm: md: lg: xl: 2xl:
- Border radius: rounded-lg (inputs), rounded-xl (cards), rounded-2xl (modals)
- Consistent spacing: px-6 py-6 for page padding, gap-4 for grids

---

## TypeScript Types

**types/navigation.ts** (create new file):
```typescript
export interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
```

---

## Success Criteria

- [ ] Sidebar renders with 16 items, section labels, active highlighting
- [ ] Sidebar collapse toggle works smoothly (240px ↔ 64px)
- [ ] TopNavbar renders with logo, region selector, search, user menu
- [ ] Region selector updates Zustand store (verify in React DevTools)
- [ ] DashboardLayout applies correct margins based on sidebar state
- [ ] Dashboard page displays 4 KPI cards in responsive grid
- [ ] Navigation between sidebar items works (routes exist, even if placeholder)
- [ ] All components use token variables (no raw hex values)
- [ ] pnpm build passes with 0 errors
- [ ] UI is fully responsive (mobile, tablet, desktop)

---

## Implementation Order

Follow this exact sequence (per context/ai-workflow-rules.md):

1. **Zustand stores** (region-store.ts, ui-store.ts)
2. **AppSidebar** (navigation items, collapse logic)
3. **TopNavbar** (logo, region selector, user menu)
4. **DashboardLayout** (wrapper component)
5. **Shared components** (PageHeader, KPICard, StatusBadge, EmptyState)
6. **Dashboard page** (4 KPI cards)
7. **Verify** (build, visual inspection, responsiveness)

---

## Notes

- User authentication is configured (Phase 0) but sign-in page will be built in Phase 2
- Region selector will show hardcoded regions for now (database seeding in Phase 2)
- Data in KPI cards is placeholder text (real queries in Phase 3)
- DataTable component is scaffolded but full implementation is in Phase 3

---

## Dependencies

**From Phase 0:**
- ✅ shadcn/ui components (Button, Card, DropdownMenu, Select, Input, Badge, Separator)
- ✅ Lucide icons
- ✅ Zustand
- ✅ Next.js App Router
- ✅ SupportCRM brand tokens in globals.css

**No new dependencies needed for Phase 1.**
