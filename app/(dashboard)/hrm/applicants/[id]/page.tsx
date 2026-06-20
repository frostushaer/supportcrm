/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { useApplicant, useUpdateApplicant } from '@/hooks/use-hrm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { use } from 'react';
import Link from 'next/link';

export default function ApplicantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: applicant, isLoading } = useApplicant(resolvedParams.id);
  const updateApplicant = useUpdateApplicant();

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!applicant) {
    return <div className="p-8 text-center">Applicant not found.</div>;
  }

  const handleStatusChange = (newStatus: string) => {
    updateApplicant.mutate({ id: applicant.id, data: { status: newStatus } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`\${applicant.firstName} \${applicant.lastName}`}
        description={`Applied for the position of \${applicant.jobTitle}`}
        action={
          <div className="flex items-center gap-3">
            <Link href={`/hrm/applicants/\${applicant.id}/assessment`}>
              <Button>Assessment</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <h3 className="font-semibold text-lg mb-4">Applicant Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-[var(--color-text-muted)] block">Email</span>
                <span>{applicant.email}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Phone</span>
                <span>{applicant.phoneNumber}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Suburb</span>
                <span>{applicant.suburb || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Current Status</span>
                <span className="font-medium text-[var(--color-primary)]">{applicant.status}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Quick Action</span>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={applicant.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updateApplicant.isPending}
                >
                  <option value="Applied">Applied</option>
                  <option value="PhoneScreening">Phone Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Pending">Pending</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <h3 className="font-semibold text-lg mb-4">Notes</h3>
            <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap">
              {applicant.notes || 'No internal notes provided.'}
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
            <h3 className="font-semibold text-lg mb-4">Interview Notes</h3>
            <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap">
              {applicant.interviewNotes || 'No interview notes recorded yet. Proceed to Assessment to add them.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
