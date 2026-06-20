/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { useInvoices } from "@/hooks/use-invoicing";
import { useRegionStore } from "@/store/region-store";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function InvoicesListPage() {
  const { selectedRegionId } = useRegionStore();
  const { data: invoices, isLoading } = useInvoices({ regionId: selectedRegionId });

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
    },
    {
      key: "date",
      label: "Date",
      render: (item: any) => format(new Date(item.createdAt), "dd MMM yyyy"),
    },
    {
      key: "participant",
      label: "Participant",
      render: (item: any) => `${item.participant.firstName} ${item.participant.lastName}`,
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (item: any) => `$${item.totalAmount.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => (
        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item: any) => (
        <Link href={`/invoicing/invoices/${item.id}`}>
          <Button variant="ghost" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader 
        title="Invoices" 
        description="View and manage generated invoices."
      />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        <DataTable
          columns={columns}
          data={invoices || []}
          searchKey="participantName"
          searchPlaceholder="Search participants..."
        />
      </div>
    </div>
  );
}
