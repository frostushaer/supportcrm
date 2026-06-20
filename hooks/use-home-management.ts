import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { HomeCreateInput, HomeUpdateInput, HomeFilters } from '@/lib/validations/home-management'

export function useHomes(filters: HomeFilters) {
  return useQuery({
    queryKey: ['homes', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.regionId && filters.regionId !== 'all') params.append('regionId', filters.regionId)
      if (filters.status && filters.status !== 'All') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const res = await fetch(`/api/home-management/homes?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch homes')
      return res.json()
    },
    enabled: !!filters.regionId,
  })
}

export function useHome(id: string) {
  return useQuery({
    queryKey: ['home', id],
    queryFn: async () => {
      const res = await fetch(`/api/home-management/homes/${id}`)
      if (!res.ok) throw new Error('Failed to fetch home')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateHome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: HomeCreateInput) => {
      const res = await fetch('/api/home-management/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create home')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] })
    },
  })
}

export function useUpdateHome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HomeUpdateInput }) => {
      const res = await fetch(`/api/home-management/homes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update home')
      }
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['homes'] })
      queryClient.invalidateQueries({ queryKey: ['home', id] })
    },
  })
}

export function useDeleteHome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/home-management/homes/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete home')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] })
    },
  })
}
