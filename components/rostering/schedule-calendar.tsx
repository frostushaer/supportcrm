/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface ScheduleCalendarProps {
  viewMode: 'Worker' | 'Participant'
  startDate: Date
  daysToRender: number
  rows: any[] // Either workers or participants
  shifts: any[]
  onShiftClick: (shift: any) => void
  onEmptyCellClick: (rowId: string, date: Date) => void
}

export function ScheduleCalendar({
  viewMode,
  startDate,
  daysToRender,
  rows,
  shifts,
  onShiftClick,
  onEmptyCellClick,
}: ScheduleCalendarProps) {
  // Generate the dates for the columns
  const dates = Array.from({ length: daysToRender }).map((_, i) => addDays(startDate, i))

  const getShiftBadgeColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500 hover:bg-green-600 text-white'
      case 'Unpublished': return 'bg-orange-500 hover:bg-orange-600 text-white'
      case 'Rejected': return 'bg-red-500 hover:bg-red-600 text-white'
      case 'Open': return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      default: return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  const getShiftsForCell = (rowId: string, date: Date) => {
    return shifts.filter(shift => {
      const isCorrectRow = viewMode === 'Worker' ? shift.workerId === rowId : shift.participantId === rowId
      const isCorrectDate = isSameDay(new Date(shift.shiftDate), date)
      return isCorrectRow && isCorrectDate
    })
  }

  return (
    <div className="w-full overflow-x-auto border rounded-xl bg-[var(--color-surface)]">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="flex border-b">
          <div className="w-48 flex-shrink-0 p-4 font-semibold border-r bg-gray-50 dark:bg-gray-900">
            {viewMode === 'Worker' ? 'Worker' : 'Participant'}
          </div>
          {dates.map((date, i) => {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            return (
              <div key={i} className={`flex-1 min-w-[120px] p-2 text-center border-r font-medium text-sm ${isWeekend ? 'bg-pink-50 dark:bg-pink-900/20' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="text-[var(--color-text-muted)] text-xs uppercase">{format(date, 'EEE')}</div>
                <div className="text-[var(--color-text)]">{format(date, 'd MMM')}</div>
                {isWeekend && <div className="text-pink-500 text-[10px] mt-1 font-bold">Weekend</div>}
              </div>
            )
          })}
        </div>

        {/* Data Rows */}
        {rows.map((row) => (
          <div key={row.id} className="flex border-b last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
            {/* Row Header (Worker/Participant Name) */}
            <div className="w-48 flex-shrink-0 p-4 border-r flex items-center font-medium text-sm">
              {row.firstName} {row.lastName}
            </div>

            {/* Day Cells */}
            {dates.map((date, i) => {
              const cellShifts = getShiftsForCell(row.id, date)
              
              return (
                <div 
                  key={i} 
                  className="flex-1 min-w-[120px] min-h-[80px] p-2 border-r relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    // Prevent click if we clicked a shift
                    if (e.target === e.currentTarget) {
                      onEmptyCellClick(row.id, date)
                    }
                  }}
                >
                  <div className="space-y-1">
                    {cellShifts.map((shift) => (
                      <div 
                        key={shift.id} 
                        onClick={() => onShiftClick(shift)}
                        className={`text-xs p-1.5 rounded cursor-pointer truncate shadow-sm transition-transform hover:scale-[1.02] ${getShiftBadgeColor(shift.status)}`}
                        title={`${format(new Date(shift.startDateTime), 'HH:mm')} - ${format(new Date(shift.endDateTime), 'HH:mm')} | ${shift.status}`}
                      >
                        {format(new Date(shift.startDateTime), 'HH:mm')} - {format(new Date(shift.endDateTime), 'HH:mm')}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {rows.length === 0 && (
          <div className="p-8 text-center text-[var(--color-text-muted)]">
            No {viewMode === 'Worker' ? 'workers' : 'participants'} found for the selected filters.
          </div>
        )}
      </div>
    </div>
  )
}
