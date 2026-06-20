/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useNdisClaims } from '@/hooks/use-cos';

import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import { Plus } from 'lucide-react';

export default function NdisClaimsPage() {
  const [claimType, setClaimType] = useState('All');

  const { data: claims, isLoading } = useNdisClaims({
    claimType
  });

  const columns = [
    { key: 'reference', label: 'Reference' },
    {
      key: 'participant',
      label: 'Participant',
      render: (item: any) => item.participant ? `${item.participant.firstName} ${item.participant.lastName}` : 'N/A'
    },
    { key: 'claimType', label: 'Claim Type' },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (item: any) => format(new Date(item.createdAt), 'dd/MM/yyyy')
    },
    {
      key: 'deliveredFrom',
      label: 'Delivered From',
      render: (item: any) => format(new Date(item.deliveredFrom), 'dd/MM/yyyy')
    },
    {
      key: 'deliveredTo',
      label: 'Delivered To',
      render: (item: any) => format(new Date(item.deliveredTo), 'dd/MM/yyyy')
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (item: any) => `$${parseFloat(item.totalAmount).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="NDIS Claims"
          description="Manage NDIS claims generated from case notes."
        />
        <button className="btn-primary flex items-center gap-2" onClick={() => alert('Add NDIS Claim dialog to be implemented')}>
          <Plus className="w-4 h-4" /> Add NDIS Claim
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <select
          className="form-input w-48"
          value={claimType}
          onChange={(e) => setClaimType(e.target.value)}
        >
          <option value="All">All Claim Types</option>
          <option value="CaseNoteBased">Case Note Based</option>
          <option value="Manual">Manual</option>
        </select>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <DataTable
          data={claims || []}
          columns={columns}
        />
      </div>
    </div>
  );
}
