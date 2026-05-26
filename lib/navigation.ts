import {
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  Settings,
  Shield,
  Users,
  Wrench,
} from 'lucide-react';

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: 'Core',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Participants', url: '/participants', icon: Users },
    ],
  },
  {
    id: 2,
    label: 'Operations',
    items: [
      { title: 'Support Workers', url: '/support-workers', icon: Wrench },
      { title: 'Shifts', url: '/shifts', icon: ClipboardList },
      { title: 'Incidents', url: '/incidents', icon: Shield },
    ],
  },
  {
    id: 3,
    label: 'Compliance',
    items: [
      { title: 'Audits', url: '/audits', icon: FileText },
      { title: 'Documents', url: '/documents', icon: FileText },
    ],
  },
  {
    id: 4,
    label: 'Finance',
    items: [
      { title: 'Invoices', url: '/invoices', icon: CreditCard },
      { title: 'Reports', url: '/reports', icon: BarChart3 },
    ],
  },
  {
    id: 5,
    label: 'System',
    items: [
      { title: 'Regions', url: '/regions', icon: MapPin },
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];
