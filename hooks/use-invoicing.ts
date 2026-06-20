import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AllocationTimesheet {
  id: string;
  shiftId: string;
  actualStartTime: string;
  actualEndTime: string;
  breakMinutes: number;
  totalHours: number;
  approvedBy: string | null;
  approvedAt: string | null;
  status: string;
  supportItemCode: string | null;
  quantity: number | null;
  unitPrice: number | null;
  totalAmount: number | null;
  fundingSource: string | null;
  billingStatus: string;
  shift: {
    id: string;
    participantId: string;
    workerId: string;
    supportItem: string;
    startDateTime: string;
    endDateTime: string;
    regionId: string;
    participant: {
      id: string;
      firstName: string;
      lastName: string;
    };
    worker: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  participantId: string;
  participantName: string;
  createdById: string;
  createdByName: string | null;
  createdDate: string;
  serviceDeliveredFrom: string;
  serviceDeliveredTo: string;
  status: string;
  numDelivered: number;
  totalValue: number;
  regionId: string | null;
  notes: string | null;
  externalReference: string | null;
  createdAt: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    ndisNumber: string;
  };
  invoiceLines?: InvoiceLine[];
}

interface InvoiceLine {
  id: string;
  invoiceId: string;
  timesheetId: string | null;
  workerId: string | null;
  workerName: string | null;
  participantId: string | null;
  participantName: string | null;
  deliveredDate: string;
  typeOfService: string | null;
  supportItemCode: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  fundingSource: string | null;
}

export function useAllocationTimesheets(regionId?: string | null) {
  return useQuery<AllocationTimesheet[]>({
    queryKey: ["allocation-timesheets", regionId],
    queryFn: async () => {
      const url = new URL("/api/invoicing/allocation", window.location.origin);
      if (regionId && regionId !== "all") {
        url.searchParams.append("regionId", regionId);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch allocation timesheets");
      return res.json();
    },
  });
}

export function useUpdateAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        supportItemCode: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        fundingSource?: string;
      };
    }) => {
      const res = await fetch(`/api/invoicing/allocation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update allocation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocation-timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["ready-for-invoice-timesheets"] });
    },
  });
}

export function useReadyForInvoiceTimesheets(regionId?: string | null) {
  return useQuery<AllocationTimesheet[]>({
    queryKey: ["ready-for-invoice-timesheets", regionId],
    queryFn: async () => {
      const url = new URL("/api/invoicing/ready-for-invoice", window.location.origin);
      if (regionId && regionId !== "all") {
        url.searchParams.append("regionId", regionId);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch ready for invoice timesheets");
      return res.json();
    },
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      timesheetIds: string[];
      createdById: string;
      createdByName?: string;
    }) => {
      const res = await fetch("/api/invoicing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate invoices");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ready-for-invoice-timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["allocation-timesheets"] });
    },
  });
}

export function useInvoices(filters?: { regionId?: string | null; status?: string; search?: string }) {
  return useQuery<Invoice[]>({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const url = new URL("/api/invoices", window.location.origin);
      if (filters?.regionId && filters.regionId !== "all") {
        url.searchParams.append("regionId", filters.regionId);
      }
      if (filters?.status && filters.status !== "all") {
        url.searchParams.append("status", filters.status);
      }
      if (filters?.search) {
        url.searchParams.append("search", filters.search);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Failed to fetch invoice");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete invoice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["ready-for-invoice-timesheets"] });
    },
  });
}
