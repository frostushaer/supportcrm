'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ComplaintFormData } from '@/lib/validations/complaints';

// Types
interface Complaint {
  id: string;
  name: string;
  date: string;
  subject: string;
  details: string;
  userRole: string | null;
  submittedBy: string;
  regionId: string | null;
  createdAt: string;
  updatedAt: string;
  region?: {
    id: string;
    name: string;
    state: string;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Fetch complaints list
async function fetchComplaints(regionId?: string, search?: string): Promise<Complaint[]> {
  const params = new URLSearchParams();
  if (regionId) params.set('regionId', regionId);
  if (search) params.set('search', search);

  const response = await fetch(`/api/complaints?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch complaints');
  }
  const result: ApiResponse<Complaint[]> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch complaints');
  }
  return result.data;
}

// Fetch single complaint
async function fetchComplaint(id: string): Promise<Complaint> {
  const response = await fetch(`/api/complaints/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch complaint');
  }
  const result: ApiResponse<Complaint> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch complaint');
  }
  return result.data;
}

// Create complaint
async function createComplaint(data: ComplaintFormData): Promise<Complaint> {
  const response = await fetch('/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create complaint');
  }
  const result: ApiResponse<Complaint> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to create complaint');
  }
  return result.data;
}

// React Query Hooks
export function useComplaints(regionId?: string, search?: string) {
  return useQuery({
    queryKey: ['complaints', regionId, search],
    queryFn: () => fetchComplaints(regionId, search),
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: () => fetchComplaint(id),
    enabled: !!id,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}
