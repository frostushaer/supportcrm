"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { incidentSchema } from "@/lib/validations/incidents";
import { useCreateIncident, useUpdateIncident } from "@/hooks/use-incidents";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2 } from "lucide-react";

interface IncidentWizardProps {
  regionId: string;
  initialData?: Record<string, unknown> | null;
}

export function IncidentWizard({ regionId, initialData }: IncidentWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident(initialData?.id as string | undefined);

  // Fetch participants and workers for dropdowns
  const { data: participants } = useQuery({
    queryKey: ["participants", regionId],
    queryFn: async () => {
      const res = await fetch(`/api/participants?regionId=${regionId}`);
      return res.json();
    }
  });

  const { data: workers } = useQuery({
    queryKey: ["workers", regionId],
    queryFn: async () => {
      const res = await fetch(`/api/workers?regionId=${regionId}`);
      return res.json();
    }
  });

  const form = useForm<z.infer<typeof incidentSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(incidentSchema as any),
    defaultValues: initialData ? {
      ...initialData,
      participantIds: (initialData.participants as Array<{id: string}>)?.map(p => p.id) || [],
      dateOfIncident: initialData.dateOfIncident ? new Date(initialData.dateOfIncident as string) : undefined,
    } : {
      regionId,
      status: "Draft",
      participantIds: [],
      incidentCategories: [],
      witnesses: [],
      attachments: [],
      reportedById: "dummy-worker-id", // Should be derived from logged-in user context in real app
    },
  });

  const handleSaveDraft = async () => {
    try {
      const data = form.getValues();
      data.status = "Draft";
      if (initialData?.id) {
        await updateIncident.mutateAsync(data);
      } else {
        await createIncident.mutateAsync(data);
      }
      toast.success("Draft saved successfully");
      router.push("/incident-management");
    } catch (error) {
      toast.error("Failed to save draft");
    }
  };

  const onSubmit = async (data: z.infer<typeof incidentSchema>) => {
    try {
      data.status = "Submitted";
      if (initialData?.id) {
        await updateIncident.mutateAsync(data);
      } else {
        await createIncident.mutateAsync(data);
      }
      toast.success("Incident submitted successfully");
      router.push("/incident-management");
    } catch (error) {
      toast.error("Failed to submit incident. Please check required fields.");
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate as unknown as undefined);
    if (isValid) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const getFieldsForStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return ["dateOfIncident", "timeOfIncident", "address", "location", "participantIds"];
      case 2: return ["outcomeType", "incidentCategories", "summary", "whatHappened", "immediateAction"];
      case 3: return ["firstAidGiven", "ambulanceRequired", "policeInvolved", "injuriesToParticipant"];
      case 4: return ["signatoryName"];
      default: return [];
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i}
                </div>
                {i < 4 && <div className={`w-12 h-1 ${step > i ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold">Timing, Location & People</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfIncident"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Incident</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeOfIncident"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Incident</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Example St..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participants Involved</FormLabel>
                  <Select onValueChange={(val) => field.onChange([...field.value, val])}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select participants" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {participants?.map((p: { id: string; firstName: string; lastName: string }) => (
                        <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((id: string) => {
                      const p = participants?.find((p: { id: string; firstName: string; lastName: string }) => p.id === id);
                      return p ? (
                        <div key={id} className="bg-secondary px-2 py-1 rounded-md flex items-center gap-2 text-sm">
                          {p.firstName} {p.lastName}
                          <button type="button" onClick={() => field.onChange(field.value.filter((vid: string) => vid !== id))} className="text-muted-foreground hover:text-foreground">×</button>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold">Details & Categorisation</h3>
            
            <FormField
              control={form.control}
              name="outcomeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Hazard">Hazard</SelectItem>
                      <SelectItem value="Incident">Incident</SelectItem>
                      <SelectItem value="NearMiss">Near Miss</SelectItem>
                      <SelectItem value="Medication">Medication</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatHappened"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What Happened?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the incident..." className="min-h-[100px]" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold">Immediate Response</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstAidGiven"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>First Aid Given</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ambulanceRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ambulance Required</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policeInvolved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Police Involved</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold">Sign-off</h3>
            
            <FormField
              control={form.control}
              name="signatoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signatory Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <p className="text-sm text-muted-foreground">
              By submitting this incident report, you confirm that the information provided is accurate and true to the best of your knowledge.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/incident-management")}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={createIncident.isPending || updateIncident.isPending}>
              Save Draft
            </Button>
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {step < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={createIncident.isPending || updateIncident.isPending}>
                {(createIncident.isPending || updateIncident.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Incident
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
