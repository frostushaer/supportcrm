import {
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  HeadphonesIcon,
  HeartPulse,
  HelpCircle,
  Home,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldAlert,
  Stethoscope,
  ThumbsDown,
  Users,
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
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Participants', url: '/participants', icon: Users },
      { title: 'HRM', url: '/hrm', icon: Building2 },
      { title: 'Support Coordination', url: '/support-coordination', icon: HeadphonesIcon },
      { title: 'Allied Health', url: '/allied-health', icon: Stethoscope },
      { title: 'Rostering', url: '/rostering', icon: ClipboardList },
      { title: 'Home Management', url: '/home-management', icon: Home },
      { title: 'Incident Management', url: '/incidents', icon: ShieldAlert },
      { title: 'Invoicing', url: '/invoices', icon: FileText },
      { title: 'Reporting', url: '/reports', icon: BarChart3 },
      { title: 'Forms Management CRM', url: '/forms-crm', icon: ScrollText },
      { title: 'Forms Management HRM', url: '/forms-hrm', icon: ScrollText },
      { title: 'Forms Home MGT', url: '/forms-home-mgt', icon: ScrollText },
      { title: 'Policies', url: '/policies', icon: ScrollText },
      { title: 'Complaints', url: '/complaints', icon: ThumbsDown },
      { title: 'Feedback', url: '/feedback', icon: MessageSquare },
      { title: 'Ask a Question', url: '/ask-a-question', icon: HelpCircle },
    ],
  },
];
