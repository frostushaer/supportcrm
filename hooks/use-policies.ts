import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Policy, Region } from '@prisma/client';
import type { PolicyFormData } from '@/lib/validations/policies';

export type PolicyWithRegion = Policy & { region?: Region | null };

export function usePolicies(search?: string, regionId?: string) {
  return useQuery({
    queryKey: ['policies', search, regionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (regionId) params.append('regionId', regionId);
      
      const res = await fetch(`/api/policies?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch policies');
      return res.json() as Promise<{ success: boolean; data: PolicyWithRegion[] }>;
    },
  });
}

export function usePolicy(id: string) {
  return useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      if (!id) throw new Error('No id provided');
      const res = await fetch(`/api/policies/${id}`);
      if (!res.ok) throw new Error('Failed to fetch policy');
      return res.json() as Promise<{ success: boolean; data: PolicyWithRegion }>;
    },
    enabled: !!id,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PolicyFormData) => {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create policy');
      return res.json() as Promise<{ success: boolean; data: Policy }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete policy');
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}
