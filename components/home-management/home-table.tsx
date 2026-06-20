'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { DataTable } from '@/components/shared/data-table'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Edit2 } from 'lucide-react'
import { HomeModal } from './home-modal'

interface HomeTableProps {
  data: any[]
  isLoading?: boolean
}

export function HomeTable({ data, isLoading }: HomeTableProps) {
  const [selectedHome, setSelectedHome] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = (home: any) => {
    setSelectedHome(home)
    setIsModalOpen(true)
  }

  const columns = [
    {
      label: 'Property Address',
      key: 'streetAddress',
      render: (home: any) => (
        <div>
          <div className="font-medium">{home.streetAddress}</div>
          <div className="text-xs text-[var(--color-text-secondary)]">{home.suburb}, {home.state}</div>
        </div>
      ),
    },
    {
      label: 'Participants',
      key: 'currentOccupancy',
      render: (home: any) => (
        <span className="text-sm">{home.currentOccupancy}</span>
      ),
    },
    {
      label: 'Region',
      key: 'region',
      render: (home: any) => <span className="text-sm">{home.region?.name || 'Unknown'}</span>,
    },
    {
      label: 'Vacancy',
      key: 'vacancyStatus',
      render: (home: any) => {
        const { currentOccupancy, maxCapacity } = home
        return (
          <div className="flex flex-col">
            <span className="text-sm">{currentOccupancy} of {maxCapacity}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">{home.vacancyStatus}</span>
          </div>
        )
      },
    },
    {
      label: 'Status',
      key: 'status',
      render: (home: any) => <StatusBadge status={home.status} />,
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (home: any) => (
        <Button variant="ghost" size="icon" onClick={() => handleEdit(home)}>
          <Edit2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="streetAddress"
        searchPlaceholder="Search homes..."
      />

      <HomeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        home={selectedHome}
        mode="edit"
      />
    </>
  )
}
