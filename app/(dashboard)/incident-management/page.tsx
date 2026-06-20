"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIncidents, useDeleteIncident } from "@/hooks/use-incidents";
import { useRegionStore } from "@/store/region-store";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { AlertCircle, FileText, Activity, ShieldAlert, Edit, Eye, Trash2, ShieldCheck, FileSearch, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function IncidentManagementDashboard() {
  const router = useRouter();
  const selectedRegionId = useRegionStore((state) => state.selectedRegionId);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: incidents, isLoading } = useIncidents({
    regionId: selectedRegionId || undefined,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteIncident = useDeleteIncident();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft incident?")) {
      try {
        await deleteIncident.mutateAsync(id);
        toast.success("Incident deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete incident. Ensure it is in Draft status.");
      }
    }
  };

  // Calculate KPIs
  const totalIncidents = incidents?.length || 0;
  const draftIncidents = incidents?.filter((i: { status: string }) => i.status === "Draft").length || 0;
  const underInvestigation = incidents?.filter((i: { status: string }) => i.status === "UnderInvestigation").length || 0;
  const closedIncidents = incidents?.filter((i: { status: string }) => i.status?.startsWith("Closed")).length || 0;

  const columns = [
    { key: "incidentNumber", label: "Incident No." },
    { 
      key: "createdAt", 
      label: "Date",
      render: (item: { createdAt: string }) => format(new Date(item.createdAt), "dd MMM yyyy")
    },
    { 
      key: "reportedBy", 
      label: "Reported By",
      render: (item: { reportedBy?: { user?: { name: string } }, reportedByName?: string }) => item.reportedBy?.user?.name || item.reportedByName || "Unknown"
    },
    { 
      key: "participants", 
      label: "Participants",
      render: (item: { participants?: { firstName: string, lastName: string }[] }) => item.participants?.map((p: { firstName: string, lastName: string }) => `${p.firstName} ${p.lastName}`).join(", ") || "-"
    },
    { 
      key: "status", 
      label: "Status",
      render: (item: { status: string }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "Draft" ? "bg-gray-100 text-gray-800" :
          item.status === "Submitted" ? "bg-blue-100 text-blue-800" :
          item.status === "UnderInvestigation" ? "bg-amber-100 text-amber-800" :
          "bg-green-100 text-green-800"
        }`}>
          {item.status.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: { id: string, incidentNumber: string, status: string, createdAt: string, reportedByName: string, reportedBy: { user?: { name: string } }, participants: { firstName: string, lastName: string }[] }) => (
        <div className="flex items-center gap-2">
          {item.status === "Draft" ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/incident-management/edit/${item.id}`)} title="Edit Draft">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600" title="Delete Draft">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/incident-management/view/${item.id}`)} title="View Incident">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/incident-management/investigation/${item.id}`)} title="Investigation">
                <FileSearch className="h-4 w-4 text-amber-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/incident-management/review/${item.id}`)} title="Review & Close">
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  if (!selectedRegionId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Incident Management" description="Manage and track compliance incidents." />
        <EmptyState
          icon={<AlertCircle />}
          title="No Region Selected"
          description="Please select a region from the sidebar to view incidents."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Incident Management" 
          description="Manage and track compliance incidents, investigations, and reviews." 
        />
        <Button onClick={() => router.push("/incident-management/create")}>
          <FileText className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Incidents"
          value={totalIncidents.toString()}
          icon={<Activity />}
        />
        <KPICard
          title="Draft Incidents"
          value={draftIncidents.toString()}
          icon={<FileText />}
        />
        <KPICard
          title="Under Investigation"
          value={underInvestigation.toString()}
          icon={<ShieldAlert />}
        />
        <KPICard
          title="Closed Incidents"
          value={closedIncidents.toString()}
          icon={<ShieldCheck />}
        />
      </div>

      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search incident number or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="UnderInvestigation">Under Investigation</SelectItem>
            <SelectItem value="ClosedReported">Closed (Reported)</SelectItem>
            <SelectItem value="ClosedUnreported">Closed (Unreported)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={incidents || []}
          />
        )}
      </div>
    </div>
  );
}
