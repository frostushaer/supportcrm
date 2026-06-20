/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useRegionStore } from '@/store/region-store'
import { useWorkers } from '@/hooks/use-hrm'
import { useParticipants } from '@/hooks/use-participants'
import { useCreateShift, useUpdateShift } from '@/hooks/use-rostering'
import { format } from 'date-fns'

interface ShiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: any
  selectedDate?: Date
  selectedWorkerId?: string
  selectedParticipantId?: string
}

export function ShiftModal({ open, onOpenChange, shift, selectedDate, selectedWorkerId, selectedParticipantId }: ShiftModalProps) {
  const { selectedRegionId } = useRegionStore()
  
  const { data: workers = [] } = useWorkers('', 'All', selectedRegionId)
  const { data: participants = [] } = useParticipants('All', '')
  
  const createShift = useCreateShift()
  const updateShift = useUpdateShift()

  const isEdit = !!shift

  const [formData, setFormData] = useState({
    workerId: '',
    participantId: '',
    shiftDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    serviceCategory: '',
    ratioWorkerCount: 1,
    ratioParticipantCount: 1,
    tasks: [''],
    status: 'Unpublished',
    
    // Quick Settings
    workerTrackingEnabled: false,
    isGroupShift: false,
    isOpenShift: false,
    requireParticipantSignature: false,
    enforceDistanceRestriction: false,
    allowShiftOverlapping: false,
    isSleepoverShift: false,

    // Recurrence
    recurring: false,
    recurrencePattern: 'Weekly',
    recurrenceEndDate: '',
  })

  useEffect(() => {
    if (open) {
      if (shift) {
        setFormData({
          workerId: shift.workerId || '',
          participantId: shift.participantId || '',
          shiftDate: format(new Date(shift.shiftDate), 'yyyy-MM-dd'),
          startTime: format(new Date(shift.startDateTime), 'HH:mm'),
          endTime: format(new Date(shift.endDateTime), 'HH:mm'),
          serviceCategory: shift.serviceCategory || '',
          ratioWorkerCount: shift.ratioWorkerCount || 1,
          ratioParticipantCount: shift.ratioParticipantCount || 1,
          tasks: shift.tasks?.length ? shift.tasks : [''],
          status: shift.status || 'Unpublished',
          
          workerTrackingEnabled: shift.workerTrackingEnabled || false,
          isGroupShift: shift.isGroupShift || false,
          isOpenShift: shift.isOpenShift || false,
          requireParticipantSignature: shift.requireParticipantSignature || false,
          enforceDistanceRestriction: shift.enforceDistanceRestriction || false,
          allowShiftOverlapping: shift.allowShiftOverlapping || false,
          isSleepoverShift: shift.isSleepoverShift || false,

          recurring: shift.recurring || false,
          recurrencePattern: shift.recurrencePattern || 'Weekly',
          recurrenceEndDate: shift.recurrenceEndDate ? format(new Date(shift.recurrenceEndDate), 'yyyy-MM-dd') : '',
        })
      } else {
        setFormData(prev => ({
          ...prev,
          workerId: selectedWorkerId || '',
          participantId: selectedParticipantId || '',
          shiftDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        }))
      }
    }
  }, [open, shift, selectedDate, selectedWorkerId, selectedParticipantId])

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...formData.tasks]
    newTasks[index] = value
    setFormData({ ...formData, tasks: newTasks })
  }

  const addTask = () => {
    setFormData({ ...formData, tasks: [...formData.tasks, ''] })
  }

  const handleSave = async (publish: boolean) => {
    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.shiftDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.shiftDate}T${formData.endTime}`)

      const payload = {
        ...formData,
        regionId: selectedRegionId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        shiftDate: new Date(formData.shiftDate).toISOString(),
        status: publish ? 'Published' : (isEdit ? formData.status : 'Unpublished'),
        tasks: formData.tasks.filter(t => t.trim() !== ''),
        recurrenceEndDate: formData.recurring && formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate).toISOString() : undefined,
      }

      if (isEdit) {
        await updateShift.mutateAsync({ id: shift.id, data: payload as any })
      } else {
        await createShift.mutateAsync(payload as any)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save shift', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left Side: Core Shift Details */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">Shift Details</h3>
            
            <div className="space-y-2">
              <Label>Worker</Label>
              <Select value={formData.workerId} onValueChange={(v) => setFormData({...formData, workerId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.firstName} {w.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Participant</Label>
              <Select value={formData.participantId} onValueChange={(v) => setFormData({...formData, participantId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 space-y-2">
                <Label>Shift Date</Label>
                <Input type="date" value={formData.shiftDate} onChange={(e) => setFormData({...formData, shiftDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Category</Label>
              <Input placeholder="e.g. Standard Support" value={formData.serviceCategory} onChange={(e) => setFormData({...formData, serviceCategory: e.target.value})} />
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm font-medium">Ratio (Worker : Participants)</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {formData.ratioWorkerCount} : {formData.ratioParticipantCount}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tasks & Notes</Label>
              {formData.tasks.map((task, idx) => (
                <Textarea 
                  key={idx}
                  placeholder="Add your tasks here..."
                  value={task}
                  onChange={(e) => handleTaskChange(idx, e.target.value)}
                  className="mb-2"
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTask}>
                + Add More Tasks
              </Button>
            </div>
          </div>

          {/* Right Side: Quick Settings & Recurrence */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold border-b pb-2 mb-4">Quick Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Worker Tracking</Label>
                  <Switch checked={formData.workerTrackingEnabled} onCheckedChange={(v) => setFormData({...formData, workerTrackingEnabled: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Group Shift</Label>
                  <Switch checked={formData.isGroupShift} onCheckedChange={(v) => setFormData({...formData, isGroupShift: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Open Shift</Label>
                  <Switch checked={formData.isOpenShift} onCheckedChange={(v) => setFormData({...formData, isOpenShift: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Participant's Signature</Label>
                  <Switch checked={formData.requireParticipantSignature} onCheckedChange={(v) => setFormData({...formData, requireParticipantSignature: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enforce Distance Restriction</Label>
                  <Switch checked={formData.enforceDistanceRestriction} onCheckedChange={(v) => setFormData({...formData, enforceDistanceRestriction: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow Shift Overlapping</Label>
                  <Switch checked={formData.allowShiftOverlapping} onCheckedChange={(v) => setFormData({...formData, allowShiftOverlapping: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sleepover Shift</Label>
                  <Switch checked={formData.isSleepoverShift} onCheckedChange={(v) => setFormData({...formData, isSleepoverShift: v})} />
                </div>
              </div>
            </div>

            {!isEdit && (
              <div>
                <h3 className="font-semibold border-b pb-2 mb-4">Recurrence</h3>
                <div className="flex items-center justify-between mb-4">
                  <Label>Recurring Shift</Label>
                  <Switch checked={formData.recurring} onCheckedChange={(v) => setFormData({...formData, recurring: v})} />
                </div>

                {formData.recurring && (
                  <div className="space-y-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-2">
                      <Label>Recurrence Pattern</Label>
                      <Select value={formData.recurrencePattern} onValueChange={(v) => setFormData({...formData, recurrencePattern: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recurrence End Date</Label>
                      <Input type="date" value={formData.recurrenceEndDate} onChange={(e) => setFormData({...formData, recurrenceEndDate: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={createShift.isPending || updateShift.isPending}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={createShift.isPending || updateShift.isPending}>
            {isEdit ? 'Update And Publish' : 'Create And Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
