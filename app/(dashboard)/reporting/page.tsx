"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ReportTile } from "@/components/reporting/report-tile";
import { CalendarClock, FileSpreadsheet, AlertTriangle, Users, ClipboardList, Clock, ThumbsDown, MessageSquare } from "lucide-react";

export default function ReportingDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting Dashboard"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ReportTile
          title="ROC Report"
          description="View rostered shifts and schedules over time"
          icon={CalendarClock}
          href="/reporting/roc-reports"
          accentColor="#0ea5e9"
        />
        <ReportTile
          title="ROC Weekly Report"
          description="Weekly summary of worker hours and overtime"
          icon={Clock}
          href="/reporting/roc-weekly-reports"
          accentColor="#8b5cf6"
        />
        <ReportTile
          title="Timesheet Report"
          description="Line-by-line view of submitted timesheets"
          icon={ClipboardList}
          href="/reporting/timesheet-reports"
          accentColor="#10b981"
        />
        <ReportTile
          title="Payroll Report"
          description="Summarise worker hours by day and OT category"
          icon={FileSpreadsheet}
          href="/reporting/payroll-reports"
          accentColor="#f59e0b"
        />
        <ReportTile
          title="Feedback Report"
          description="Analyze feedback submissions and categories"
          icon={MessageSquare}
          href="/reporting/feedback-reports"
          accentColor="#3b82f6"
        />
        <ReportTile
          title="Complaints Report"
          description="Track and manage complaints"
          icon={ThumbsDown}
          href="/reporting/complaints-reports"
          accentColor="#ef4444"
        />
        <ReportTile
          title="Participant List"
          description="Coming soon"
          icon={Users}
          href="#"
          accentColor="#64748b"
        />
        <ReportTile
          title="Incident Reports"
          description="Coming soon"
          icon={AlertTriangle}
          href="#"
          accentColor="#64748b"
        />
      </div>
    </div>
  );
}
