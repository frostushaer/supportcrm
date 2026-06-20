"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { incidentInvestigationSchema } from "@/lib/validations/incidents";
import { useIncident, useIncidentInvestigation, useSaveIncidentInvestigation } from "@/hooks/use-incidents";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const { data: incident, isLoading: isIncidentLoading } = useIncident(id);
  const { data: investigation, isLoading: isInvestigationLoading } = useIncidentInvestigation(id);
  const saveInvestigation = useSaveIncidentInvestigation(id);

  const form = useForm<z.infer<typeof incidentInvestigationSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(incidentInvestigationSchema as any),
    values: (investigation as unknown as z.infer<typeof incidentInvestigationSchema>) || {
      status: "InProgress",
      siteVisitConducted: undefined,
      occurredDuringRoutineActivities: undefined,
      equipmentContributed: undefined,
      riskAssessmentDone: undefined,
      rootCauseAnalysis: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof incidentInvestigationSchema>) => {
    try {
      await saveInvestigation.mutateAsync(data);
      toast.success("Investigation saved successfully");
      router.push(`/incident-management/view/${id}`);
    } catch (error) {
      toast.error("Failed to save investigation");
    }
  };

  if (isIncidentLoading || isInvestigationLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Investigation" />
        <EmptyState
          icon={<AlertCircle />}
          title="Incident Not Found"
          description="The incident could not be found."
        />
      </div>
    );
  }

  const investigationChecks = [
    { name: "siteVisitConducted", label: "Site visit conducted?" },
    { name: "occurredDuringRoutineActivities", label: "Occurred during routine activities?" },
    { name: "equipmentContributed", label: "Equipment contributed to incident?" },
    { name: "equipmentDesignedForTask", label: "Equipment designed for the task?" },
    { name: "riskAssessmentDone", label: "Risk assessment completed?" },
    { name: "safetyInstructionsProvided", label: "Safety instructions provided?" },
    { name: "ppeUsed", label: "PPE used?" },
    { name: "personTrained", label: "Person was trained?" },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/incident-management/view/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader 
            title={`Investigate Incident: ${incident.incidentNumber}`} 
            description="Complete the compliance and root cause analysis checks." 
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checks</CardTitle>
              <CardDescription>Answer Yes, No, or N/A for each question.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investigationChecks.map((check) => (
                  <FormField
                    key={check.name}
                    control={form.control}
                    name={check.name as keyof z.infer<typeof incidentInvestigationSchema>}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{check.label}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={(field.value as string) || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="NA">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Root Cause Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="rootCauseAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary of Root Cause</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail the findings of the investigation and the root cause..." 
                        className="min-h-[150px]" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/incident-management/view/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveInvestigation.isPending}>
              {saveInvestigation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Investigation
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
