'use client'

import { PageHeader } from '@/components/shared/page-header'
import Link from 'next/link'
import { Calendar, Clock, FileSpreadsheet, Plane } from 'lucide-react'

export default function RosteringDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rostering Dashboard"
        description="Overview of shifts, leave requests, and timesheets."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/rostering/schedule" className="group">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 h-full hover:border-[var(--color-primary)] transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Schedule
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  All Worker Shifts In The Scheduling Calendar
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/rostering/timesheets" className="group">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 h-full hover:border-[var(--color-primary)] transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Timesheet
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  All Timesheets
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/rostering/leave-requests" className="group">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 h-full hover:border-[var(--color-primary)] transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                <Plane className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Leave Requests
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  All Leave Requests And History
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/rostering/timesheet-export" className="group">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 h-full hover:border-[var(--color-primary)] transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Timesheet Export
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Export Timesheet Data
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
