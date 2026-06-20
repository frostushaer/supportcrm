/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ScheduleCalendar } from '@/components/rostering/schedule-calendar'
import { ShiftModal } from '@/components/rostering/shift-modal'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRegionStore } from '@/store/region-store'
import { useShifts } from '@/hooks/use-rostering'
import { useWorkers } from '@/hooks/use-hrm'
import { useParticipants } from '@/hooks/use-participants'
import { format, startOfWeek, addDays, subDays } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SchedulePage() {
  const { selectedRegionId } = useRegionStore()
  
  const [viewMode, setViewMode] = useState<'Worker' | 'Participant'>('Worker')
  const [period, setPeriod] = useState('Fortnightly')
  
  // Date range state
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const daysToRender = period === 'Weekly' ? 7 : (period === 'Fortnightly' ? 14 : 28)
  const endDate = addDays(startDate, daysToRender - 1)

  // Filters
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all')
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all')

  // Fetch data
  const { data: workers = [] } = useWorkers('', 'All', selectedRegionId)
  const { data: participants = [] } = useParticipants('All', '')
  const { data: shifts = [], refetch, isFetching } = useShifts({
    regionId: selectedRegionId,
    workerId: selectedWorkerId !== 'all' ? selectedWorkerId : undefined,
    participantId: selectedParticipantId !== 'all' ? selectedParticipantId : undefined,
    fromDate: startDate.toISOString(),
    toDate: endDate.toISOString(),
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<any>(null)
  const [clickedDate, setClickedDate] = useState<Date | undefined>(undefined)
  const [clickedWorkerId, setClickedWorkerId] = useState<string | undefined>(undefined)
  const [clickedParticipantId, setClickedParticipantId] = useState<string | undefined>(undefined)

  const rows = useMemo(() => {
    if (viewMode === 'Worker') {
      return selectedWorkerId === 'all' 
        ? workers 
        : workers.filter((w: any) => w.id === selectedWorkerId)
    } else {
      return selectedParticipantId === 'all'
        ? participants
        : participants.filter((p: any) => p.id === selectedParticipantId)
    }
  }, [viewMode, workers, participants, selectedWorkerId, selectedParticipantId])

  const handlePrevious = () => setStartDate(subDays(startDate, daysToRender))
  const handleNext = () => setStartDate(addDays(startDate, daysToRender))

  const handleCreateNew = () => {
    setEditingShift(null)
    setClickedDate(new Date())
    setClickedWorkerId(viewMode === 'Worker' && selectedWorkerId !== 'all' ? selectedWorkerId : undefined)
    setClickedParticipantId(viewMode === 'Participant' && selectedParticipantId !== 'all' ? selectedParticipantId : undefined)
    setIsModalOpen(true)
  }

  const handleShiftClick = (shift: any) => {
    setEditingShift(shift)
    setIsModalOpen(true)
  }

  const handleEmptyCellClick = (rowId: string, date: Date) => {
    setEditingShift(null)
    setClickedDate(date)
    if (viewMode === 'Worker') {
      setClickedWorkerId(rowId)
      setClickedParticipantId(undefined)
    } else {
      setClickedParticipantId(rowId)
      setClickedWorkerId(undefined)
    }
    setIsModalOpen(true)
  }

  // Legend counts
  const unpublishedCount = shifts.filter((s: any) => s.status === 'Unpublished').length
  const publishedCount = shifts.filter((s: any) => s.status === 'Published').length
  const rejectedCount = shifts.filter((s: any) => s.status === 'Rejected').length
  const openCount = shifts.filter((s: any) => s.status === 'Open').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Schedule" description="Manage worker and participant shifts" />
        <Link href="/rostering/timesheets">
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Redirect To Timesheet
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-4">
        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={viewMode} onValueChange={(v: any) => { setViewMode(v); setSelectedWorkerId('all'); setSelectedParticipantId('all'); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Worker">Worker View</SelectItem>
                <SelectItem value="Participant">Participant View</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === 'Worker' ? (
              <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Workers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workers</SelectItem>
                  {workers.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.firstName} {w.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Participants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  {participants.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly Period</SelectItem>
                <SelectItem value="Fortnightly">Fortnightly Period</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md">
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 text-sm font-medium">
                {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Shift
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <ScheduleCalendar 
          viewMode={viewMode}
          startDate={startDate}
          daysToRender={daysToRender}
          rows={rows}
          shifts={shifts}
          onShiftClick={handleShiftClick}
          onEmptyCellClick={handleEmptyCellClick}
        />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium mt-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>{unpublishedCount} Unpublished Shifts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>{publishedCount} Published Shifts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>{rejectedCount} Rejected Shifts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>{openCount} Open Shifts</span>
          </div>
        </div>
      </div>

      <ShiftModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        shift={editingShift}
        selectedDate={clickedDate}
        selectedWorkerId={clickedWorkerId}
        selectedParticipantId={clickedParticipantId}
      />
    </div>
  )
}
