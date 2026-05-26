import type { Metadata } from 'next';
import { AlertTriangle, Calendar, Clock, FileText, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/shared/kpi-card';
import { GreetingHeader } from '@/components/shared/greeting-header';
import { StatusBadge } from '@/components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Dashboard - SupportCRM',
  description: 'NDIS operations overview and key metrics',
};

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <GreetingHeader />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 pb-8 space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Participants"
              value="247"
              trend={{ value: '+12% this month', positive: true }}
              icon={<Users className="h-5 w-5" />}
              variant="purple"
            />
            <KPICard
              title="Active Workers"
              value="89"
              trend={{ value: '+5 new this week', positive: true }}
              icon={<UserCheck className="h-5 w-5" />}
              variant="teal"
            />
            <KPICard
              title="Shifts This Week"
              value="342"
              trend={{ value: '-8% from last week', positive: false }}
              icon={<Calendar className="h-5 w-5" />}
              variant="blue"
            />
            <KPICard
              title="Pending Invoices"
              value="23"
              trend={{ value: '5 due this week', positive: false }}
              icon={<FileText className="h-5 w-5" />}
              variant="red"
            />
          </div>

          {/* Main content + right sidebar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Left + center — 2 columns wide */}
            <div className="space-y-6 lg:col-span-2">

              {/* Quick Actions */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-md">
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

              {/* Compliance Tracker */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                  Compliance Tracker
                </h2>
                <div className="space-y-4">
                  {[
                    { name: 'Jane Smith', doc: 'NDIS Plan', expires: '15 Jun 2025', pct: 85, status: 'active' as const },
                    { name: 'Mark Johnson', doc: 'Worker Screening', expires: '3 Jul 2025', pct: 60, status: 'pending' as const },
                    { name: 'Sarah Lee', doc: 'First Aid Certificate', expires: '28 May 2025', pct: 20, status: 'inactive' as const },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-subtle)] text-xs font-semibold text-[var(--color-text-secondary)]">
                        {row.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-[var(--color-text)]">{row.name}</p>
                          <StatusBadge status={row.status} />
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">{row.doc} · expires {row.expires}</p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-subtle)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-primary)]"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Scheduled Shifts Today */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-md">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">Shifts Today</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { worker: 'Tom Harris', time: '8:00 AM – 2:00 PM', participant: 'Alice Wong' },
                    { worker: 'Maria Chen', time: '9:00 AM – 1:00 PM', participant: 'Bob Park' },
                    { worker: 'David Roy', time: '2:00 PM – 6:00 PM', participant: 'Carol Bates' },
                  ].map((shift) => (
                    <div key={shift.worker} className="rounded-lg bg-[var(--color-subtle)] px-3 py-2">
                      <p className="text-xs font-medium text-[var(--color-text)]">{shift.worker}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{shift.time}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">→ {shift.participant}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiring Documents */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-md">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">Expiring Soon</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Lee', doc: 'First Aid', days: 5 },
                    { name: 'James Wu', doc: 'Police Check', days: 12 },
                    { name: 'Nina Patel', doc: 'NDIS Plan', days: 18 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text)]">{item.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{item.doc}</p>
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-warning)]">
                        {item.days}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-md">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">This Week</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Shifts completed', value: '94%', positive: true },
                    { label: 'Incidents reported', value: '2', positive: false },
                    { label: 'Invoices raised', value: '18', positive: true },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                      <p className={`text-xs font-semibold ${stat.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
