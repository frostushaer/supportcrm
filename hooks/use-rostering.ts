import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ShiftInput } from '@/lib/validations/rostering'

export function useShifts(filters: {
  regionId?: string
  workerId?: string
  participantId?: string
  fromDate?: string
  toDate?: string
}) {
  return useQuery({
    queryKey: ['shifts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.regionId && filters.regionId !== 'all') params.append('regionId', filters.regionId)
      if (filters.workerId) params.append('workerId', filters.workerId)
      if (filters.participantId) params.append('participantId', filters.participantId)
      if (filters.fromDate) params.append('fromDate', filters.fromDate)
      if (filters.toDate) params.append('toDate', filters.toDate)

      const res = await fetch(`/api/rostering/shifts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch shifts')
      return res.json()
    },
    enabled: !!filters.regionId,
  })
}

export function useShift(id: string) {
  return useQuery({
    queryKey: ['shift', id],
    queryFn: async () => {
      const res = await fetch(`/api/rostering/shifts/${id}`)
      if (!res.ok) throw new Error('Failed to fetch shift')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ShiftInput) => {
      const res = await fetch('/api/rostering/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create shift')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}

export function useUpdateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShiftInput> }) => {
      const res = await fetch(`/api/rostering/shifts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update shift')
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['shift', id] })
    },
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rostering/shifts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete shift')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}

// Since timesheets and leave requests will likely use their own APIs, we create generic hooks here.
export function useRosteringLeaveRequests(filters: { regionId?: string }) {
  return useQuery({
    queryKey: ['rostering-leave-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.regionId && filters.regionId !== 'all') params.append('regionId', filters.regionId)

      const res = await fetch(`/api/rostering/leave-requests?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch leave requests')
      return res.json()
    },
    enabled: !!filters.regionId,
  })
}

export function useRosteringTimesheets(filters: { regionId?: string }) {
  return useQuery({
    queryKey: ['rostering-timesheets', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.regionId && filters.regionId !== 'all') params.append('regionId', filters.regionId)

      const res = await fetch(`/api/timesheets?${params.toString()}`)
      // If it doesn't exist, we just return empty array
      if (!res.ok) {
        if (res.status === 404) return []
        throw new Error('Failed to fetch timesheets')
      }
      return res.json()
    },
    enabled: !!filters.regionId,
  })
}
