/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/reporting/report-layout";
import { ReportFilterBar } from "@/components/reporting/report-filter-bar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { usePayrollReport } from "@/hooks/use-reporting";
import { useWorkers } from "@/hooks/use-workers";
import { format, subMonths } from "date-fns";
import { FileSpreadsheet } from "lucide-react";

export default function PayrollReportsPage() {
  const [filters, setFilters] = useState({
    workerId: "",
    employeeType: "",
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const [activeFilters, setActiveFilters] = useState({ ...filters });

  const { data: reportData, isLoading } = usePayrollReport(activeFilters);
  const { data: workers } = useWorkers();

  const handleSearch = () => {
    setActiveFilters({ ...filters });
  };

  const handleClear = () => {
    const reset = {
      workerId: "",
      employeeType: "",
      startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    };
    setFilters(reset);
    setActiveFilters(reset);
  };

  const handleExport = () => {
    if (!reportData || reportData.length === 0) return;
    
    const headers = [
      "Name", "Total Hours", "Day", "Evening", "Night", "Saturday", 
      "Sunday", "Public Holiday", "Sleepover", "OT 1.5x", "OT 2x", 
      "Wkly OT 1.5x", "Wkly OT 2x", "KM's"
    ];
    
    const rows = reportData.map((row: any) => {
      return [
        `"${row.workerName}"`,
        row.totalHours,
        row.day,
        row.evening,
        row.night,
        row.saturday,
        row.sunday,
        row.publicHoliday,
        row.sleepover,
        row.ot1_5,
        row.ot2_0,
        row.wklyOt1_5,
        row.wklyOt2_0,
        row.kms
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { label: "Name", key: "workerName" },
    { label: "Total Hours", key: "totalHours" },
    { label: "Day", key: "day" },
    { label: "Evening", key: "evening" },
    { label: "Night", key: "night" },
    { label: "Saturday", key: "saturday" },
    { label: "Sunday", key: "sunday" },
    { label: "Public Holiday", key: "publicHoliday" },
    { label: "Sleepover", key: "sleepover" },
    { label: "OT 1.5x", key: "ot1_5" },
    { label: "OT 2x", key: "ot2_0" },
    { label: "Wkly OT 1.5x", key: "wklyOt1_5" },
    { label: "Wkly OT 2x", key: "wklyOt2_0" },
    { label: "KM's", key: "kms" }
  ];

  return (
    <ReportLayout
      title="Payroll Report"
      filters={
        <ReportFilterBar onSearch={handleSearch} onClear={handleClear} onExport={handleExport}>
          <select
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={filters.employeeType}
            onChange={(e) => setFilters({ ...filters, employeeType: e.target.value })}
          >
            <option value="">All Employee Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Casual">Casual</option>
          </select>

          <select
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={filters.workerId}
            onChange={(e) => setFilters({ ...filters, workerId: e.target.value })}
          >
            <option value="">All Support Workers</option>
            {workers?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <span className="text-[var(--color-text-light)]">to</span>
            <input
              type="date"
              className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </ReportFilterBar>
      }
    >
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[var(--color-primary)]"></div>
          </div>
        ) : reportData && reportData.length > 0 ? (
          <DataTable data={reportData} columns={columns} />
        ) : (
          <EmptyState
            title="No data found"
            description="Please adjust your filters to get relevant results"
            icon={<FileSpreadsheet className="h-10 w-10" />}
          />
        )}
      </div>
    </ReportLayout>
  );
}
