'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { HomeTable } from '@/components/home-management/home-table'
import { HomeModal } from '@/components/home-management/home-modal'
import { useRegionStore } from '@/store/region-store'
import { useHomes } from '@/hooks/use-home-management'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

export default function HomeListingPage() {
  const { selectedRegionId } = useRegionStore()
  const [statusFilter, setStatusFilter] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: homes, isLoading } = useHomes({
    regionId: selectedRegionId,
    status: statusFilter,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Home Listing"
        description="Manage SIL/NDIS accommodation properties and track vacancy"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Home
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <HomeTable data={homes || []} isLoading={isLoading} />

      <HomeModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        mode="create"
      />
    </div>
  )
}
