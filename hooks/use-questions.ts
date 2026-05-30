'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/store/region-store';
import type { QuestionFormData } from '@/lib/validations/questions';

export function useQuestions(search?: string) {
  const { selectedRegionId } = useRegionStore();

  return useQuery({
    queryKey: ['questions', selectedRegionId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.set('regionId', selectedRegionId);
      if (search) params.set('search', search);

      const res = await fetch(`/api/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch questions');

      const json = await res.json();
      return json.data;
    },
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const res = await fetch(`/api/questions/${id}`);
      if (!res.ok) throw new Error('Failed to fetch question');

      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
