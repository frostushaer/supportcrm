/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { useAllocationTimesheets, useUpdateAllocation } from "@/hooks/use-invoicing";
import { useRegionStore } from "@/store/region-store";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CodeAllocationPage() {
  const { selectedRegionId } = useRegionStore();
  const { data: timesheets, isLoading } = useAllocationTimesheets(selectedRegionId);
  const { mutate: updateAllocation } = useUpdateAllocation();

  const [selectedTimesheet, setSelectedTimesheet] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    supportItemCode: "",
    quantity: "",
    unitPrice: "",
    fundingSource: "",
  });

  const handleEdit = (timesheet: any) => {
    setSelectedTimesheet(timesheet);
    setFormData({
      supportItemCode: timesheet.supportItemCode || "",
      quantity: timesheet.quantity?.toString() || timesheet.totalHours.toString(),
      unitPrice: timesheet.unitPrice?.toString() || "",
      fundingSource: timesheet.fundingSource || "",
    });
  };

  const handleSave = () => {
    if (!selectedTimesheet) return;

    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.unitPrice);
    const totalAmount = qty * price;

    updateAllocation({
      id: selectedTimesheet.id,
      data: {
        supportItemCode: formData.supportItemCode,
        quantity: qty,
        unitPrice: price,
        totalAmount,
        fundingSource: formData.fundingSource,
      },
    }, {
      onSuccess: () => {
        setSelectedTimesheet(null);
      }
    });
  };

  const columns = [
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
      render: (item: any) => item.supportItemCode || "-",
    },
    {
      key: "totalAmount",
      label: "Total ($)",
      render: (item: any) => item.totalAmount ? `$${item.totalAmount.toFixed(2)}` : "-",
    },
    {
      key: "billingStatus",
      label: "Status",
      render: (item: any) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          item.billingStatus === "Allocated" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {item.billingStatus}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item: any) => (
        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader 
        title="Code Allocation" 
        description="Assign NDIS support item codes, quantities, and rates to approved timesheets."
      />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        <DataTable
          columns={columns}
          data={timesheets || []}
          searchKey="shift.participant.firstName"
          searchPlaceholder="Search participants..."
        />
      </div>

      <Sheet open={!!selectedTimesheet} onOpenChange={(open) => !open && setSelectedTimesheet(null)}>
        <SheetContent className="w-[400px] sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Allocate Codes</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label>Support Item Code</Label>
              <Input 
                value={formData.supportItemCode} 
                onChange={(e) => setFormData({ ...formData, supportItemCode: e.target.value })}
                placeholder="e.g. 01_011_0107_1_1"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                value={formData.quantity} 
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit Price ($)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={formData.unitPrice} 
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Funding Source</Label>
              <Input 
                value={formData.fundingSource} 
                onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                placeholder="e.g. NDIS"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTimesheet(null)}>Cancel</Button>
              <Button 
                onClick={handleSave}
                className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              >
                Save Allocation
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
