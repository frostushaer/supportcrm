/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useAhParticipants } from '@/hooks/use-allied-health';

import { format } from 'date-fns';
import Link from 'next/link';

export default function CosParticipantsPage() {
  const [managementStyle, setManagementStyle] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');

  const { data: participants, isLoading } = useAhParticipants({
    managementStyle,
    activeStatus,
    search
  });

  const columns = [
    {
      key: 'name',
      label: 'Participant Name',
      render: (item: any) => {
        return (
          <Link href={`/participants/${item.id}`} className="text-blue-600 hover:underline font-medium">
            {item.firstName} {item.lastName}
          </Link>
        );
      }
    },
    {
      key: 'managementStyle',
      label: 'Management Style',
      render: (item: any) => item.cosProfile?.managementStyle || 'N/A'
    },
    {
      key: 'serviceRegion',
      label: 'Service Region',
      render: (item: any) => item.region?.name || 'N/A'
    },
    {
      key: 'ndisNumber',
      label: 'NDIS No.',
      render: (item: any) => item.cosProfile?.ndisNumber || item.ndisNumber || 'N/A'
    },
    {
      key: 'planStartDate',
      label: 'Plan Start Date',
      render: (item: any) => {
        const date = item.cosProfile?.planStartDate;
        return date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
      }
    },
    {
      key: 'planEndDate',
      label: 'Plan End Date',
      render: (item: any) => {
        const date = item.cosProfile?.planEndDate;
        return date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
      }
    },
    {
      key: 'quickSnapshot',
      label: 'Quick Snapshot',
      render: (item: any) => item.cosProfile?.quickSnapshot || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allied Health Participants"
        description="List of all Allied Health participants."
      />

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <select
          className="form-input w-48"
          value={managementStyle}
          onChange={(e) => setManagementStyle(e.target.value)}
        >
          <option value="All">All Management Styles</option>
          <option value="Agency">Agency</option>
          <option value="Plan Managed">Plan Managed</option>
          <option value="Self Managed">Self Managed</option>
          <option value="Both">Both</option>
        </select>
        
        <select
          className="form-input w-48"
          value={activeStatus}
          onChange={(e) => setActiveStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <input
          type="text"
          placeholder="Search participants..."
          className="form-input flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <DataTable
          data={participants || []}
          columns={columns}
        />
      </div>
    </div>
  );
}
