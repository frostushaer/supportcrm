/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useAhCaseNotes, useAhParticipants } from '@/hooks/use-allied-health';

import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import { Info } from 'lucide-react';

export default function CaseNotesHistoryPage() {
  const [participantId, setParticipantId] = useState('All');
  const [noteContactType, setNoteContactType] = useState('All');
  const [deliveredFrom, setDeliveredFrom] = useState('');
  const [deliveredTo, setDeliveredTo] = useState('');

  const { data: caseNotes, isLoading } = useAhCaseNotes({
    participantId,
    noteContactType,
    deliveredFrom,
    deliveredTo
  });

  const { data: participants } = useAhParticipants();

  const handleClear = () => {
    setParticipantId('All');
    setNoteContactType('All');
    setDeliveredFrom('');
    setDeliveredTo('');
  };

  const columns = [
    {
      key: 'participant',
      label: 'Participant',
      render: (item: any) => item.participant ? `${item.participant.firstName} ${item.participant.lastName}` : 'N/A'
    },
    {
      key: 'fundingId',
      label: 'Funding',
      render: (item: any) => item.funding ? item.funding.serviceName : 'N/A'
    },
    { key: 'noteContactType', label: 'Contact Type' },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (item: any) => format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: any) => format(new Date(item.deliveredDate), 'dd/MM/yyyy')
    },
    {
      key: 'durationMinutes',
      label: 'Duration (m)',
      render: (item: any) => String(item.durationMinutes)
    },
    {
      key: 'kilometres',
      label: 'Km',
      render: (item: any) => String(item.kilometres || '-')
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item: any) => `$${parseFloat(item.amount).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />
    },
    {
      key: 'actions',
      label: 'Note',
      render: (item: any) => (
        <button
          onClick={() => alert(item.caseNoteText)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded"
          title="View Note"
        >
          <Info className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Case Notes History"
          description="View and manage billable Allied Health case notes."
        />
        <button className="btn-secondary">Export to CSV</button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Participant</label>
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

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Contact Type</label>
          <select
            className="form-input w-48"
            value={noteContactType}
            onChange={(e) => setNoteContactType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
            <option value="FaceToFace">Face to Face</option>
            <option value="Research">Research/Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Delivered From</label>
          <input
            type="date"
            className="form-input w-40"
            value={deliveredFrom}
            onChange={(e) => setDeliveredFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Delivered To</label>
          <input
            type="date"
            className="form-input w-40"
            value={deliveredTo}
            onChange={(e) => setDeliveredTo(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => {}}>Search</button>
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <DataTable
          data={caseNotes || []}
          columns={columns}
        />
      </div>
    </div>
  );
}
