'use client';

import { signOut } from 'next-auth/react';
import { Bell, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
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
      className="fixed top-0 right-0 left-0 z-30 h-16 flex items-center justify-between px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-all duration-300"
      style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        {/* Logo & Wordmark */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
            <span className="text-sm font-bold text-white">SC</span>
          </div>
          <span className="text-base font-semibold text-[var(--color-text)]">
            SupportCRM
          </span>
        </div>

        {/* Region Selector */}
        <Select
          value={selectedRegionId}
          onValueChange={(v) => setSelectedRegionId(v ?? '')}
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
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="View notifications"
            className="focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-[10px] bg-[var(--color-error)] text-white">
            3
          </Badge>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[var(--color-primary)] text-sm font-medium text-white">
                AU
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              Admin User
            </DropdownMenuLabel>
            <DropdownMenuLabel>
              <span className="text-xs font-normal text-[var(--color-text-muted)]">
                admin@supportcrm.io
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-[var(--color-error)]"
              variant="destructive"
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
