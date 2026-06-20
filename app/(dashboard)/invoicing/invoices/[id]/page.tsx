"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { useInvoice, useDeleteInvoice } from "@/hooks/use-invoicing";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: invoice, isLoading } = useInvoice(id);
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invoice? Timesheets will be returned to 'Allocated' status.")) {
      deleteInvoice(id, {
        onSuccess: () => {
          toast.success("Invoice deleted successfully");
          router.push("/invoicing/invoices");
        },
        onError: () => {
          toast.error("Failed to delete invoice");
        }
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/invoicing/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader 
          title={`Invoice ${invoice.invoiceNumber}`} 
          description={`Participant: ${invoice.participantName} | Status: ${invoice.status}`}
        />
        <div className="ml-auto">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Invoice Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-light)]">Created Date:</span>
              <span className="font-medium">{format(new Date(invoice.createdDate), "dd MMM yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-light)]">Service Period:</span>
              <span className="font-medium">
                {format(new Date(invoice.serviceDeliveredFrom), "dd MMM yyyy")} - {format(new Date(invoice.serviceDeliveredTo), "dd MMM yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-light)]">Created By:</span>
              <span className="font-medium">{invoice.createdByName}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-light)]">Items Delivered:</span>
              <span className="font-medium">{invoice.numDelivered}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-light)] font-semibold text-base">Total Value:</span>
              <span className="font-bold text-base text-[var(--color-primary)]">
                ${invoice.totalValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Line Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Support Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead className="text-right">Total ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.invoiceLines?.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{format(new Date(line.deliveredDate), "dd MMM yyyy")}</TableCell>
                <TableCell>{line.workerName}</TableCell>
                <TableCell>{line.supportItemCode}</TableCell>
                <TableCell>{line.quantity}</TableCell>
                <TableCell>${line.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${line.totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
