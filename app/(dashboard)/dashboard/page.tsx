import type { Metadata } from 'next';
import { Calendar, FileText, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/shared/kpi-card';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Dashboard - SupportCRM',
  description: 'NDIS operations overview and key metrics',
};

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your NDIS operations."
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Participants"
              value="247"
              trend={{ value: '+12% this month', positive: true }}
              icon={<Users className="h-5 w-5" />}
            />
            <KPICard
              title="Active Workers"
              value="89"
              trend={{ value: '+5 new this week', positive: true }}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <KPICard
              title="Shifts This Week"
              value="342"
              trend={{ value: '-8% from last week', positive: false }}
              icon={<Calendar className="h-5 w-5" />}
            />
            <KPICard
              title="Pending Invoices"
              value="23"
              trend={{ value: '5 due this week', positive: false }}
              icon={<FileText className="h-5 w-5" />}
            />
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button>Add Participant</Button>
              <Button variant="outline">Create Shift</Button>
              <Button variant="outline">Record Incident</Button>
              <Button variant="outline">Generate Invoice</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
