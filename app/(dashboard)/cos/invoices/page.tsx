/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useCosInvoices, useCosParticipants } from '@/hooks/use-cos';

import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import { Plus } from 'lucide-react';

export default function CosInvoicesPage() {
  const [invoiceType, setInvoiceType] = useState('All');
  const [participantId, setParticipantId] = useState('All');

  const { data: invoices, isLoading } = useCosInvoices({
    invoiceType,
    participantId
  });

  const { data: participants } = useCosParticipants();

  const columns = [
    { key: 'reference', label: 'Reference' },
    {
      key: 'participant',
      label: 'Participant',
      render: (item: any) => item.participant ? `${item.participant.firstName} ${item.participant.lastName}` : 'N/A'
    },
    { key: 'invoiceType', label: 'Invoice Type' },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (item: any) => format(new Date(item.createdAt), 'dd/MM/yyyy')
    },
    {
      key: 'serviceDeliveredFrom',
      label: 'Delivered From',
      render: (item: any) => format(new Date(item.serviceDeliveredFrom), 'dd/MM/yyyy')
    },
    {
      key: 'serviceDeliveredTo',
      label: 'Delivered To',
      render: (item: any) => format(new Date(item.serviceDeliveredTo), 'dd/MM/yyyy')
    },
    {
      key: 'numDeliveredServices',
      label: 'Services Count'
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      render: (item: any) => `$${parseFloat(item.totalValue).toFixed(2)}`
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
          title="COS Invoices"
          description="Manage and track invoices for Support Coordination."
        />
        <button className="btn-primary flex items-center gap-2" onClick={() => alert('Add COS Invoice dialog to be implemented')}>
          <Plus className="w-4 h-4" /> Add COS Invoice
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <select
          className="form-input w-48"
          value={invoiceType}
          onChange={(e) => setInvoiceType(e.target.value)}
        >
          <option value="All">All Invoice Types</option>
          <option value="ParticipantBased">Participant Based</option>
          <option value="Other">Other</option>
        </select>
        
        <select
          className="form-input w-48"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
        >
          <option value="All">All Participants</option>
          {participants?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <DataTable
          data={invoices || []}
          columns={columns}
        />
      </div>
    </div>
  );
}
