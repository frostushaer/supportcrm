/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { useReadyForInvoiceTimesheets, useGenerateInvoices } from "@/hooks/use-invoicing";
import { useRegionStore } from "@/store/region-store";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GenerateInvoicesPage() {
  const router = useRouter();
  const { selectedRegionId } = useRegionStore();
  const { data: timesheets, isLoading } = useReadyForInvoiceTimesheets(selectedRegionId);
  const { mutate: generateInvoices, isPending } = useGenerateInvoices();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleGenerate = () => {
    if (!timesheets) return;

    if (selectedIds.length === 0) {
      toast.error("Please select at least one timesheet to invoice.");
      return;
    }

    generateInvoices({
      timesheetIds: selectedIds,
      createdById: "current-user-id", // In a real app, from auth session
      createdByName: "Current User",
    }, {
      onSuccess: () => {
        toast.success("Invoices generated successfully!");
        setSelectedIds([]);
        router.push("/invoicing/invoices");
      },
      onError: () => {
        toast.error("Failed to generate invoices.");
      }
    });
  };

  const columns = [
    {
      key: "select",
      label: "",
      render: (item: any) => (
        <Checkbox
          checked={selectedIds.includes(item.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedIds([...selectedIds, item.id]);
            } else {
              setSelectedIds(selectedIds.filter((id) => id !== item.id));
            }
          }}
        />
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (item: any) => format(new Date(item.shift.startDateTime), "dd MMM yyyy"),
    },
    {
      key: "participant",
      label: "Participant",
      render: (item: any) => `${item.shift.participant.firstName} ${item.shift.participant.lastName}`,
    },
    {
      key: "worker",
      label: "Worker",
      render: (item: any) => `${item.shift.worker.firstName} ${item.shift.worker.lastName}`,
    },
    {
      key: "totalHours",
      label: "Hours",
    },
    {
      key: "supportItemCode",
      label: "Code",
    },
    {
      key: "totalAmount",
      label: "Total ($)",
      render: (item: any) => item.totalAmount ? `$${item.totalAmount.toFixed(2)}` : "-",
    },
    {
      key: "fundingSource",
      label: "Funding",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Generate Invoices" 
          description="Select allocated timesheets to generate invoices for participants."
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isPending || selectedIds.length === 0}
          className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
        >
          {isPending ? "Generating..." : "Generate Selected Invoices"}
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        <DataTable
          columns={columns}
          data={timesheets || []}
          searchKey="shift.participant.firstName"
          searchPlaceholder="Search participants..."
        />
      </div>
    </div>
  );
}
