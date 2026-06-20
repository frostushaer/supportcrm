/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRegionStore } from '@/store/region-store'
import { useWorkers } from '@/hooks/use-hrm'
import { FileSpreadsheet } from 'lucide-react'

export default function TimesheetExportPage() {
  const { selectedRegionId } = useRegionStore()
  const { data: workers = [] } = useWorkers('', 'All', selectedRegionId)

  const [workerId, setWorkerId] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const handleExport = () => {
    // Stub for export functionality
    alert('Export functionality will generate a CSV/XLSX file based on selected filters.')
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Timesheet Export" 
        description="Export timesheet data for payroll and reporting" 
      />

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Worker</Label>
            <Select value={workerId} onValueChange={setWorkerId}>
              <SelectTrigger>
                <SelectValue placeholder="All Workers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workers</SelectItem>
                {workers.map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>{w.firstName} {w.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleExport} className="w-full flex items-center justify-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>
    </div>
  )
}
