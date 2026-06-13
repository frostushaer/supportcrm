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

export function useHrmForms(regionId?: string, status?: string, search?: string) {
  return useQuery<{ data: FormTemplate[] }>({
    queryKey: ['hrm-forms', regionId, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (regionId) params.append('regionId', regionId);
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/hrm-forms?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch hrm forms');
      return res.json();
    },
  });
}

export function useHrmForm(id: string) {
  return useQuery<{ data: FormTemplate }>({
    queryKey: ['hrm-forms', id],
    queryFn: async () => {
      const res = await fetch(`/api/hrm-forms/${id}`);
      if (!res.ok) throw new Error('Failed to fetch hrm form');
      return res.json();
    },
    enabled: !!id && id !== 'new',
  });
}

export function useCreateHrmForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormTemplateInput) => {
      const res = await fetch('/api/hrm-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create hrm form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm-forms'] });
    },
  });
}

export function useUpdateHrmForm(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormTemplateInput) => {
      const res = await fetch(`/api/hrm-forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update hrm form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm-forms'] });
      queryClient.invalidateQueries({ queryKey: ['hrm-forms', id] });
    },
  });
}

export function useDeleteHrmForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hrm-forms/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete hrm form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrm-forms'] });
    },
  });
}
