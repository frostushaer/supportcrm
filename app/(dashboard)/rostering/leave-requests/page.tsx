'use client'

import { PageHeader } from '@/components/shared/page-header'
import { LeaveRequestsTable } from '@/components/rostering/leave-requests-table'
import { useRegionStore } from '@/store/region-store'
import { useRosteringLeaveRequests } from '@/hooks/use-rostering'
import { EmptyState } from '@/components/shared/empty-state'
import { Plane } from 'lucide-react'

export default function LeaveRequestsPage() {
  const { selectedRegionId } = useRegionStore()
  const { data: leaveRequests = [], isLoading } = useRosteringLeaveRequests({ regionId: selectedRegionId })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leave Requests" 
        description="View all leave requests across workers in the region" 
      />

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">Loading...</div>
        ) : leaveRequests.length === 0 ? (
          <EmptyState
            icon={<Plane className="w-12 h-12 text-gray-400" />}
            title="No Leave Requests"
            description="There are currently no leave requests submitted by workers."
          />
        ) : (
          <LeaveRequestsTable data={leaveRequests} />
        )}
      </div>
    </div>
  )
}
