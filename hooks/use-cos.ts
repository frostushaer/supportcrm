/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/store/region-store';
import { toast } from 'sonner';

// Participants
export function useCosParticipants(filters?: { managementStyle?: string; activeStatus?: string; search?: string }) {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-participants', selectedRegionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      if (filters?.managementStyle) params.append('managementStyle', filters.managementStyle);
      if (filters?.activeStatus) params.append('activeStatus', filters.activeStatus);
      if (filters?.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/cos/participants?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch participants');
      return res.json();
    },
  });
}

// Catalogue Services
export function useCosCatalogue(filters?: { category?: string; priceCatalogueLabel?: string; search?: string }) {
  return useQuery({
    queryKey: ['cos-catalogue', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.priceCatalogueLabel) params.append('priceCatalogueLabel', filters.priceCatalogueLabel);
      if (filters?.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/cos/catalogue-services?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch catalogue');
      return res.json();
    },
  });
}

// Service Providers
export function useServiceProviders(filters?: { search?: string }) {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-service-providers', selectedRegionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      if (filters?.search) params.append('search', filters.search);
      
      const res = await fetch(`/api/cos/service-providers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch service providers');
      return res.json();
    },
  });
}

export function useCreateServiceProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/cos/service-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create service provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-service-providers'] });
      toast.success('Service provider created successfully');
    },
    onError: () => {
      toast.error('Failed to create service provider');
    }
  });
}

export function useUpdateServiceProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/cos/service-providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update service provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-service-providers'] });
      toast.success('Service provider updated successfully');
    },
    onError: () => {
      toast.error('Failed to update service provider');
    }
  });
}

export function useDeleteServiceProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cos/service-providers/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete service provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-service-providers'] });
      toast.success('Service provider deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete service provider');
    }
  });
}

// Case Notes
export function useCaseNotes(filters?: { participantId?: string; noteContactType?: string; deliveredFrom?: string; deliveredTo?: string }) {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-case-notes', selectedRegionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      if (filters?.participantId) params.append('participantId', filters.participantId);
      if (filters?.noteContactType) params.append('noteContactType', filters.noteContactType);
      if (filters?.deliveredFrom) params.append('deliveredFrom', filters.deliveredFrom);
      if (filters?.deliveredTo) params.append('deliveredTo', filters.deliveredTo);
      
      const res = await fetch(`/api/cos/case-notes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch case notes');
      return res.json();
    },
  });
}

export function useCreateCaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/cos/case-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create case note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-case-notes'] });
      toast.success('Case note created successfully');
    },
    onError: () => {
      toast.error('Failed to create case note');
    }
  });
}

// NDIS Claims
export function useNdisClaims(filters?: { claimType?: string }) {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-ndis-claims', selectedRegionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      if (filters?.claimType) params.append('claimType', filters.claimType);
      
      const res = await fetch(`/api/cos/ndis-claims?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch NDIS claims');
      return res.json();
    },
  });
}

export function useCreateNdisClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/cos/ndis-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create NDIS claim');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-ndis-claims'] });
      queryClient.invalidateQueries({ queryKey: ['cos-case-notes'] });
      toast.success('NDIS claim created successfully');
    },
    onError: () => {
      toast.error('Failed to create NDIS claim');
    }
  });
}

export function useUpdateNdisClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/cos/ndis-claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update NDIS claim');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-ndis-claims'] });
      toast.success('NDIS claim updated successfully');
    },
    onError: () => {
      toast.error('Failed to update NDIS claim');
    }
  });
}

// Invoices
export function useCosInvoices(filters?: { invoiceType?: string; participantId?: string }) {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-invoices', selectedRegionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      if (filters?.invoiceType) params.append('invoiceType', filters.invoiceType);
      if (filters?.participantId) params.append('participantId', filters.participantId);
      
      const res = await fetch(`/api/cos/invoices?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch COS invoices');
      return res.json();
    },
  });
}

export function useCreateCosInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/cos/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['cos-case-notes'] });
      toast.success('Invoice created successfully');
    },
    onError: () => {
      toast.error('Failed to create invoice');
    }
  });
}

export function useUpdateCosInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/cos/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update invoice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cos-invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: () => {
      toast.error('Failed to update invoice');
    }
  });
}

// Reporting / Funding
export function useCosFundingReport(filters?: { participantId?: string; coordinatorId?: string }) {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-funding-report', selectedRegionId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      if (filters?.participantId) params.append('participantId', filters.participantId);
      if (filters?.coordinatorId) params.append('coordinatorId', filters.coordinatorId);
      
      const res = await fetch(`/api/cos/funding?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch funding report');
      return res.json();
    },
  });
}

export function useCosDashboardSummary() {
  const { selectedRegionId } = useRegionStore();
  
  return useQuery({
    queryKey: ['cos-dashboard-summary', selectedRegionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.append('regionId', selectedRegionId);
      
      const res = await fetch(`/api/cos/dashboard-summary?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard summary');
      return res.json();
    },
  });
}
