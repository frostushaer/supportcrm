/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplicants } from '@/hooks/use-hrm';
import { useRegionStore } from '@/store/region-store';
import Link from 'next/link';

export default function ApplicantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { selectedRegionId, setSelectedRegionId } = useRegionStore();

  const { data: applicants, isLoading } = useApplicants(search, statusFilter, selectedRegionId);

  const columns = [
    { label: 'Name', key: 'name', render: (row: any) => `\${row.firstName} \${row.lastName}` },
    { label: 'Email', key: 'email' },
    { label: 'Job Title', key: 'jobTitle' },
    { label: 'Applied On', key: 'appliedOn', render: (row: any) => new Date(row.appliedOn).toLocaleDateString() },
    {
      label: 'Status',
      key: 'status',
      render: (row: any) => {
        let colorClass = 'text-[var(--color-text-muted)] bg-[var(--color-subtle)]';
        if (row.status === 'Hired') colorClass = 'text-[var(--color-success)] bg-[var(--color-success-dim)]';
        if (row.status === 'Rejected') colorClass = 'text-[var(--color-danger)] bg-[var(--color-danger-dim)]';
        if (['PhoneScreening', 'Interview', 'Offer'].includes(row.status)) colorClass = 'text-[var(--color-primary)] bg-[var(--color-primary-dim)]';
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold \${colorClass}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      label: 'Action',
      key: 'action',
      render: (row: any) => (
        <Link href={`/hrm/applicants/\${row.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
          <Eye className="h-4 w-4" />
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Applicants"
        description="Manage your hiring pipeline"
        action={
          <div className="flex items-center gap-4">
            <Select value={selectedRegionId || 'all'} onValueChange={(val) => setSelectedRegionId(val === 'all' ? '' : val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {/* Dynamically populate regions in a real app */}
                <SelectItem value="region_1">Brisbane</SelectItem>
                <SelectItem value="region_2">Sydney</SelectItem>
              </SelectContent>
            </Select>
            <Button>+ Add Applicant</Button>
          </div>
        }
      />

      <div className="flex items-center justify-between bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="PhoneScreening">Phone Screening</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Hired">Hired</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">Loading applicants...</div>
      ) : applicants && applicants.length > 0 ? (
        <DataTable columns={columns} data={applicants} />
      ) : (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">No applicants found</h3>
          <p className="text-[var(--color-text-muted)] mt-1">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
