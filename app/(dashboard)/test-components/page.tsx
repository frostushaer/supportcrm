import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { KPICard } from '@/components/shared/kpi-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { DataTable } from '@/components/shared/data-table';

export default function TestComponentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Test Components"
        description="Visual verification of shared components"
        action={<Button>Action Button</Button>}
      />

      <div className="px-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KPICard
            title="Total Participants"
            value="247"
            trend={{ value: '+12% this month', positive: true }}
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard
            title="Active Workers"
            value="84"
            trend={{ value: '-3% this month', positive: false }}
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard
            title="Shifts This Week"
            value="312"
            icon={<Users className="h-5 w-5" />}
          />
          <KPICard title="Pending Invoices" value="18" />
        </div>

        {/* Status Badges */}
        <div>
          <p className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Status Badges</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" />
            <StatusBadge status="inactive" />
            <StatusBadge status="pending" />
            <StatusBadge status="approved" />
            <StatusBadge status="draft" />
            <StatusBadge status="resolved" />
            <StatusBadge status="submitted" />
          </div>
        </div>

        {/* Empty State */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No participants found"
            description="Get started by adding your first participant to the system."
            action={<Button>Add Participant</Button>}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
            { key: 'region', label: 'Region' },
          ]}
          data={[
            { name: 'Alice Johnson', status: 'Active', region: 'Sydney Metro' },
            { name: 'Bob Smith', status: 'Pending', region: 'Melbourne Metro' },
            { name: 'Carol White', status: 'Inactive', region: 'Brisbane Metro' },
          ]}
          searchKey="name"
          searchPlaceholder="Search participants..."
        />
      </div>
    </div>
  );
}
