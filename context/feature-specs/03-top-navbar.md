# TopNavbar Component - Feature Spec

## Goal
Build a fixed top navigation bar with sidebar toggle, SupportCRM branding, global region filter, search, notifications, and user menu.

---

## Component Requirements

**File:** `components/layout/top-navbar.tsx`

**Type:** Client Component (`'use client'`)

**Features:**
- Sidebar collapse toggle button
- SupportCRM logo and wordmark
- Region selector dropdown (updates Zustand regionStore)
- Search input with icon
- Notification bell with badge
- User avatar with dropdown menu (Profile, Sign Out)

---

## Component Implementation

```tsx
'use client';

import { PanelLeftOpen, PanelLeftClose, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/ui-store';
import { useRegionStore } from '@/store/region-store';

// Hardcoded regions for Phase 1 (will come from database in Phase 3)
const REGIONS = [
  { id: 'region_1', name: 'Sydney Metro', state: 'NSW' },
  { id: 'region_2', name: 'Melbourne Metro', state: 'VIC' },
  { id: 'region_3', name: 'Brisbane Metro', state: 'QLD' },
  { id: 'region_4', name: 'Perth Metro', state: 'WA' },
];

export function TopNavbar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { selectedRegionId, setSelectedRegionId } = useRegionStore();

  return (
    <header
      className="
        fixed top-0 right-0 left-0 z-30
        h-16
        bg-[var(--color-surface)]
        border-b border-[var(--color-border)]
        flex items-center justify-between
        px-6
        transition-all duration-300
      "
      style={{
        marginLeft: sidebarOpen ? '240px' : '64px',
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        {/* Logo & Wordmark */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="text-lg font-semibold text-[var(--color-text)]">
            SupportCRM
          </span>
        </div>

        {/* Region Selector */}
        <Select
          value={selectedRegionId || undefined}
          onValueChange={setSelectedRegionId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name} ({region.state})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[var(--color-error)] text-white text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback className="bg-[var(--color-primary)] text-white">
                  AU
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">Admin User</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  admin@supportcrm.io
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[var(--color-error)]">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

---

## Layout Behavior

**Dynamic Margin:**
The navbar adjusts its left margin based on sidebar state:
- Sidebar open (240px): `marginLeft: '240px'`
- Sidebar closed (64px): `marginLeft: '64px'`
- Transition: `transition-all duration-300`

This keeps the navbar aligned with the content area.

---

## Styling Rules

**Colors (use token variables only):**
- Background: `bg-[var(--color-surface)]`
- Border: `border-[var(--color-border)]`
- Text: `text-[var(--color-text)]`
- Muted text: `text-[var(--color-text-muted)]`
- Primary accent: `bg-[var(--color-primary)]`
- Error badge: `bg-[var(--color-error)]`

**Dimensions:**
- Height: `h-16` (64px)
- Horizontal padding: `px-6`
- Logo size: `h-8 w-8`
- Icon size: `h-5 w-5`

---

## Region Selector Behavior

**State Management:**
- Reads `selectedRegionId` from `useRegionStore()`
- Updates store via `setSelectedRegionId(regionId)`
- All list pages in Phase 3 will subscribe to this filter

**Placeholder Regions:**
```typescript
const REGIONS = [
  { id: 'region_1', name: 'Sydney Metro', state: 'NSW' },
  { id: 'region_2', name: 'Melbourne Metro', state: 'VIC' },
  { id: 'region_3', name: 'Brisbane Metro', state: 'QLD' },
  { id: 'region_4', name: 'Perth Metro', state: 'WA' },
];
```

These will be replaced with database queries in Phase 3.

---

## User Menu

**Static Content (Phase 1):**
- User name: "Admin User"
- Email: "admin@supportcrm.io"
- Avatar initials: "AU"

**Menu Items:**
- Profile (placeholder, no action)
- Settings (placeholder, no action)
- Sign Out (placeholder, functional in Phase 2)

---

## Success Criteria

- [x] Navbar renders at fixed top with 64px height
- [x] Sidebar toggle button works (updates Zustand store)
- [x] Toggle icon switches between PanelLeftOpen/PanelLeftClose
- [x] SupportCRM logo and wordmark display correctly
- [x] Region selector dropdown renders with 4 regions
- [x] Selecting a region updates `regionStore.selectedRegionId`
- [x] Search input renders with icon (non-functional placeholder)
- [x] Notification bell shows badge with count
- [x] User avatar dropdown menu opens with Profile/Settings/Sign Out
- [x] Navbar margin adjusts smoothly with sidebar state
- [x] All colors use token variables
- [x] pnpm build passes with 0 errors

---

## Dependencies

**Imports:**
- Icons from `lucide-react`
- Button, Input, Select, DropdownMenu, Avatar, Badge from `@/components/ui`
- `useUIStore` from `@/store/ui-store`
- `useRegionStore` from `@/store/region-store`

**No new packages needed.**

---

## Notes

- Navbar uses inline `style` for dynamic margin (cleaner than conditional classes)
- Search is non-functional in Phase 1 (global search implemented in Phase 4)
- Notification badge count is hardcoded (real count from database in Phase 3)
- User menu actions are placeholders (sign-out functional in Phase 2)
- Region filter is global—all list pages will respect the selected region