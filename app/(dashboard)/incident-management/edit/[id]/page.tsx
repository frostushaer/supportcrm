"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegionStore } from "@/store/region-store";
import { PageHeader } from "@/components/shared/page-header";
import { IncidentWizard } from "@/components/incidents/incident-wizard";
import { useIncident } from "@/hooks/use-incidents";
import { AlertCircle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const selectedRegionId = useRegionStore((state) => state.selectedRegionId);

  const { data: incident, isLoading, isError } = useIncident(id);

  useEffect(() => {
    if (incident && incident.status !== "Draft") {
      router.replace(`/incident-management/view/${id}`);
    }
  }, [incident, id, router]);

  if (!selectedRegionId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Edit Incident" description="Resume a draft incident report." />
        <EmptyState
          icon={<AlertCircle />}
          title="No Region Selected"
          description="Please select a region from the sidebar to continue."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Edit Incident" description="Resume a draft incident report." />
        <EmptyState
          icon={<AlertCircle />}
          title="Incident Not Found"
          description="The incident could not be found or you don't have permission to view it."
        />
      </div>
    );
  }

  // Double check to not render form if it's not a draft
  if (incident.status !== "Draft") return null;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader 
        title={`Edit Draft Incident: ${incident.incidentNumber}`} 
        description="Resume and complete the incident report." 
      />
      <div className="rounded-md border bg-white p-6">
        <IncidentWizard regionId={selectedRegionId} initialData={incident} />
      </div>
    </div>
  );
}
