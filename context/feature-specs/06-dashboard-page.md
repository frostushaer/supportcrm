# Dashboard Page - Feature Spec

## Goal
Build the main dashboard landing page with 4 KPI cards displaying key metrics, serving as the entry point for the NDIS CRM.

---

## Component Requirements

**File:** `app/(dashboard)/dashboard/page.tsx`

**Type:** Server Component (static data for Phase 1)

**Purpose:** 
- First page users see after signing in
- Display high-level system metrics
- Quick access to key actions

---

## Page Implementation

```tsx
import { PageHeader } from '@/components/shared/page-header';
import { KPICard } from '@/components/shared/kpi-card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Calendar, FileText } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your NDIS operations."
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Participants"
              value="247"
              trend={{ value: '+12% this month', positive: true }}
              icon={<Users className="h-5 w-5" />}
            />
            <KPICard
              title="Active Workers"
              value="89"
              trend={{ value: '+5 new this week', positive: true }}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <KPICard
              title="Shifts This Week"
              value="342"
              trend={{ value: '-8% from last week', positive: false }}
              icon={<Calendar className="h-5 w-5" />}
            />
            <KPICard
              title="Pending Invoices"
              value="23"
              trend={{ value: '5 due this week', positive: false }}
              icon={<FileText className="h-5 w-5" />}
            />
          </div>

          {/* Quick Actions Section (Optional) */}
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button>Add Participant</Button>
              <Button variant="outline">Create Shift</Button>
              <Button variant="outline">Record Incident</Button>
              <Button variant="outline">Generate Invoice</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## KPI Metrics (Phase 1 Placeholder Data)

| Metric | Value | Trend | Icon |
|--------|-------|-------|------|
| Total Participants | 247 | +12% this month | Users |
| Active Workers | 89 | +5 new this week | UserCheck |
| Shifts This Week | 342 | -8% from last week | Calendar |
| Pending Invoices | 23 | 5 due this week | FileText |

**Note:** Values are hardcoded for Phase 1. In Phase 3, these will be replaced with real database queries.

---

## Layout Structure
┌─────────────────────────────────────────────┐
│ PageHeader: "Dashboard" │
├─────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ KPI │ │ KPI │ │ KPI │ │ KPI │ │
│ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ │
│ │
│ ┌───────────────────────────────────────┐ │
│ │ Quick Actions │ │
│ │ [Add Participant] [Create Shift] ... │ │
│ └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

---

## Responsive Grid

**Breakpoints:**
- Mobile (< 768px): 1 column (stacked KPI cards)
- Tablet (768px - 1023px): 2 columns
- Desktop (≥ 1024px): 4 columns

**Classes:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
```

---

## Quick Actions Section

**Purpose:** 
- Provide one-click access to common tasks
- Buttons are placeholders in Phase 1 (functional in Phase 3)

**Actions:**
1. Add Participant → Opens Add Participant Sheet
2. Create Shift → Navigate to Rostering calendar
3. Record Incident → Opens Incident form
4. Generate Invoice → Navigate to Invoicing module

**Styling:**
- Container: `bg-[var(--color-surface)]` with `rounded-xl` border
- Button group: `flex flex-wrap gap-3`
- Primary button for most common action, outline for others

---

## Page Metadata

Add metadata for SEO and browser tab:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - SupportCRM',
  description: 'NDIS operations overview and key metrics',
};
```

---

## Success Criteria

- [x] Dashboard page renders at `/dashboard`
- [x] PageHeader displays "Dashboard" title with description
- [x] 4 KPI cards render in responsive grid
- [x] Each KPI card shows:
  - Title
  - Value
  - Trend indicator (green/red)
  - Icon
- [x] Quick Actions section renders with 4 buttons
- [x] Layout is responsive (1/2/4 columns)
- [x] All colors use token variables
- [x] Page scrolls if content exceeds viewport
- [x] pnpm build passes with 0 errors

---

## Future Enhancements (Phase 3+)

**Real-Time Data:**
- Query Prisma database for actual counts
- Calculate trends from historical data
- Update KPIs based on selected region filter

**Additional Sections:**
- Recent Activity feed
- Upcoming Shifts calendar widget
- Expiring Documents alert
- NDIS Compliance status

**Interactive Charts:**
- Participant growth over time (line chart)
- Budget utilization by category (pie chart)
- Worker availability heatmap

---

## Testing Checklist

After implementation:

1. Navigate to http://localhost:3000/dashboard
2. Verify all 4 KPI cards render
3. Resize browser window:
   - Mobile: Cards stack vertically
   - Tablet: 2x2 grid
   - Desktop: 1x4 row
4. Check Quick Actions buttons render
5. Verify page header is sticky on scroll
6. Confirm all colors match token variables

---

## Dependencies

**Imports:**
- `PageHeader`, `KPICard` from `@/components/shared`
- `Button` from `@/components/ui/button`
- Icons from `lucide-react`

**No new packages needed.**

---

## Notes

- This page serves as the default landing page after sign-in
- KPI values are placeholders—real queries added in Phase 3
- Quick Actions buttons are non-functional in Phase 1 (wired in Phase 3)
- Page follows the standard layout pattern:
  - PageHeader (sticky)
  - Content area with `max-w-7xl mx-auto px-6 py-6`
  - Responsive grid for metrics
- Trend indicators use positive/negative boolean for color coding