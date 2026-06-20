"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { incidentReviewSchema } from "@/lib/validations/incidents";
import { useIncident, useIncidentReview, useSaveIncidentReview } from "@/hooks/use-incidents";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
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

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const { data: incident, isLoading: isIncidentLoading } = useIncident(id);
  const { data: review, isLoading: isReviewLoading } = useIncidentReview(id);
  const saveReview = useSaveIncidentReview(id);

  const form = useForm<z.infer<typeof incidentReviewSchema>>({
    // @ts-expect-error Zod overload error
    resolver: zodResolver(incidentReviewSchema),
    values: review || {
      investigationSummary: "",
      riskNewRisksIdentified: undefined,
      riskMitigationRequired: undefined,
      riskRecurrenceRating: undefined,
      finalStatus: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof incidentReviewSchema>) => {
    try {
      await saveReview.mutateAsync(data);
      toast.success("Review completed and incident closed.");
      router.push(`/incident-management/view/${id}`);
    } catch (error) {
      toast.error("Failed to save review");
    }
  };

  if (isIncidentLoading || isReviewLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader title="Review & Close" />
        <EmptyState
          icon={<AlertCircle />}
          title="Incident Not Found"
          description="The incident could not be found."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/incident-management/view/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader 
            title={`Review & Close Incident: ${incident.incidentNumber}`} 
            description="Complete the final risk assessment and close the incident." 
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Investigation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="investigationSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Summarize the findings of the investigation..." 
                        className="min-h-[100px]" 
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

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Evaluate the risk of recurrence and new risks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="riskNewRisksIdentified"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Risks Identified?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
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

                <FormField
                  control={form.control}
                  name="riskMitigationRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Mitigation Required?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
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

                <FormField
                  control={form.control}
                  name="riskRecurrenceRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence Rating</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nil">Nil</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Closure</CardTitle>
              <CardDescription>Determine the final outcome of the incident report.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="finalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select closure status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ClosedReported">Closed (Reported to Commission)</SelectItem>
                        <SelectItem value="ClosedUnreported">Closed (Not Reportable)</SelectItem>
                      </SelectContent>
                    </Select>
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
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saveReview.isPending}>
              {saveReview.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Close Incident
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
