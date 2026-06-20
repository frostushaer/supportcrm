/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { KPICard } from '@/components/shared/kpi-card';
import { Users, Clock, Trophy, FileText, ClipboardList, Building, History, CheckCircle, FileSpreadsheet, PieChart } from 'lucide-react';
import { useAhDashboardSummary } from '@/hooks/use-allied-health';
import Link from 'next/link';
import { DataTable } from '@/components/shared/data-table';


export default function AlliedHealthDashboard() {
  const { data: summary, isLoading } = useAhDashboardSummary();

  const totalClients = summary?.totalClients || 0;
  const billableHours = summary?.billableHours || '0.0';
  const leaderboard = summary?.leaderboard || [];

  const leaderboardColumns = [
    { key: 'name', label: 'Coordinator' },
    { key: 'email', label: 'Email' },
    { key: 'activeParticipants', label: 'Active Participants' },
    { key: 'billableHours', label: 'Billable Hours' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coordination Of Support"
        description="Overview of your Allied Health activities and participants."
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <Link href="/ah/participants" className="btn-secondary flex items-center gap-2">
          <Users className="w-4 h-4" /> Participant List
        </Link>
        <Link href="/ah/catalogue-services" className="btn-secondary flex items-center gap-2">
          <ClipboardList className="w-4 h-4" /> Catalogue Service
        </Link>
        <Link href="/ah/service-providers" className="btn-secondary flex items-center gap-2">
          <Building className="w-4 h-4" /> Service Providers
        </Link>
        <Link href="/ah/case-notes-history" className="btn-secondary flex items-center gap-2">
          <History className="w-4 h-4" /> Case Note History
        </Link>
        <Link href="/ah/ndis-claims" className="btn-secondary flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> NDIS Claims
        </Link>
        <Link href="/ah/invoices" className="btn-secondary flex items-center gap-2">
          <FileText className="w-4 h-4" /> Invoices
        </Link>
        <Link href="/ah/reporting" className="btn-secondary flex items-center gap-2">
          <PieChart className="w-4 h-4" /> Reporting
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Billable Hours (This Week)"
          value={billableHours}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          trend={{ value: 'hrs billed', positive: true }}
        />
        <KPICard
          title="Total Allied Health Clients"
          value={totalClients}
          icon={<Users className="h-5 w-5 text-green-500" />}
          trend={{ value: 'Active clients', positive: true }}
        />
      </div>

      <div className="mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Coordinator Leaderboard</h2>
        </div>
        <DataTable
          data={leaderboard}
          columns={leaderboardColumns}
          searchPlaceholder="Search coordinators..."
        />
      </div>
    </div>
  );
}
