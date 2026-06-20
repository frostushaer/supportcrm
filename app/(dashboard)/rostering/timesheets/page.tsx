/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { useRegionStore } from '@/store/region-store'
import { useRosteringTimesheets } from '@/hooks/use-rostering'
import { EmptyState } from '@/components/shared/empty-state'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function TimesheetsPage() {
  const { selectedRegionId } = useRegionStore()
  const { data: timesheets = [], isLoading } = useRosteringTimesheets({ regionId: selectedRegionId })

  const columns = [
    {
      key: 'shift',
      label: 'Shift Date',
      render: (item: any) => item.shift?.shiftDate ? format(new Date(item.shift.shiftDate), 'dd MMM yyyy') : 'N/A'
    },
    {
      key: 'worker',
      label: 'Worker',
      render: (item: any) => `${item.shift?.worker?.firstName} ${item.shift?.worker?.lastName}`
    },
    {
      key: 'participant',
      label: 'Participant',
      render: (item: any) => item.shift?.participant ? `${item.shift.participant.firstName} ${item.shift.participant.lastName}` : 'N/A'
    },
    {
      key: 'totalHours',
      label: 'Total Hours',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Timesheets" 
        description="View all worker timesheets" 
      />

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">Loading...</div>
        ) : timesheets.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-12 h-12 text-gray-400" />}
            title="No Timesheets"
            description="There are currently no timesheets to display."
          />
        ) : (
          <DataTable
            data={timesheets}
            columns={columns}
            searchPlaceholder="Search timesheets..."
          />
        )}
      </div>
    </div>
  )
}
