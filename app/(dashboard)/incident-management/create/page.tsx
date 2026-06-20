"use client";

import { useRegionStore } from "@/store/region-store";
import { PageHeader } from "@/components/shared/page-header";
import { IncidentWizard } from "@/components/incidents/incident-wizard";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function CreateIncidentPage() {
  const selectedRegionId = useRegionStore((state) => state.selectedRegionId);

  if (!selectedRegionId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Report Incident" description="Create a new compliance incident report." />
        <EmptyState
          icon={<AlertCircle />}
          title="No Region Selected"
          description="Please select a region from the sidebar to report an incident."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader 
        title="Report Incident" 
        description="Complete the form below to report an incident. You can save as a draft and return later." 
      />
      <div className="rounded-md border bg-white p-6">
        <IncidentWizard regionId={selectedRegionId} />
      </div>
    </div>
  );
}
