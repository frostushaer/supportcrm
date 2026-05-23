# AppSidebar Component - Feature Spec

## Goal
Build a fixed left sidebar with 16 navigation items grouped into 5 sections. Supports smooth collapse to icon-only mode (240px → 64px), active route highlighting, and reads collapse state from the Zustand `useUIStore`.

---

## File

```
components/layout/app-sidebar.tsx
```

Must have `'use client'` directive — uses `usePathname`, `useUIStore`, and event handlers.

---

## Navigation Items (16 total, 5 sections)

From `context/ui-context.md`:

### Section: Core (items 1–4)
| Icon | Label | Route |
|------|-------|-------|
| `LayoutDashboard` | Dashboard | `/dashboard` |
| `Users` | Participants | `/participants` |
| `UserCheck` | HRM | `/hrm` |
| `Briefcase` | Support Coordination | `/support-coordination` |

### Section: Operations (items 5–7)
| Icon | Label | Route |
|------|-------|-------|
| `Heart` | Allied Health | `/allied-health` |
| `Calendar` | Rostering | `/rostering` |
| `Home` | Home Management | `/home-management` |

### Section: Compliance (items 8, 11–15)
| Icon | Label | Route |
|------|-------|-------|
| `AlertTriangle` | Incident Management | `/incidents` |
| `ClipboardList` | Forms | `/forms` |
| `BookOpen` | Policies | `/policies` |
| `MessageSquare` | Complaints | `/complaints` |
| `ThumbsUp` | Feedback | `/feedback` |
| `HelpCircle` | Ask a Question | `/ask` |

### Section: Finance (items 9–10)
| Icon | Label | Route |
|------|-------|-------|
| `FileText` | Invoicing | `/invoicing` |
| `BarChart2` | Reporting | `/reporting` |

### Section: System (item 16)
| Icon | Label | Route |
|------|-------|-------|
| `Settings` | Settings | `/settings` |

---

## navSections Array (copy verbatim into component)

```typescript
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardList,
  FileText,
  Heart,
  HelpCircle,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ThumbsUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type { NavSection } from '@/types/navigation';

const navSections: NavSection[] = [
  {
    label: 'Core',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Users,           label: 'Participants', href: '/participants' },
      { icon: UserCheck,       label: 'HRM', href: '/hrm' },
      { icon: Briefcase,       label: 'Support Coordination', href: '/support-coordination' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: Heart,    label: 'Allied Health', href: '/allied-health' },
      { icon: Calendar, label: 'Rostering', href: '/rostering' },
      { icon: Home,     label: 'Home Management', href: '/home-management' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { icon: AlertTriangle,  label: 'Incident Management', href: '/incidents' },
      { icon: ClipboardList,  label: 'Forms', href: '/forms' },
      { icon: BookOpen,       label: 'Policies', href: '/policies' },
      { icon: MessageSquare,  label: 'Complaints', href: '/complaints' },
      { icon: ThumbsUp,       label: 'Feedback', href: '/feedback' },
      { icon: HelpCircle,     label: 'Ask a Question', href: '/ask' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: FileText, label: 'Invoicing', href: '/invoicing' },
      { icon: BarChart2, label: 'Reporting', href: '/reporting' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
];
```

---

## Component Dimensions

| State | Width | CSS |
|-------|-------|-----|
| Expanded | 240px | `w-60` |
| Collapsed | 64px | `w-16` |

Transition: `transition-all duration-300 ease-in-out`

---

## Styling Specification

### Container
```
fixed inset-y-0 left-0 z-40
flex flex-col
bg-[var(--color-surface)]
border-r border-[var(--color-border)]
transition-all duration-300 ease-in-out
w-60 (expanded) | w-16 (collapsed)
```

### Logo / Brand Header
```
h-16 (matches TopNavbar height)
flex items-center
px-4 (expanded) | justify-center (collapsed)
border-b border-[var(--color-border)]
```
- Show `SupportCRM` wordmark when expanded, `SC` monogram when collapsed
- Text: `text-sm font-semibold text-[var(--color-text)]`

### Scroll Container
```
flex-1 overflow-y-auto overflow-x-hidden
py-4
```

### Section Label
- Only visible when expanded (`sidebarOpen === true`)
- Classes: `px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]`
- Hide with `hidden` or `opacity-0 h-0 overflow-hidden` when collapsed

### Nav Item (inactive)
```
flex items-center gap-3 rounded-lg px-3 py-2 mx-2
text-sm font-medium
text-[var(--color-text-secondary)]
hover:bg-[var(--color-subtle)] hover:text-[var(--color-text)]
transition-colors duration-150
cursor-pointer
```
- When collapsed: `justify-center px-0 mx-2`

### Nav Item (active — `pathname === item.href` or `pathname.startsWith(item.href)`)
```
bg-[var(--color-primary-dim)]
text-[var(--color-primary)]
hover:bg-[var(--color-primary-dim)]
```

### Icon
```
h-5 w-5 flex-shrink-0
```
- Inherits text color from parent nav item

### Label text
- Visible when expanded: `truncate`
- Hidden when collapsed: `hidden` (or use `sr-only` for accessibility)

### Tooltip (collapsed mode)
- Wrap each nav item in a `Tooltip` (shadcn) that shows the label when collapsed
- `TooltipContent` positioned `side="right"`
- Only activate tooltip when `!sidebarOpen`

---

## Active Route Logic

```typescript
const pathname = usePathname();

const isActive = (href: string): boolean => {
  if (href === '/dashboard') return pathname === href;
  return pathname.startsWith(href);
};
```

- Dashboard uses exact match to avoid `/dashboard` matching `/dashboard/settings`
- All other routes use `startsWith` to support nested routes

---

## Collapse Behavior

- Collapse state: `sidebarOpen` from `useUIStore`
- Toggle is triggered from `TopNavbar` (not inside sidebar itself)
- Sidebar reads state only — does not control its own toggle
- Width transition via Tailwind: `transition-all duration-300 ease-in-out`
- Use `cn()` from `@/lib/utils` for conditional classes

---

## Full Component Template

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle, BarChart2, BookOpen, Briefcase, Calendar,
  ClipboardList, FileText, Heart, HelpCircle, Home,
  LayoutDashboard, MessageSquare, Settings, ThumbsUp, UserCheck, Users,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import type { NavSection } from '@/types/navigation';

const navSections: NavSection[] = [
  /* ... paste array from above ... */
];

export function AppSidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col',
          'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        {/* Brand header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-[var(--color-border)] flex-shrink-0',
            sidebarOpen ? 'px-4' : 'justify-center',
          )}
        >
          {sidebarOpen ? (
            <span className="text-sm font-semibold text-[var(--color-text)]">
              SupportCRM
            </span>
          ) : (
            <span className="text-sm font-bold text-[var(--color-primary)]">
              SC
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {sidebarOpen && (
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg py-2 mx-2 text-sm font-medium',
                      'transition-colors duration-150',
                      sidebarOpen ? 'px-3' : 'justify-center px-0',
                      active
                        ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-text)]',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
```

---

## Accessibility

- `aria-current="page"` on active nav item
- `aria-label` on icon-only buttons via Tooltip
- All items navigable via keyboard (native `<Link>` element)
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]`

---

## Dependencies

- `next/link` — client-side navigation
- `next/navigation` `usePathname` — active route detection
- `lucide-react` — 16 icons
- `@/components/ui/tooltip` — collapsed-mode item labels
- `@/lib/utils` `cn()` — conditional classes
- `@/store/ui-store` `useUIStore` — sidebar open state
- `@/types/navigation` `NavSection` — type

No new packages required.

---

## Success Criteria

- [ ] Sidebar renders all 16 items in correct sections
- [ ] Section labels visible when expanded, hidden when collapsed
- [ ] Active item has `bg-[var(--color-primary-dim)] text-[var(--color-primary)]`
- [ ] Non-active items have correct hover state
- [ ] Sidebar width transitions smoothly (240px ↔ 64px) in 300ms
- [ ] Collapsed mode shows icon-only with tooltip on hover
- [ ] Brand header shows `SupportCRM` expanded / `SC` collapsed
- [ ] `pnpm build` passes with 0 errors
- [ ] No raw hex values or Tailwind color shortcuts used
