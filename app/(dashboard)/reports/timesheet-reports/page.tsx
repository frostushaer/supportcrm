/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/reporting/report-layout";
import { ReportFilterBar } from "@/components/reporting/report-filter-bar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { useTimesheetReport } from "@/hooks/use-reporting";
import { useParticipants } from "@/hooks/use-participants";
import { useWorkers } from "@/hooks/use-workers";
import { format } from "date-fns";
import { Search, ClipboardList } from "lucide-react";

export default function TimesheetReportsPage() {
  const [filters, setFilters] = useState({
    search: "",
    participantId: "",
    workerId: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [activeFilters, setActiveFilters] = useState({ ...filters });
  const [timeFormat, setTimeFormat] = useState("24h");

  const { data: reportData, isLoading } = useTimesheetReport(activeFilters);
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
      startDate: "",
      endDate: "",
    };
    setFilters(reset);
    setActiveFilters(reset);
    setTimeFormat("24h");
  };

  const handleExport = () => {
    if (!reportData || reportData.length === 0) return;
    
    const headers = ["Participant", "Worker", "Timesheet Date", "Worker Start Time", "Worker End Time", "Total Time (hrs)", "Status", "Shift Notes", "Incidents", "KMs", "Shift Associated Cost $"];
    const rows = reportData.map((row: any) => {
      const start = new Date(row.actualStartTime);
      const end = new Date(row.actualEndTime);
      const timeFmt = timeFormat === "24h" ? "HH:mm" : "hh:mm a";

      return [
        `"${row.shift?.participant?.firstName} ${row.shift?.participant?.lastName}"`,
        `"${row.shift?.worker?.firstName} ${row.shift?.worker?.lastName}"`,
        `"${format(start, "dd/MM/yyyy")}"`,
        `"${format(start, timeFmt)}"`,
        `"${format(end, timeFmt)}"`,
        row.totalHours.toFixed(2),
        `"${row.status}"`,
        `"${row.shiftNotes || ""}"`,
        row.incidents,
        row.kms,
        row.associatedCost
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Timesheet_Report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      label: "Participant",
      key: "participant",
      render: (row: any) => `${row.shift?.participant?.firstName || ''} ${row.shift?.participant?.lastName || ''}`
    },
    {
      label: "Worker",
      key: "worker",
      render: (row: any) => `${row.shift?.worker?.firstName || ''} ${row.shift?.worker?.lastName || ''}`
    },
    {
      label: "Timesheet Date",
      key: "actualStartTime",
      render: (row: any) => format(new Date(row.actualStartTime), "dd/MM/yyyy")
    },
    {
      label: "Worker Start Time",
      key: "startTime",
      render: (row: any) => format(new Date(row.actualStartTime), timeFormat === "24h" ? "HH:mm" : "hh:mm a")
    },
    {
      label: "Worker End Time",
      key: "endTime",
      render: (row: any) => format(new Date(row.actualEndTime), timeFormat === "24h" ? "HH:mm" : "hh:mm a")
    },
    {
      label: "Total Time",
      key: "totalHours",
      render: (row: any) => `${row.totalHours.toFixed(2)} hrs`
    },
    {
      label: "Status",
      key: "status",
    },
    {
      label: "Shift Notes",
      key: "shiftNotes",
    },
    {
      label: "Incidents",
      key: "incidents",
    },
    {
      label: "KMs",
      key: "kms",
    },
    {
      label: "Associated Cost $",
      key: "associatedCost",
      render: (row: any) => `$${row.associatedCost.toFixed(2)}`
    }
  ];

  return (
    <ReportLayout
      title="Timesheet Report"
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
          >
            <option value="24h">24 Hour</option>
            <option value="12h">12 Hour</option>
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
            icon={<ClipboardList className="h-10 w-10" />}
          />
        )}
      </div>
    </ReportLayout>
  );
}
