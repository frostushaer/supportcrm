"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ReportTile } from "@/components/reporting/report-tile";
import { FileDown, FileText, CheckSquare } from "lucide-react";

export default function InvoicingDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader 
        title="Invoicing Dashboard" 
        description="Manage timesheet allocations, generate invoices, and view existing invoices."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportTile
          title="Code Allocation"
          href="/invoicing/allocation"
          icon={CheckSquare}
          accentColor="#3b82f6" // blue-500
        />
        <ReportTile
          title="Generate Invoices"
          href="/invoicing/create"
          icon={FileDown}
          accentColor="#a855f7" // purple-500
        />
        <ReportTile
          title="View Invoices"
          href="/invoicing/invoices"
          icon={FileText}
          accentColor="#10b981" // emerald-500
        />
      </div>
    </div>
  );
}
