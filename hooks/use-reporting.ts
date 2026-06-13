import { useQuery } from "@tanstack/react-query";
import { useRegionStore } from "@/store/region-store";

export function useRocReport(filters: any) {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["reporting", "roc", regionId, filters],
    queryFn: async () => {
      if (!regionId) return [];
      const params = new URLSearchParams({ regionId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await fetch(`/api/reporting/roc?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch ROC report");
      return res.json();
    },
    enabled: !!regionId,
  });
}

export function useRocWeeklyReport(filters: any) {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["reporting", "roc-weekly", regionId, filters],
    queryFn: async () => {
      if (!regionId) return [];
      const params = new URLSearchParams({ regionId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await fetch(`/api/reporting/roc-weekly?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch ROC weekly report");
      return res.json();
    },
    enabled: !!regionId,
  });
}

export function useTimesheetReport(filters: any) {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["reporting", "timesheets", regionId, filters],
    queryFn: async () => {
      if (!regionId) return [];
      const params = new URLSearchParams({ regionId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await fetch(`/api/reporting/timesheets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Timesheet report");
      return res.json();
    },
    enabled: !!regionId,
  });
}

export function usePayrollReport(filters: any) {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["reporting", "payroll", regionId, filters],
    queryFn: async () => {
      if (!regionId) return [];
      const params = new URLSearchParams({ regionId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await fetch(`/api/reporting/payroll?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Payroll report");
      return res.json();
    },
    enabled: !!regionId,
  });
}

export function useFeedbackReport(filters: any) {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["reporting", "feedback", regionId, filters],
    queryFn: async () => {
      if (!regionId) return [];
      const params = new URLSearchParams({ regionId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await fetch(`/api/reporting/feedback?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Feedback report");
      return res.json();
    },
    enabled: !!regionId,
  });
}

export function useComplaintsReport(filters: any) {
  const { selectedRegionId } = useRegionStore();
  const regionId = selectedRegionId;

  return useQuery({
    queryKey: ["reporting", "complaints", regionId, filters],
    queryFn: async () => {
      if (!regionId) return [];
      const params = new URLSearchParams({ regionId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const res = await fetch(`/api/reporting/complaints?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Complaints report");
      return res.json();
    },
    enabled: !!regionId,
  });
}
