/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/reporting/report-layout";
import { ReportFilterBar } from "@/components/reporting/report-filter-bar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { useRocWeeklyReport } from "@/hooks/use-reporting";
import { useWorkers } from "@/hooks/use-workers";
import { format } from "date-fns";
import { Search, Clock } from "lucide-react";

export default function RocWeeklyReportsPage() {
  const [filters, setFilters] = useState({
    search: "",
    workerId: "",
    status: "",
    overtime: "",
    startDate: "",
    endDate: "",
  });

  const [activeFilters, setActiveFilters] = useState({ ...filters });

  const { data: reportData, isLoading } = useRocWeeklyReport(activeFilters);
  const { data: workers } = useWorkers();

  const handleSearch = () => {
    setActiveFilters({ ...filters });
  };

  const handleClear = () => {
    const reset = {
      search: "",
      workerId: "",
      status: "",
      overtime: "",
      startDate: "",
      endDate: "",
    };
    setFilters(reset);
    setActiveFilters(reset);
  };

  const handleExport = () => {
    if (!reportData || reportData.length === 0) return;
    
    const headers = ["Worker", "Over Time (hrs)", "Weekly Hours"];
    const rows = reportData.map((row: any) => {
      return [
        `"${row.workerName}"`,
        row.overTime,
        row.weeklyHours
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ROC_Weekly_Report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      label: "Worker",
      key: "workerName",
    },
    {
      label: "Over Time",
      key: "overTime",
      render: (row: any) => `${row.overTime} hrs`
    },
    {
      label: "Weekly Hours",
      key: "weeklyHours",
      render: (row: any) => `${row.weeklyHours} hrs`
    }
  ];

  return (
    <ReportLayout
      title="ROC Weekly Report"
      filters={
        <ReportFilterBar onSearch={handleSearch} onClear={handleClear} onExport={handleExport}>
          <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--color-text-light)]" />
            <input
              type="text"
              placeholder="Search worker..."
              className="border-none bg-transparent text-sm outline-none placeholder:text-[var(--color-text-light)] focus:ring-0"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

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

          <select
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
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
            icon={<Clock className="h-10 w-10" />}
          />
        )}
      </div>
    </ReportLayout>
  );
}
