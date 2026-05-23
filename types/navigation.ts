import { LucideIcon } from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
