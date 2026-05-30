# Shared Components - Feature Spec

## Goal
Build reusable UI components used across all dashboard modules: PageHeader, KPICard, StatusBadge, EmptyState, and DataTable scaffold.

---

## Component 1: PageHeader

**File:** `components/shared/page-header.tsx`

**Type:** Server Component (no state needed)

**Purpose:** Sticky header for all list and detail pages

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="sticky top-16 z-20 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
```

**Usage Example:**
```tsx
<PageHeader 
  title="Participants" 
  description="Manage NDIS participants and their plans"
  action={<Button>Add Participant</Button>}
/>
```

---

## Component 2: KPICard

**File:** `components/shared/kpi-card.tsx`

**Type:** Server Component

**Purpose:** Display key metrics on Dashboard and module overview pages

```tsx
import { Card } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
}

export function KPICard({ title, value, trend, icon }: KPICardProps) {
  return (
    <Card className="p-6 bg-[var(--color-surface)] border-[var(--color-border)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            {title}
          </p>
          <p className="text-3xl font-semibold text-[var(--color-text)] mt-2">
            {value}
          </p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.positive
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-error)]'
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-dim)] flex items-center justify-center text-[var(--color-primary)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
```

**Usage Example:**
```tsx
<KPICard
  title="Total Participants"
  value="247"
  trend={{ value: '+12% this month', positive: true }}
  icon={<Users className="h-5 w-5" />}
/>
```

---

## Component 3: StatusBadge

**File:** `components/shared/status-badge.tsx`

**Type:** Server Component

**Purpose:** Consistent status indicators across all modules

```tsx
import { Badge } from '@/components/ui/badge';

type Status =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'draft'
  | 'resolved'
  | 'submitted';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { label: string; color: string; dotColor: string }
> = {
  active: {
    label: 'Active',
    color: 'text-[var(--color-success)]',
    dotColor: 'bg-[var(--color-success)]',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-[var(--color-error)]',
    dotColor: 'bg-[var(--color-error)]',
  },
  pending: {
    label: 'Pending',
    color: 'text-[var(--color-warning)]',
    dotColor: 'bg-[var(--color-warning)]',
  },
  approved: {
    label: 'Approved',
    color: 'text-[var(--color-primary)]',
    dotColor: 'bg-[var(--color-primary)]',
  },
  draft: {
    label: 'Draft',
    color: 'text-[var(--color-text-muted)]',
    dotColor: 'bg-[var(--color-text-muted)]',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-[var(--color-success)]',
    dotColor: 'bg-[var(--color-success)]',
  },
  submitted: {
    label: 'Submitted',
    color: 'text-[var(--color-info)]',
    dotColor: 'bg-[var(--color-info)]',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 ${config.color} border-current`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  );
}
```

**Usage Example:**
```tsx
<StatusBadge status="active" />
<StatusBadge status="pending" />
```

---

## Component 4: EmptyState

**File:** `components/shared/empty-state.tsx`

**Type:** Server Component

**Purpose:** Friendly placeholder when lists or tables have no data

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="h-12 w-12 rounded-full bg-[var(--color-subtle)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
```

**Usage Example:**
```tsx
<EmptyState
  icon={<Users className="h-6 w-6" />}
  title="No participants found"
  description="Get started by adding your first participant to the system."
  action={<Button>Add Participant</Button>}
/>
```

---

## Component 5: DataTable (Scaffold)

**File:** `components/shared/data-table.tsx`

**Type:** Client Component (`'use client'`)

**Purpose:** Reusable table wrapper with search and filters (full implementation in Phase 3)

**Phase 1 Scaffold:**
```tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DataTableProps<T> {
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchKey && (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-[var(--color-text-muted)]"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow key={idx}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(item)
                        : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

**Note:** Full implementation with filtering, sorting, and pagination will be added in Phase 3.

---

## File Organization

After implementation:
components/
└── shared/
├── page-header.tsx
├── kpi-card.tsx
├── status-badge.tsx
├── empty-state.tsx
└── data-table.tsx


Remove `components/shared/.gitkeep` after creating files.

---

## Success Criteria

- [x] PageHeader component renders with title, description, action
- [x] KPICard displays metric value, trend indicator, optional icon
- [x] StatusBadge shows correct color for each status type
- [x] EmptyState renders centered with icon, title, description, action
- [x] DataTable scaffold renders columns and rows
- [x] All components use token variables for colors
- [x] All components follow context/code-standards.md structure
- [x] pnpm build passes with 0 errors
- [x] Components can be imported in other pages

---

## Dependencies

**Imports:**
- shadcn components: Card, Badge, Table, Input
- Icons from lucide-react
- All use existing dependencies

**No new packages needed.**

---

## Testing

Create a test page to verify all components:

**File:** `app/(dashboard)/test-components/page.tsx` (temporary)

```tsx
import { PageHeader } from '@/components/shared/page-header';
import { KPICard } from '@/components/shared/kpi-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function TestComponentsPage() {
  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Test Components"
        description="Visual verification of shared components"
        action={<Button>Action Button</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Test Metric" value="123" icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="flex gap-2">
        <StatusBadge status="active" />
        <StatusBadge status="pending" />
        <StatusBadge status="draft" />
      </div>

      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Test Empty State"
        description="This is a test description"
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
        ]}
        data={[
          { name: 'Test 1', status: 'Active' },
          { name: 'Test 2', status: 'Inactive' },
        ]}
        searchKey="name"
      />
    </div>
  );
}
```

Delete this test page after verification.

---

## Notes

- All components are designed to be reusable across modules
- StatusBadge color mapping follows context/ui-context.md exactly
- DataTable is a scaffold—full TanStack Table integration in Phase 3
- PageHeader is sticky (top-16) to stay visible while scrolling
- KPICard trend indicator is optional (some metrics don't have trends)