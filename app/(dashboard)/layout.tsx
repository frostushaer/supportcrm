import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebarNew } from '@/components/layout/app-sidebar-new';
import { SearchDialog } from '@/components/layout/search-dialog';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { DashboardUserMenu } from '@/components/layout/dashboard-user-menu';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': 'calc(var(--spacing) * 68)' } as React.CSSProperties}
    >
      <AppSidebarNew variant="inset" collapsible="icon" />
      <SidebarInset className="peer-data-[variant=inset]:border">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
              />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <DashboardUserMenu />
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
