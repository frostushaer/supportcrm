"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ReportTile } from "@/components/reporting/report-tile";
import { useRegionStore } from "@/store/region-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, Timer, ClipboardList, BadgeDollarSign, MessageSquare, 
  AlertCircle, Users, FileSignature, FileWarning, Briefcase, 
  FileEdit, AlertTriangle, ShieldAlert, HeartPulse, Receipt, 
  PieChart, ClipboardCheck 
} from "lucide-react";

export default function ReportingDashboardPage() {
  const { selectedRegionId, setSelectedRegionId } = useRegionStore();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reporting Dashboard"
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Selected Regions</span>
            <Select
              value={selectedRegionId || 'all'}
              onValueChange={(value) => setSelectedRegionId(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-[var(--color-bg)]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">North Region</SelectItem>
                <SelectItem value="south">South Region</SelectItem>
                <SelectItem value="east">East Region</SelectItem>
                <SelectItem value="west">West Region</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ReportTile
          title="ROC Report"
          icon={TrendingUp}
          href="/reports/roc-reports"
          accentColor="#10b981"
        />
        <ReportTile
          title="ROC Weekly Report"
          icon={Timer}
          href="/reports/roc-weekly-reports"
          accentColor="#ef4444"
        />
        <ReportTile
          title="Timesheet Report"
          icon={ClipboardList}
          href="/reports/timesheet-reports"
          accentColor="#ef4444"
        />
        <ReportTile
          title="Payroll Report"
          icon={BadgeDollarSign}
          href="/reports/payroll-reports"
          accentColor="#ef4444"
        />
        <ReportTile
          title="Feedback Report"
          icon={MessageSquare}
          href="/reports/feedback-reports"
          accentColor="#ec4899"
        />
        <ReportTile
          title="Complaints Report"
          icon={AlertCircle}
          href="/reports/complaints-reports"
          accentColor="#8b5cf6"
        />
        <ReportTile
          title="Participant List Report"
          icon={Users}
          href="#"
          accentColor="#eab308"
        />
        <ReportTile
          title="KYP Report"
          icon={FileSignature}
          href="#"
          accentColor="#ec4899"
        />
        <ReportTile
          title="Participant Expiring Documents Report"
          icon={FileWarning}
          href="#"
          accentColor="#eab308"
        />
        <ReportTile
          title="Worker List Report"
          icon={Briefcase}
          href="#"
          accentColor="#8b5cf6"
        />
        <ReportTile
          title="Worker Expiring Documents Report"
          icon={FileWarning}
          href="#"
          accentColor="#8b5cf6"
        />
        <ReportTile
          title="Participant Case Notes Report"
          icon={FileEdit}
          href="#"
          accentColor="#8b5cf6"
        />
        <ReportTile
          title="Incident Report"
          icon={AlertTriangle}
          href="#"
          accentColor="#eab308"
        />
        <ReportTile
          title="Incident Management Report"
          icon={ShieldAlert}
          href="#"
          accentColor="#eab308"
        />
        <ReportTile
          title="Risk Assessment Report"
          icon={HeartPulse}
          href="#"
          accentColor="#ef4444"
        />
        <ReportTile
          title="COS Funding Report"
          icon={TrendingUp}
          href="#"
          accentColor="#10b981"
        />
        <ReportTile
          title="COS Case Note Report"
          icon={FileEdit}
          href="#"
          accentColor="#8b5cf6"
        />
        <ReportTile
          title="Detailed Invoicing Report"
          icon={Receipt}
          href="#"
          accentColor="#10b981"
        />
        <ReportTile
          title="Summary Invoicing Report"
          icon={PieChart}
          href="#"
          accentColor="#10b981"
        />
        <ReportTile
          title="NDIS Claims Report"
          icon={ClipboardCheck}
          href="#"
          accentColor="#ec4899"
        />
      </div>
    </div>
  );
}
