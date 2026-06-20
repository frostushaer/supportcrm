import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface IncidentFilters {
  regionId?: string;
  status?: string;
  outcomeType?: string;
  participantId?: string;
  workerId?: string;
  search?: string;
}

export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.regionId) params.append("regionId", filters.regionId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.outcomeType) params.append("outcomeType", filters.outcomeType);
      if (filters?.participantId) params.append("participantId", filters.participantId);
      if (filters?.workerId) params.append("workerId", filters.workerId);
      if (filters?.search) params.append("search", filters.search);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch incidents");
      return res.json();
    },
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch incident");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create incident");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useUpdateIncident(id?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!id) throw new Error("ID is required to update");
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update incident");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["incident", id] });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete incident");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useIncidentInvestigation(id: string) {
  return useQuery({
    queryKey: ["incident-investigation", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/incidents/${id}/investigation`);
      if (res.status === 404) return null; // No investigation yet
      if (!res.ok) throw new Error("Failed to fetch investigation");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useSaveIncidentInvestigation(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/incidents/${id}/investigation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update investigation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-investigation", id] });
      queryClient.invalidateQueries({ queryKey: ["incident", id] }); // Because status might change
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useIncidentReview(id: string) {
  return useQuery({
    queryKey: ["incident-review", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/incidents/${id}/review`);
      if (res.status === 404) return null; // No review yet
      if (!res.ok) throw new Error("Failed to fetch review");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useSaveIncidentReview(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/incidents/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-review", id] });
      queryClient.invalidateQueries({ queryKey: ["incident", id] }); // Because status might change
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}
