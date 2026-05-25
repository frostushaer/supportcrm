'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, Mail, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { useParticipant } from '@/hooks/use-participants';

type Params = Promise<{ id: string }>;

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm text-[var(--color-text)]">{value ?? '—'}</span>
    </div>
  );
}

export default function ParticipantProfilePage({ params }: { params: Params }) {
  const { id } = use(params);
  const { data: participant, isLoading, isError } = useParticipant(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[var(--color-text-muted)]">Loading participant...</p>
      </div>
    );
  }

  if (isError || !participant) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--color-error)]">Participant not found.</p>
        <Link href="/participants">
          <Button variant="outline">Back to Participants</Button>
        </Link>
      </div>
    );
  }

  const initials = `${participant.firstName[0]}${participant.lastName[0]}`;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4">
        <div className="mb-3">
          <Link href="/participants" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <ArrowLeft className="h-4 w-4" />
            Back to Participants
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-dim)] text-lg font-bold text-[var(--color-primary)]">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-[var(--color-text)]">
                  {participant.firstName} {participant.lastName}
                </h1>
                <StatusBadge status={participant.status.toLowerCase() as 'active' | 'inactive'} />
              </div>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                NDIS: <span className="font-mono">{participant.ndisNumber}</span>
                {' · '}{participant.serviceSupport} Support
                {' · '}{participant.region?.name}
              </p>
            </div>
          </div>
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="mb-6 w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ndis-plans">NDIS Plans</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="agreements">Service Agreements</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Personal Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--color-primary)]" />
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">Personal Details</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="First Name" value={participant.firstName} />
                    <InfoRow label="Last Name" value={participant.lastName} />
                    <InfoRow label="Gender" value={participant.gender} />
                    <InfoRow label="Date of Birth" value={new Date(participant.dateOfBirth).toLocaleDateString('en-AU')} />
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Email" value={participant.primaryEmailAddress} />
                    <InfoRow label="Primary Phone" value={participant.primaryPhoneNumber} />
                    {participant.secondaryPhoneNumber && (
                      <InfoRow label="Secondary Phone" value={participant.secondaryPhoneNumber} />
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">Address</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Street Address" value={participant.address} />
                    <InfoRow label="Suburb" value={participant.suburb} />
                    <InfoRow label="State" value={participant.state} />
                    <InfoRow label="Postcode" value={participant.postcode} />
                  </div>
                </div>
              </div>

              {/* Quick Snapshot */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">Quick Snapshot</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">Status</span>
                      <StatusBadge status={participant.status.toLowerCase() as 'active' | 'inactive'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">Service Support</span>
                      <span className="text-xs font-medium text-[var(--color-text)]">{participant.serviceSupport}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">Region</span>
                      <span className="text-xs font-medium text-[var(--color-text)]">{participant.region?.name ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">Audit Participation</span>
                      <span className="text-xs font-medium text-[var(--color-text)]">{participant.auditParticipation ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">NDIS Plans</span>
                      <span className="text-xs font-medium text-[var(--color-text)]">{participant.ndisPlans?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">Documents</span>
                      <span className="text-xs font-medium text-[var(--color-text)]">{participant.documents?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">Notes</span>
                      <span className="text-xs font-medium text-[var(--color-text)]">{participant.notes?.length ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">Contact</h2>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{participant.primaryEmailAddress}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{participant.primaryPhoneNumber}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* NDIS Plans */}
          <TabsContent value="ndis-plans">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">NDIS Plans</h2>
                </div>
                <Button size="sm">Add Plan</Button>
              </div>
              {!participant.ndisPlans?.length ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No NDIS plans recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {participant.ndisPlans.map((plan: { id: string; managementStyle: string; planStartDate: string; planEndDate: string; totalBudget: number; usedBudget: number }) => (
                    <div key={plan.id} className="rounded-lg border border-[var(--color-border)] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[var(--color-text)]">{plan.managementStyle}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(plan.planStartDate).toLocaleDateString('en-AU')} – {new Date(plan.planEndDate).toLocaleDateString('en-AU')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-xs text-[var(--color-text-muted)]">Total: <strong className="text-[var(--color-text)]">${plan.totalBudget.toLocaleString()}</strong></span>
                        <span className="text-xs text-[var(--color-text-muted)]">Used: <strong className="text-[var(--color-text)]">${plan.usedBudget.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">Documents</h2>
                </div>
                <Button size="sm">Upload Document</Button>
              </div>
              {!participant.documents?.length ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {participant.documents.map((doc: { id: string; fileName: string; fileType: string; uploadedBy: string; createdAt: string }) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{doc.fileName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{doc.fileType} · Uploaded by {doc.uploadedBy}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">Notes</h2>
                <Button size="sm">Add Note</Button>
              </div>
              {!participant.notes?.length ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No notes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {participant.notes.map((note: { id: string; content: string; createdBy: string; createdAt: string }) => (
                    <div key={note.id} className="rounded-lg border border-[var(--color-border)] p-4">
                      <p className="text-sm text-[var(--color-text)]">{note.content}</p>
                      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        By {note.createdBy} · {new Date(note.createdAt).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Service Agreements */}
          <TabsContent value="agreements">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">Service Agreements</h2>
                <Button size="sm">Add Agreement</Button>
              </div>
              {!participant.serviceAgreements?.length ? (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No service agreements recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {participant.serviceAgreements.map((sa: { id: string; agreementType: string; status: string; startDate: string; endDate: string }) => (
                    <div key={sa.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">{sa.agreementType}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(sa.startDate).toLocaleDateString('en-AU')} – {new Date(sa.endDate).toLocaleDateString('en-AU')}
                        </p>
                      </div>
                      <StatusBadge status={sa.status.toLowerCase() as 'active' | 'inactive' | 'pending'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
