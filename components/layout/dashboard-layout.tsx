'use client';

import { AppSidebar } from './app-sidebar';
import { TopNavbar } from './top-navbar';
import { useUIStore } from '@/store/ui-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AppSidebar />
      <TopNavbar />
      <main
        className="min-h-screen pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
      >
        {children}
      </main>
    </div>
  );
}
