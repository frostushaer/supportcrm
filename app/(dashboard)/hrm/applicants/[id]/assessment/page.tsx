/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { useApplicant, useAssessApplicant } from '@/hooks/use-hrm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { applicantAssessmentSchema, ApplicantAssessmentFormData } from '@/lib/validations/hrm';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

export default function ApplicantAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: applicant, isLoading } = useApplicant(resolvedParams.id);
  const assessApplicant = useAssessApplicant();

  const form = useForm<ApplicantAssessmentFormData>({
    resolver: standardSchemaResolver(applicantAssessmentSchema) as any,
    defaultValues: {
      status: 'Pending',
      interviewNotes: '',
      notes: '',
      createPortalUser: false,
    },
  });

  const status = form.watch('status');
  const createPortalUser = form.watch('createPortalUser');

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!applicant) {
    return <div className="p-8 text-center">Applicant not found.</div>;
  }

  const onSubmit = (data: ApplicantAssessmentFormData) => {
    assessApplicant.mutate({ id: applicant.id, data }, {
      onSuccess: () => {
        router.push(`/hrm/applicants/\${applicant.id}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Assessment: \${applicant.firstName} \${applicant.lastName}`}
        description="Review applicant details and make a hiring decision"
      />

      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decision Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PhoneScreening">Phone Screening</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Hired">Hired</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interviewNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Details from the interview..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General HR Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Other observations or background check info..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === 'Hired' && (
              <div className="space-y-4 border-t border-[var(--color-border)] pt-4 mt-6">
                <h3 className="text-lg font-medium">Hiring Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role (Required)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Support Worker" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type (Required)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-Time">Full-Time</SelectItem>
                            <SelectItem value="Part-Time">Part-Time</SelectItem>
                            <SelectItem value="Casual">Casual</SelectItem>
                            <SelectItem value="Contractor">Contractor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salarySlab"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Slab</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Level 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="createPortalUser"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Create Portal User Account
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This will create a Primary Portal User linked to the new Worker.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {createPortalUser && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temporary Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={assessApplicant.isPending}>
                {assessApplicant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Decision
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
