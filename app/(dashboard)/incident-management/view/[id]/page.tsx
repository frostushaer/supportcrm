"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useIncident } from "@/hooks/use-incidents";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const { data: incident, isLoading, isError } = useIncident(id);

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
        <PageHeader title="View Incident" />
        <EmptyState
          icon={<AlertCircle />}
          title="Incident Not Found"
          description="The incident could not be found or you don't have permission to view it."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/incident-management")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader 
            title={`Incident: ${incident.incidentNumber}`} 
            description={`Reported on ${format(new Date(incident.createdAt), "PPP")}`} 
          />
        </div>
        <div className="flex gap-2">
          {incident.status === "Submitted" && (
            <Button onClick={() => router.push(`/incident-management/investigation/${incident.id}`)}>
              Start Investigation
            </Button>
          )}
          {incident.status === "UnderInvestigation" && (
            <Button variant="secondary" onClick={() => router.push(`/incident-management/investigation/${incident.id}`)}>
              Continue Investigation
            </Button>
          )}
          {(incident.status === "Submitted" || incident.status === "UnderInvestigation") && (
            <Button onClick={() => router.push(`/incident-management/review/${incident.id}`)} className="bg-green-600 hover:bg-green-700">
              Review & Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Badge variant={incident.status === "Draft" ? "secondary" : "default"}>
          Status: {incident.status}
        </Badge>
        {incident.outcomeType && (
          <Badge variant="outline">Type: {incident.outcomeType}</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timing & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Date</span>
                <p>{incident.dateOfIncident ? format(new Date(incident.dateOfIncident), "PPP") : "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Time</span>
                <p>{incident.timeOfIncident || "N/A"}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Address</span>
              <p>{incident.address || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">People Involved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Reported By</span>
              <p>{incident.reportedBy?.user?.name || incident.reportedByName || "Unknown"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Participants</span>
              <ul className="list-disc list-inside">
                {incident.participants?.map((p: { id: string; firstName: string; lastName: string }) => (
                  <li key={p.id}>{p.firstName} {p.lastName}</li>
                ))}
                {!incident.participants?.length && <p>None</p>}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Narrative / What Happened</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{incident.whatHappened || "No description provided."}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Immediate Response Flags</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            {incident.firstAidGiven && <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> First Aid</Badge>}
            {incident.ambulanceRequired && <Badge variant="secondary" className="gap-1"><ShieldAlert className="h-3 w-3 text-red-500" /> Ambulance Required</Badge>}
            {incident.policeInvolved && <Badge variant="secondary" className="gap-1"><ShieldAlert className="h-3 w-3 text-blue-500" /> Police Involved</Badge>}
            {incident.injuriesToParticipant && <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3 text-amber-500" /> Injuries Reported</Badge>}
            
            {!incident.firstAidGiven && !incident.ambulanceRequired && !incident.policeInvolved && !incident.injuriesToParticipant && (
              <p className="text-sm text-muted-foreground">No immediate response flags selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
