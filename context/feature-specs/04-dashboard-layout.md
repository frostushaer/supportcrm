# DashboardLayout Component - Feature Spec

## Goal
Create a layout wrapper that combines AppSidebar and TopNavbar, applies to all dashboard routes, and manages dynamic content margins based on sidebar state.

---

## Component Requirements

**File:** `components/layout/dashboard-layout.tsx`

**Type:** Client Component (`'use client'`)

**Purpose:**
- Wraps all `/dashboard/*` routes
- Renders AppSidebar (fixed left)
- Renders TopNavbar (fixed top)
- Main content area with dynamic left margin
- Scrollable content area

---

## Component Implementation

```tsx
'use client';

import { AppSidebar } from './app-sidebar';
import { TopNavbar } from './top-navbar';
import { useUIStore } from '@/store/ui-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <AppSidebar />

      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Content Area */}
      <main
        className="
          pt-16
          transition-all duration-300
          min-h-screen
        "
        style={{
          marginLeft: sidebarOpen ? '240px' : '64px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
```

---

## Layout Structure
┌─────────────────────────────────────────────┐
│ TopNavbar (fixed, adjusts with sidebar) │
├──────┬──────────────────────────────────────┤
│ │ │
│ Side │ │
│ bar │ Main Content Area │
│ │ (children rendered here) │
│ (fix)│ - Dynamic margin left │
│ │ - Scrollable │
│ │ - pt-16 for navbar clearance │
│ │ │
└──────┴──────────────────────────────────────┘

---

## App Router Integration

**File:** `app/(dashboard)/layout.tsx`

```tsx
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

This wraps all routes inside the `(dashboard)` route group:
- `/dashboard`
- `/participants`
- `/hrm`
- `/support-coordination`
- etc.

---

## Margin Synchronization

**Critical:** Main content margin must match sidebar width:

| Sidebar State | Sidebar Width | Content Margin Left |
|---------------|---------------|---------------------|
| Open          | 240px         | 240px               |
| Closed        | 64px          | 64px                |

**Implementation:**
```tsx
style={{
  marginLeft: sidebarOpen ? '240px' : '64px',
}}
```

**Transition:** `transition-all duration-300` for smooth animation

---

## Content Area Styling

**Classes:**
- `pt-16` — Top padding to clear fixed navbar (64px height)
- `transition-all duration-300` — Smooth margin animation
- `min-h-screen` — Ensure content area fills viewport

**Background:**
- Wrapper: `bg-[var(--color-bg)]` (#f4f6f9 light gray-blue)
- Page content uses this as the base canvas

---

## Success Criteria

- [x] DashboardLayout component renders AppSidebar and TopNavbar
- [x] Main content area has correct top padding (64px)
- [x] Content margin adjusts smoothly with sidebar state
- [x] Layout applied to `app/(dashboard)/layout.tsx`
- [x] All dashboard routes render inside the layout
- [x] Background color is `var(--color-bg)`
- [x] Content is scrollable when it exceeds viewport height
- [x] pnpm build passes with 0 errors

---

## Route Group Structure

---

## App Router Integration

**File:** `app/(dashboard)/layout.tsx`

```tsx
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

This wraps all routes inside the `(dashboard)` route group:
- `/dashboard`
- `/participants`
- `/hrm`
- `/support-coordination`
- etc.

---

## Margin Synchronization

**Critical:** Main content margin must match sidebar width:

| Sidebar State | Sidebar Width | Content Margin Left |
|---------------|---------------|---------------------|
| Open          | 240px         | 240px               |
| Closed        | 64px          | 64px                |

**Implementation:**
```tsx
style={{
  marginLeft: sidebarOpen ? '240px' : '64px',
}}
```

**Transition:** `transition-all duration-300` for smooth animation

---

## Content Area Styling

**Classes:**
- `pt-16` — Top padding to clear fixed navbar (64px height)
- `transition-all duration-300` — Smooth margin animation
- `min-h-screen` — Ensure content area fills viewport

**Background:**
- Wrapper: `bg-[var(--color-bg)]` (#f4f6f9 light gray-blue)
- Page content uses this as the base canvas

---

## Success Criteria

- [x] DashboardLayout component renders AppSidebar and TopNavbar
- [x] Main content area has correct top padding (64px)
- [x] Content margin adjusts smoothly with sidebar state
- [x] Layout applied to `app/(dashboard)/layout.tsx`
- [x] All dashboard routes render inside the layout
- [x] Background color is `var(--color-bg)`
- [x] Content is scrollable when it exceeds viewport height
- [x] pnpm build passes with 0 errors

---

## Route Group Structure

The `(dashboard)` group:
- Does NOT affect the URL (routes are `/dashboard`, not `/(dashboard)/dashboard`)
- Shares a common layout (sidebar + navbar)
- Will be protected by middleware in Phase 2

---

## Dependencies

**Imports:**
- `AppSidebar` from `@/components/layout/app-sidebar`
- `TopNavbar` from `@/components/layout/top-navbar`
- `useUIStore` from `@/store/ui-store`

**No new packages needed.**

---

## Testing Checklist

After implementation:

1. Open http://localhost:3000/dashboard
2. Verify sidebar and navbar render
3. Click sidebar toggle in navbar
4. Confirm:
   - Sidebar width changes (240px ↔ 64px)
   - Navbar margin adjusts
   - Content margin adjusts
   - All transitions are smooth (300ms)
5. Check responsive behavior (mobile, tablet, desktop)

---

## Notes

- Layout uses inline `style` for dynamic margin (cleaner than conditional Tailwind classes)
- `min-h-screen` on main ensures footer doesn't float mid-page on short content
- The `(dashboard)` route group keeps auth routes (`/sign-in`) separate from dashboard routes
- All future dashboard pages automatically inherit this layout