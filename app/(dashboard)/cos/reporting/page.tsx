/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useCosFundingReport, useCosParticipants } from '@/hooks/use-cos';

import { format } from 'date-fns';

export default function CosReportingPage() {
  const [reportType, setReportType] = useState('Funding');
  const [participantId, setParticipantId] = useState('All');
  const [coordinatorId, setCoordinatorId] = useState('All');

  const { data: fundingData, isLoading } = useCosFundingReport({
    participantId,
    coordinatorId
  });

  const { data: participants } = useCosParticipants();

  const handleClear = () => {
    setReportType('Funding');
    setParticipantId('All');
    setCoordinatorId('All');
  };

  const fundingColumns = [
    {
      key: 'participantName',
      label: 'Participant Name',
      render: (item: any) => item.participant ? `${item.participant.firstName} ${item.participant.lastName}` : 'N/A'
    },
    {
      key: 'ndisNo',
      label: 'NDIS No.',
      render: (item: any) => item.participant?.cosProfile?.ndisNumber || 'N/A'
    },
    {
      key: 'fundingStartDate',
      label: 'Funding Start Date',
      render: (item: any) => format(new Date(item.fundingStartDate), 'dd/MM/yyyy')
    },
    {
      key: 'fundingEndDate',
      label: 'Funding End Date',
      render: (item: any) => format(new Date(item.fundingEndDate), 'dd/MM/yyyy')
    },
    {
      key: 'totalFunding',
      label: 'Total Funding',
      render: (item: any) => `$${parseFloat(item.totalFunding).toFixed(2)}`
    },
    {
      key: 'fundingRemaining',
      label: 'Funding Remaining',
      render: (item: any) => `$${parseFloat(item.fundingRemaining).toFixed(2)}`
    },
    {
      key: 'fundingDelivered',
      label: 'Funding Delivered',
      render: (item: any) => `$${parseFloat(item.fundingDelivered).toFixed(2)}`
    },
    { key: 'serviceName', label: 'Service Name' },
    {
      key: 'serviceTotalBudget',
      label: 'Service Total Budget',
      render: (item: any) => `$${parseFloat(item.serviceTotalBudget).toFixed(2)}`
    },
    { key: 'notes', label: 'Notes' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Reporting"
          description="Generate funding and service usage reports."
        />
        <button className="btn-secondary">Export Data</button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Select Report</label>
          <select
            className="form-input w-48"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="Funding">Funding Report</option>
            <option value="ServiceUsage">Service Usage (Coming Soon)</option>
          </select>
        </div>

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
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Support Coordinator</label>
          <select
            className="form-input w-48"
            value={coordinatorId}
            onChange={(e) => setCoordinatorId(e.target.value)}
          >
            <option value="All">All Coordinators</option>
            {/* Can populate coordinators here later */}
          </select>
        </div>

        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => {}}>Search</button>
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
        </div>
      </div>

      {reportType === 'Funding' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <DataTable
            data={fundingData || []}
            columns={fundingColumns}
          />
        </div>
      )}
      {reportType !== 'Funding' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center text-[var(--color-text-muted)]">
          This report type is coming soon.
        </div>
      )}
    </div>
  );
}
