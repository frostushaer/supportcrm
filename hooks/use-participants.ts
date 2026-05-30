'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/store/region-store';
import type { ParticipantFormData } from '@/lib/validations/participants';

export function useParticipants(status?: string, search?: string) {
  const { selectedRegionId } = useRegionStore();

  return useQuery({
    queryKey: ['participants', selectedRegionId, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.set('regionId', selectedRegionId);
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/participants?${params}`);
      if (!res.ok) throw new Error('Failed to fetch participants');

      const json = await res.json();
      return json.data;
    },
  });
}

export function useParticipant(id: string) {
  return useQuery({
    queryKey: ['participants', id],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${id}`);
      if (!res.ok) throw new Error('Failed to fetch participant');

      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ParticipantFormData) => {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create participant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}

export function useUpdateParticipant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ParticipantFormData>) => {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update participant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/participants/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete participant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}

export function useCaseNotes(participantId: string) {
  return useQuery({
    queryKey: ['caseNotes', participantId],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${participantId}/case-notes`);
      if (!res.ok) throw new Error('Failed to fetch case notes');
      return (await res.json()).data;
    },
    enabled: !!participantId,
  });
}

export function useCreateCaseNote(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/case-notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create case note');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caseNotes', participantId] }),
  });
}

export function useUpdateCaseNote(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/case-notes`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update case note');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caseNotes', participantId] }),
  });
}

export function useDeleteCaseNote(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/participants/${participantId}/case-notes`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noteId }),
      });
      if (!res.ok) throw new Error('Failed to delete case note');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caseNotes', participantId] }),
  });
}

export function useTasks(participantId: string) {
  return useQuery({
    queryKey: ['tasks', participantId],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${participantId}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return (await res.json()).data;
    },
    enabled: !!participantId,
  });
}

export function useCreateTask(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', participantId] }),
  });
}

export function useGoals(participantId: string) {
  return useQuery({
    queryKey: ['goals', participantId],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${participantId}/goals`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      return (await res.json()).data;
    },
    enabled: !!participantId,
  });
}

export function useCreateGoal(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/goals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', participantId] }),
  });
}

export function useUpdateGoal(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/goals`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update goal');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', participantId] }),
  });
}

export function useDeleteGoal(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/participants/${participantId}/goals`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goalId }),
      });
      if (!res.ok) throw new Error('Failed to delete goal');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', participantId] }),
  });
}

export function useMedications(participantId: string) {
  return useQuery({
    queryKey: ['medications', participantId],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${participantId}/medications`);
      if (!res.ok) throw new Error('Failed to fetch medications');
      return (await res.json()).data;
    },
    enabled: !!participantId,
  });
}

export function useCreateMedication(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/medications`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create medication');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications', participantId] }),
  });
}

export function useUpdateMedication(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ medicationId, ...data }: { medicationId: string } & Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/medications/${medicationId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update medication');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications', participantId] }),
  });
}

export function useDeleteMedication(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (medicationId: string) => {
      const res = await fetch(`/api/participants/${participantId}/medications/${medicationId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete medication');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications', participantId] }),
  });
}

export function useAppointments(participantId: string) {
  return useQuery({
    queryKey: ['appointments', participantId],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${participantId}/appointments`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return (await res.json()).data;
    },
    enabled: !!participantId,
  });
}

export function useCreateAppointment(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/appointments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create appointment');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments', participantId] }),
  });
}

export function useInitialAssessment(participantId: string) {
  return useQuery({
    queryKey: ['initial-assessment', participantId],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${participantId}/initial-assessment`);
      if (!res.ok) throw new Error('Failed to fetch initial assessment');
      return res.json();
    },
    enabled: !!participantId,
  });
}

export function useSaveInitialAssessment(participantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/participants/${participantId}/initial-assessment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save initial assessment');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['initial-assessment', participantId] });
      qc.invalidateQueries({ queryKey: ['participant', participantId] });
    },
  });
}
