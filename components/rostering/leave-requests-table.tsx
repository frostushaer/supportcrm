/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from 'date-fns'

interface LeaveRequestsTableProps {
  data: any[]
}

export function LeaveRequestsTable({ data }: LeaveRequestsTableProps) {
  const columns = [
    {
      key: 'worker',
      label: 'Worker',
      render: (item: any) => `${item.worker?.firstName} ${item.worker?.lastName}`
    },
    {
      key: 'leaveType',
      label: 'Leave Type',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (item: any) => format(new Date(item.startDate), 'dd MMM yyyy')
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (item: any) => format(new Date(item.endDate), 'dd MMM yyyy')
    },
    {
      key: 'reason',
      label: 'Reason',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />
    }
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search leave requests..."
    />
  )
}
