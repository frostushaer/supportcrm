# UI Context

Design system, theme tokens, and component patterns for **SupportCRM**.

---

## Brand

- **Name:** SupportCRM
- **Domain:** supportcrm.io
- **Tagline:** NDIS care management, simplified.
- **Personality:** Professional, trustworthy, clinical clarity—approachable and human.

---

## Theme Tokens

**Light mode primary. Dark mode via `data-theme="dark"` on `<html>`.**

All colours are CSS custom properties in `globals.css` via Tailwind v4 `@theme` inline. **Never use hardcoded hex or raw Tailwind colour shortcuts.**

### Colour Palette

| Role | CSS Variable | Value |
|------|-------------|-------|
| Page background | `--color-bg` | `#f4f6f9` |
| Surface | `--color-surface` | `#ffffff` |
| Elevated surface | `--color-elevated` | `#f8fafc` |
| Subtle surface | `--color-subtle` | `#eef2f7` |
| Default border | `--color-border` | `#d1d5db` |
| Subtle border | `--color-border-subtle` | `#e5e7eb` |
| Primary text | `--color-text` | `#111827` |
| Secondary text | `--color-text-secondary` | `#374151` |
| Muted text | `--color-text-muted` | `#6b7280` |
| Faint text | `--color-text-faint` | `#9ca3af` |
| Brand accent | `--color-primary` | `#0284c7` |
| Brand hover | `--color-primary-hover` | `#0369a1` |
| Brand dim | `--color-primary-dim` | `rgba(2,132,199,0.10)` |
| Success | `--color-success` | `#16a34a` |
| Warning | `--color-warning` | `#d97706` |
| Error | `--color-error` | `#dc2626` |
| Info | `--color-info` | `#2563eb` |

### shadcn Alias Mappings

In `globals.css`:

```css
@theme inline {
  --background: var(--color-bg);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --primary: var(--color-primary);
  --primary-foreground: #ffffff;
  --border: var(--color-border);
  --ring: var(--color-primary);
}
```

---

## Gradient Backgrounds

For KPI cards and feature highlights, use gradient backgrounds via CSS token variables defined in `globals.css`. **Never use raw hex values in components.**

| Variant | From Token | To Token |
|---------|-----------|---------|
| Purple | `--gradient-purple-from` | `--gradient-purple-to` |
| Teal | `--gradient-teal-from` | `--gradient-teal-to` |
| Blue | `--gradient-blue-from` | `--gradient-blue-to` |
| Red | `--gradient-red-from` | `--gradient-red-to` |
| Orange | `--gradient-orange-from` | `--gradient-orange-to` |

**Usage:**
- Apply via `style={{ background: 'linear-gradient(to bottom right, var(--gradient-X-from), var(--gradient-X-to))' }}`
- KPI cards with gradients use white text (`text-white`, `text-white/80`, `text-white/70`)
- Icon containers inside gradient cards use `bg-white/20 text-white`
- Add `hover:scale-105 transition-all duration-300` for interactive feel
- Use `shadow-md hover:shadow-lg` for elevation on hover

---

## Shadows & Elevation

Use shadows to create visual hierarchy:

| Level | Class | Use Case |
|-------|-------|----------|
| Subtle | `shadow-sm` | Borders, separators |
| Default | `shadow-md` | Standard cards, panels |
| Elevated | `shadow-lg` | Gradient cards, modals |
| Floating | `shadow-xl` | Dropdowns, popovers |

**Hover Effects:**
```tsx
className="shadow-md hover:shadow-lg transition-shadow duration-300"
```

---

## Sidebar Navigation

**Fixed left sidebar. 240px expanded, 64px icon-only collapsed.**

Toggle via button in TopNavbar. State in Zustand `uiStore.sidebarOpen`.

### Sidebar Items (16 total)

| # | Lucide Icon | Label | Route |
|---|------------|-------|-------|
| 1 | `LayoutDashboard` | Dashboard | `/dashboard` |
| 2 | `Users` | Participants | `/participants` |
| 3 | `UserCheck` | HRM | `/hrm` |
| 4 | `Briefcase` | Support Coordination | `/support-coordination` |
| 5 | `Heart` | Allied Health | `/allied-health` |
| 6 | `Calendar` | Rostering | `/rostering` |
| 7 | `Home` | Home Management | `/home-management` |
| 8 | `AlertTriangle` | Incident Management | `/incidents` |
| 9 | `FileText` | Invoicing | `/invoicing` |
| 10 | `BarChart2` | Reporting | `/reporting` |
| 11 | `ClipboardList` | Forms | `/forms` |
| 12 | `BookOpen` | Policies | `/policies` |
| 13 | `MessageSquare` | Complaints | `/complaints` |
| 14 | `ThumbsUp` | Feedback | `/feedback` |
| 15 | `HelpCircle` | Ask a Question | `/ask` |
| 16 | `Settings` | Settings | `/settings` |

**Sidebar sections:**
- **Core:** 1-4
- **Operations:** 5-7
- **Compliance:** 8, 11-15
- **Finance:** 9-10
- **System:** 16

---

## Top Navigation Bar

**Fixed 64px height.**

Contents (left-to-right):
1. Sidebar toggle (`PanelLeftOpen` / `PanelLeftClose` icon).
2. SupportCRM logo + wordmark.
3. **Region selector** (Select wired to Zustand `regionStore`).
4. Search bar.
5. Notification bell.
6. User avatar (DropdownMenu: Profile, Sign Out).

---

## Typography

| Role | Font | Variable |
|------|------|----------|
| UI body | Geist Sans | `--font-geist-sans` |
| Code / mono | Geist Mono | `--font-geist-mono` |

Install via `pnpm add geist`. Apply on `<html>` in `layout.tsx`.

---

## Border Radius Scale

| Context | Class |
|---------|-------|
| Badges, chips, inputs | `rounded-lg` |
| Cards, panels, dropdowns | `rounded-xl` |
| Modals, drawers | `rounded-2xl` |

---

## Component Patterns

### Data Table

- **Sticky header**, sortable columns, row hover (`--color-subtle`).
- **Inline `StatusBadge`**. Row actions via `DropdownMenu` (… → Edit, View, Delete).
- **Pagination footer**.
- **Search input + filter dropdowns** (Region, Status) → toolbar above table.
- **`EmptyState`** when no data.

**Example:**

```typescript
<DataTable
  columns={participantColumns}
  data={participants}
  searchKey="name"
  filters={[
    { key: 'regionId', label: 'Region', options: regions },
    { key: 'status', label: 'Status', options: statuses },
  ]}
/>
```

---

### Status Badges

| Status | Colour |
|--------|--------|
| Active | `--color-success` (green) |
| Inactive | `--color-error` (red) |
| Pending | `--color-warning` (amber) |
| Draft | `--color-text-muted` (grey) |
| Approved | `--color-primary` (blue) |
| Resolved | `--color-success` (green) |
| Submitted | `--color-info` (blue) |

**Example:**

```typescript
<StatusBadge status="active" />
<StatusBadge status="pending" />
```

---

### Modals vs Drawers

- **Complex multi-field forms** (Add New X) → **right-side Sheet** (shadcn).
- **Simple confirmations** (delete, status change) → **centered Dialog**.
- **Detail / record views** (profiles) → **full-page route**, not a modal.

---

### KPI Cards

White surface, `rounded-xl`, `shadow-sm`.

Large metric number, label below, optional trend chip.

**Example:**

```typescript
<KPICard
  title="Total Participants"
  value="247"
  trend="+12% this month"
  icon={<Users />}
/>
```

---

### Page Layout

**Standard structure:**

1. **Sticky `PageHeader`** (title left, "Add X" button right).
2. **Content** (`max-w-7xl mx-auto px-6 py-6`).
3. **Page structure:** Header → optional KPI row → toolbar → table or calendar.

**Example:**

```typescript
export default function ParticipantsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Participants"
        action={<AddParticipantSheet />}
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* KPI cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <KPICard title="Total" value="247" />
          </div>

          {/* Data table */}
          <DataTable columns={columns} data={participants} />
        </div>
      </div>
    </div>
  );
}
```

---

### Form Layout (inside Sheet)

- **Label always above input**.
- **Required fields marked `*`**.
- **Validation errors** inline below field.
- **Multi-section forms** use `Tabs` inside the Sheet.
- **Submit button** primary, full-width at bottom. Cancel (ghost button) beside it.

**Example:**

```typescript
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent className="w-full sm:max-w-lg">
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">
            First Name <span className="text-[var(--color-error)]">*</span>
          </label>
          <Input {...register('firstName')} />
          {errors.firstName && (
            <p className="mt-1 text-sm text-[var(--color-error)]">
              {errors.firstName.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button type="submit" className="flex-1">Save</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  </SheetContent>
</Sheet>
```

---

## Spacing Scale

Use Tailwind spacing utilities consistently:

| Use Case | Class |
|----------|-------|
| Page padding | `px-6 py-6` |
| Card padding | `p-4` or `p-6` |
| Form field gap | `space-y-4` |
| Button gap | `gap-2` |
| Section margin | `mb-6` or `mb-8` |

---

## Accessibility

- **Keyboard navigation:** All interactive elements must be focusable.
- **Focus styles:** Use `ring-2 ring-[var(--color-primary)]` on focus.
- **ARIA labels:** Add `aria-label` to icon-only buttons.
- **Contrast:** Ensure text meets WCAG AA standards.

**Example:**

```typescript
<button
  aria-label="Close dialog"
  className="focus:ring-2 focus:ring-[var(--color-primary)]"
>
  <X />
</button>
```

---

## Animation

Use subtle transitions. Avoid heavy animations in data-heavy UIs.

```css
/* Hover transitions */
.hover\:scale-105 {
  transition: transform 150ms ease;
}

/* Fade in */
.animate-fade-in {
  animation: fadeIn 200ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Iconography

- **Use Lucide React** for all icons.
- **Icon size:** `className="h-4 w-4"` (small), `h-5 w-5` (medium), `h-6 w-6` (large).
- **Colour:** Inherit from parent text colour.

**Example:**

```typescript
import { Users, Calendar, AlertTriangle } from 'lucide-react';

<Users className="h-5 w-5 text-[var(--color-text-muted)]" />
```

---

## Loading States

- **Skeleton loaders** for initial page load.
- **Spinner** for button actions.
- **Shimmer effect** for table rows.

**Example:**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <DataTable data={participants} />
)}
```

---

## Empty States

Display helpful message + action when no data exists.

**Example:**

```typescript
<EmptyState
  icon={<Users />}
  title="No participants found"
  description="Get started by adding your first participant."
  action={<AddParticipantSheet />}
/>
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

**Mobile-first approach:**

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```
