/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useApplicants(search: string, status: string, regionId?: string) {
  return useQuery({
    queryKey: ['applicants', search, status, regionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'All') params.append('status', status);
      if (regionId && regionId !== 'all') params.append('regionId', regionId);
      
      const res = await fetch(`/api/hrm/applicants?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch applicants');
      return res.json();
    },
  });
}

export function useApplicant(id: string) {
  return useQuery({
    queryKey: ['applicant', id],
    queryFn: async () => {
      const res = await fetch(`/api/hrm/applicants/${id}`);
      if (!res.ok) throw new Error('Failed to fetch applicant');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/hrm/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create applicant');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicants'] }),
  });
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/hrm/applicants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update applicant');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      queryClient.invalidateQueries({ queryKey: ['applicant', id] });
    },
  });
}

export function useAssessApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/hrm/applicants/${id}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit assessment');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      queryClient.invalidateQueries({ queryKey: ['applicant', id] });
      queryClient.invalidateQueries({ queryKey: ['workers'] }); // Could have created a new worker
    },
  });
}

export function useWorkers(search: string, status: string, regionId?: string) {
  return useQuery({
    queryKey: ['workers', search, status, regionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'All') params.append('status', status);
      if (regionId && regionId !== 'all') params.append('regionId', regionId);
      
      const res = await fetch(`/api/workers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch workers');
      return res.json();
    },
  });
}

export function useWorker(id: string) {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: async () => {
      const res = await fetch(`/api/workers/${id}`);
      if (!res.ok) throw new Error('Failed to fetch worker');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/workers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update worker');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['worker', id] });
    },
  });
}

export function useWorkerLeaves(workerId: string) {
  return useQuery({
    queryKey: ['worker-leaves', workerId],
    queryFn: async () => {
      const res = await fetch(`/api/hrm/workers/${workerId}/leaves`);
      if (!res.ok) throw new Error('Failed to fetch leaves');
      return res.json();
    },
    enabled: !!workerId,
  });
}

export function useCreateWorkerLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workerId, data }: { workerId: string; data: any }) => {
      const res = await fetch(`/api/hrm/workers/${workerId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create leave');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-leaves', workerId] }),
  });
}

export function useUpdateWorkerLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, workerId }: { id: string; data: any; workerId: string }) => {
      const res = await fetch(`/api/hrm/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update leave');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-leaves', workerId] }),
  });
}

export function useDeleteWorkerLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; workerId: string }) => {
      const res = await fetch(`/api/hrm/leaves/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete leave');
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-leaves', workerId] }),
  });
}

export function useWorkerAvailability(workerId: string) {
  return useQuery({
    queryKey: ['worker-availability', workerId],
    queryFn: async () => {
      const res = await fetch(`/api/hrm/workers/${workerId}/availability`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    },
    enabled: !!workerId,
  });
}

export function useCreateWorkerAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workerId, data }: { workerId: string; data: any }) => {
      const res = await fetch(`/api/hrm/workers/${workerId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create availability');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-availability', workerId] }),
  });
}

export function useDeleteWorkerAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; workerId: string }) => {
      const res = await fetch(`/api/hrm/availability/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete availability');
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-availability', workerId] }),
  });
}

export function useWorkerDocuments(workerId: string) {
  return useQuery({
    queryKey: ['worker-documents', workerId],
    queryFn: async () => {
      const res = await fetch(`/api/hrm/workers/${workerId}/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: !!workerId,
  });
}

export function useCreateWorkerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workerId, data }: { workerId: string; data: any }) => {
      const res = await fetch(`/api/hrm/workers/${workerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to upload document');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-documents', workerId] }),
  });
}

export function useWorkerFolders(workerId: string) {
  return useQuery({
    queryKey: ['worker-folders', workerId],
    queryFn: async () => {
      const res = await fetch(`/api/hrm/workers/${workerId}/folders`);
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    enabled: !!workerId,
  });
}

export function useCreateWorkerFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workerId, data }: { workerId: string; data: any }) => {
      const res = await fetch(`/api/hrm/workers/${workerId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create folder');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-folders', workerId] }),
  });
}

export function useWorkerTraining(workerId: string) {
  return useQuery({
    queryKey: ['worker-training', workerId],
    queryFn: async () => {
      const res = await fetch(`/api/hrm/workers/${workerId}/training`);
      if (!res.ok) throw new Error('Failed to fetch training records');
      return res.json();
    },
    enabled: !!workerId,
  });
}

export function useCreateWorkerTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workerId, data }: { workerId: string; data: any }) => {
      const res = await fetch(`/api/hrm/workers/${workerId}/training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create training record');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-training', workerId] }),
  });
}

export function useUpdateWorkerTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, workerId }: { id: string; data: any; workerId: string }) => {
      const res = await fetch(`/api/hrm/training/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update training record');
      return res.json();
    },
    onSuccess: (_, { workerId }) => queryClient.invalidateQueries({ queryKey: ['worker-training', workerId] }),
  });
}

export function usePortalUsers(regionId?: string, status?: string) {
  return useQuery({
    queryKey: ['portal-users', regionId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (regionId && regionId !== 'all') params.append('regionId', regionId);
      if (status && status !== 'All') params.append('status', status);
      
      const res = await fetch(`/api/hrm/primary-portal-users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch portal users');
      return res.json();
    },
  });
}

export function useCreatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/hrm/primary-portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create portal user');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-users'] }),
  });
}

export function useUpdatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/hrm/primary-portal-users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update portal user');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-users'] }),
  });
}
