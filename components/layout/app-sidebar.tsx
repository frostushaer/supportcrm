'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import type { NavSection } from '@/types/navigation';

const navSections: NavSection[] = [
  {
    label: 'Core',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Users, label: 'Participants', href: '/participants' },
      { icon: UserCheck, label: 'HRM', href: '/hrm' },
      { icon: Briefcase, label: 'Support Coordination', href: '/support-coordination' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: Heart, label: 'Allied Health', href: '/allied-health' },
      { icon: Calendar, label: 'Rostering', href: '/rostering' },
      { icon: Home, label: 'Home Management', href: '/home-management' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { icon: AlertTriangle, label: 'Incident Management', href: '/incidents' },
      { icon: ClipboardList, label: 'Forms', href: '/forms' },
      { icon: BookOpen, label: 'Policies', href: '/policies' },
      { icon: MessageSquare, label: 'Complaints', href: '/complaints' },
      { icon: ThumbsUp, label: 'Feedback', href: '/feedback' },
      { icon: HelpCircle, label: 'Ask a Question', href: '/ask' },
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

export function AppSidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delay={0}>
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
            'flex h-16 flex-shrink-0 items-center border-b border-[var(--color-border)]',
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
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                      sidebarOpen ? 'px-3' : 'justify-center px-0',
                      active
                        ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] hover:bg-[var(--color-primary-dim)]'
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
                      <TooltipTrigger>{linkContent}</TooltipTrigger>
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
