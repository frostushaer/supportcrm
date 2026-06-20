/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { KPICard } from '@/components/shared/kpi-card';
import { Users, UserPlus, Shield } from 'lucide-react';
import { useApplicants, useWorkers, usePortalUsers } from '@/hooks/use-hrm';
import { useRegionStore } from '@/store/region-store';
import Link from 'next/link';

export default function HRMDashboard() {
  const { selectedRegionId } = useRegionStore();
  
  const { data: applicants } = useApplicants('', 'All', selectedRegionId);
  const { data: workers } = useWorkers('', 'All', selectedRegionId);
  const { data: portalUsers } = usePortalUsers(selectedRegionId, 'All');

  const totalApplicants = applicants?.length || 0;
  const activeWorkers = workers?.filter((w: any) => w.status === 'Active')?.length || 0;
  const inactiveWorkers = workers?.filter((w: any) => w.status === 'Inactive')?.length || 0;
  
  const activePortalUsers = portalUsers?.filter((u: any) => u.status === 'Active')?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resources System"
        description="Good Afternoon! Here is a summary of your HR department."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Applicants"
          value={totalApplicants}
          icon={<UserPlus className="h-5 w-5 text-blue-500" />}
          trend={{ value: '+12% from last month', positive: true }}
        />
        <KPICard
          title="Staff (Workers)"
          value={activeWorkers + inactiveWorkers}
          icon={<Users className="h-5 w-5 text-green-500" />}
          trend={{ value: `${activeWorkers} Active, ${inactiveWorkers} Inactive`, positive: true }}
        />
        <KPICard
          title="Primary Portal Users"
          value={activePortalUsers}
          icon={<Shield className="h-5 w-5 text-purple-500" />}
          trend={{ value: `${activePortalUsers} Active Users`, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/hrm/applicants" className="p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">View All Applicants</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage the hiring pipeline</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[var(--color-subtle)] flex items-center justify-center group-hover:bg-[var(--color-primary-dim)] transition-colors">
            <UserPlus className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
          </div>
        </Link>
        
        <Link href="/hrm/team-management" className="p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">View All Staff</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage existing workers</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[var(--color-subtle)] flex items-center justify-center group-hover:bg-[var(--color-primary-dim)] transition-colors">
            <Users className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
          </div>
        </Link>

        <Link href="/hrm/primary-portal-users" className="p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">Primary Portal Users</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage login access</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[var(--color-subtle)] flex items-center justify-center group-hover:bg-[var(--color-primary-dim)] transition-colors">
            <Shield className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
          </div>
        </Link>
      </div>
    </div>
  );
}
