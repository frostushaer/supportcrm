import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormTemplateInput } from '@/lib/validations/forms-home-mgt';

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  status: string;
  kind: string;
  regionId: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  region?: {
    id: string;
    name: string;
  } | null;
  sections?: FormSection[];
}

export interface FormSection {
  id: string;
  formTemplateId: string;
  title: string;
  order: number;
  subSections?: FormSubSection[];
  fields?: FormField[];
}

export interface FormSubSection {
  id: string;
  formSectionId: string;
  title: string;
  order: number;
  addOther: boolean;
  fields?: FormField[];
}

export interface FormField {
  id: string;
  formSectionId: string | null;
  formSubSectionId: string | null;
  label: string;
  type: string;
  required: boolean;
  fullWidth: boolean;
  addedInSupportPlan: boolean;
  dependentOnFieldId: string | null;
  hint: string | null;
  legalReference: string | null;
  order: number;
}

export function useHomeForms(regionId?: string, status?: string, search?: string) {
  return useQuery<{ data: FormTemplate[] }>({
    queryKey: ['home-forms', regionId, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (regionId) params.append('regionId', regionId);
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/home-forms?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch home forms');
      return res.json();
    },
  });
}

export function useHomeForm(id: string) {
  return useQuery<{ data: FormTemplate }>({
    queryKey: ['home-forms', id],
    queryFn: async () => {
      const res = await fetch(`/api/home-forms/${id}`);
      if (!res.ok) throw new Error('Failed to fetch home form');
      return res.json();
    },
    enabled: !!id && id !== 'new',
  });
}

export function useCreateHomeForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormTemplateInput) => {
      const res = await fetch('/api/home-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create home form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-forms'] });
    },
  });
}

export function useUpdateHomeForm(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormTemplateInput) => {
      const res = await fetch(`/api/home-forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update home form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-forms'] });
      queryClient.invalidateQueries({ queryKey: ['home-forms', id] });
    },
  });
}

export function useDeleteHomeForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/home-forms/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete home form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-forms'] });
    },
  });
}
