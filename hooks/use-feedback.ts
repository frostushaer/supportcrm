'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/store/region-store';
import type { FeedbackFormData } from '@/lib/validations/feedback';

export function useFeedbacks(search?: string, status?: string) {
  const { selectedRegionId } = useRegionStore();

  return useQuery({
    queryKey: ['feedback', selectedRegionId, search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.set('regionId', selectedRegionId);
      if (search) params.set('search', search);
      if (status && status !== 'All') params.set('status', status);

      const res = await fetch(`/api/feedback?${params}`);
      if (!res.ok) throw new Error('Failed to fetch feedback');

      const json = await res.json();
      return json.data;
    },
  });
}

export function useFeedback(id: string) {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: async () => {
      const res = await fetch(`/api/feedback/${id}`);
      if (!res.ok) throw new Error('Failed to fetch feedback');

      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create feedback');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useUpdateFeedback(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<FeedbackFormData>) => {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update feedback');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
    },
  });
}

export function useDeleteFeedback(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete feedback');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
