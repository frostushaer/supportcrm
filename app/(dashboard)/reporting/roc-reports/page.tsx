/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/reporting/report-layout";
import { ReportFilterBar } from "@/components/reporting/report-filter-bar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { useRocReport } from "@/hooks/use-reporting";
import { useParticipants } from "@/hooks/use-participants";
import { useWorkers } from "@/hooks/use-workers";
import { format } from "date-fns";
import { Search, CalendarClock } from "lucide-react";

export default function RocReportsPage() {
  const [filters, setFilters] = useState({
    search: "",
    participantId: "",
    workerId: "",
    status: "",
    overtime: "",
    startDate: "",
    endDate: "",
  });

  const [activeFilters, setActiveFilters] = useState({ ...filters });

  const { data: reportData, isLoading } = useRocReport(activeFilters);
  const { data: participants } = useParticipants();
  const { data: workers } = useWorkers();

  const handleSearch = () => {
    setActiveFilters({ ...filters });
  };

  const handleClear = () => {
    const reset = {
      search: "",
      participantId: "",
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
    
    // Simple CSV export
    const headers = ["Participant", "Worker", "Scheduled Shift Date", "Shift Start Time", "Shift End Time", "Shift Length (hrs)", "Overtime", "Status"];
    const rows = reportData.map((row: any) => {
      const start = new Date(row.startDateTime);
      const end = new Date(row.endDateTime);
      const shiftLength = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return [
        `"${row.participant?.firstName} ${row.participant?.lastName}"`,
        `"${row.worker?.firstName} ${row.worker?.lastName}"`,
        `"${format(start, "dd/MM/yyyy")}"`,
        `"${format(start, "HH:mm")}"`,
        `"${format(end, "HH:mm")}"`,
        shiftLength.toFixed(2),
        `"${row.overtime || "None"}"`,
        `"${row.status}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ROC_Report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      label: "Participant",
      key: "participant",
      render: (row: any) => `${row.participant?.firstName || ''} ${row.participant?.lastName || ''}`
    },
    {
      label: "Worker",
      key: "worker",
      render: (row: any) => `${row.worker?.firstName || ''} ${row.worker?.lastName || ''}`
    },
    {
      label: "Scheduled Shift Date",
      key: "startDateTime",
      render: (row: any) => format(new Date(row.startDateTime), "dd/MM/yyyy")
    },
    {
      label: "Shift Start Time",
      key: "startTime",
      render: (row: any) => format(new Date(row.startDateTime), "HH:mm")
    },
    {
      label: "Shift End Time",
      key: "endTime",
      render: (row: any) => format(new Date(row.endDateTime), "HH:mm")
    },
    {
      label: "Shift Length",
      key: "shiftLength",
      render: (row: any) => {
        const start = new Date(row.startDateTime);
        const end = new Date(row.endDateTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return `${hours.toFixed(2)} hrs`;
      }
    },
    {
      label: "Overtime",
      key: "overtime",
      render: (row: any) => row.overtime || "None"
    },
    {
      label: "Status",
      key: "status",
    }
  ];

  return (
    <ReportLayout
      title="ROC Report"
      filters={
        <ReportFilterBar onSearch={handleSearch} onClear={handleClear} onExport={handleExport}>
          <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--color-text-light)]" />
            <input
              type="text"
              placeholder="Search participant..."
              className="border-none bg-transparent text-sm outline-none placeholder:text-[var(--color-text-light)] focus:ring-0"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={filters.participantId}
            onChange={(e) => setFilters({ ...filters, participantId: e.target.value })}
          >
            <option value="">All Participants</option>
            {participants?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
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
            icon={<CalendarClock className="h-10 w-10" />}
          />
        )}
      </div>
    </ReportLayout>
  );
}
