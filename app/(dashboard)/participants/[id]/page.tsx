'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, FileText, Mail, MapPin, Phone, Plus, Shield,
  User, Pill, ClipboardList, DollarSign, BarChart2, FolderOpen,
  AlertTriangle, Settings, Target, Heart, ThumbsDown, CheckCircle2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  useParticipant,
  useCaseNotes,
  useCreateCaseNote,
  useTasks,
  useCreateTask,
  useGoals,
  useCreateGoal,
  useMedications,
  useCreateMedication,
  useAppointments,
  useCreateAppointment,
} from '@/hooks/use-participants';
import {
  caseNoteSchema,
  taskSchema,
  goalSchema,
  medicationSchema,
  appointmentSchema,
  type CaseNoteFormData,
  type TaskFormData,
  type GoalFormData,
  type MedicationFormData,
  type AppointmentFormData,
} from '@/lib/validations/participants';

type Params = Promise<{ id: string }>;

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm text-[var(--color-text)]">{value ?? '—'}</span>
    </div>
  );
}

function SectionCard({ title, icon, children, action }: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyRows({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{message}</p>;
}

function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Pending': 'bg-[var(--color-warning-dim)] text-[var(--color-warning)]',
    'In Progress': 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]',
    'Completed': 'bg-[var(--color-success-dim)] text-[var(--color-success)]',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-[var(--color-subtle)] text-[var(--color-text-muted)]'}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    'Low': 'bg-[var(--color-subtle)] text-[var(--color-text-muted)]',
    'Medium': 'bg-[var(--color-warning-dim)] text-[var(--color-warning)]',
    'High': 'bg-[var(--color-error-dim)] text-[var(--color-error)]',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[priority] ?? ''}`}>
      {priority}
    </span>
  );
}

export default function ParticipantProfilePage({ params }: { params: Params }) {
  const { id } = use(params);
  const { data: participant, isLoading, isError } = useParticipant(id);
  const { data: caseNotes } = useCaseNotes(id);
  const { data: tasks } = useTasks(id);
  const { data: goals } = useGoals(id);
  const { data: medications } = useMedications(id);
  const { data: appointments } = useAppointments(id);

  const { mutate: createCaseNote, isPending: creatingNote } = useCreateCaseNote(id);
  const { mutate: createTask, isPending: creatingTask } = useCreateTask(id);
  const { mutate: createGoal, isPending: creatingGoal } = useCreateGoal(id);
  const { mutate: createMedication, isPending: creatingMed } = useCreateMedication(id);
  const { mutate: createAppointment, isPending: creatingAppt } = useCreateAppointment(id);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [apptDialogOpen, setApptDialogOpen] = useState(false);

  const noteForm = useForm<CaseNoteFormData>({ resolver: standardSchemaResolver(caseNoteSchema) });
  const taskForm = useForm<TaskFormData>({ resolver: standardSchemaResolver(taskSchema), defaultValues: { priority: 'Medium', status: 'Pending' } });
  const goalForm = useForm<GoalFormData>({ resolver: standardSchemaResolver(goalSchema), defaultValues: { progress: 0 } });
  const medForm = useForm<MedicationFormData>({ resolver: standardSchemaResolver(medicationSchema) });
  const apptForm = useForm<AppointmentFormData>({ resolver: standardSchemaResolver(appointmentSchema) });

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
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4">
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
                <h1 className="text-xl font-semibold text-[var(--color-text)]">
                  {participant.firstName} {participant.lastName}
                </h1>
                <StatusBadge status={participant.status.toLowerCase() as 'active' | 'inactive'} />
              </div>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                NDIS: <span className="font-mono">{participant.ndisNumber}</span>
                {' · '}{participant.serviceSupport}
                {' · '}{participant.region?.name}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="mb-6 flex-wrap">
            <TabsTrigger value="overview"><User className="mr-1.5 h-3.5 w-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="case-notes"><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Case Notes</TabsTrigger>
            <TabsTrigger value="medication"><Pill className="mr-1.5 h-3.5 w-3.5" />Medication</TabsTrigger>
            <TabsTrigger value="shift-notes"><FileText className="mr-1.5 h-3.5 w-3.5" />Shift Notes</TabsTrigger>
            <TabsTrigger value="tasks"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Tasks</TabsTrigger>
            <TabsTrigger value="funding"><DollarSign className="mr-1.5 h-3.5 w-3.5" />Funding</TabsTrigger>
            <TabsTrigger value="forms"><BarChart2 className="mr-1.5 h-3.5 w-3.5" />Forms</TabsTrigger>
            <TabsTrigger value="documents"><FolderOpen className="mr-1.5 h-3.5 w-3.5" />Documents</TabsTrigger>
            <TabsTrigger value="risk"><AlertTriangle className="mr-1.5 h-3.5 w-3.5" />Risk</TabsTrigger>
            <TabsTrigger value="appointments"><Calendar className="mr-1.5 h-3.5 w-3.5" />Appointments</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-1.5 h-3.5 w-3.5" />Settings</TabsTrigger>
          </TabsList>

          {/* ── 1. OVERVIEW ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-5">
                {/* Quick Snapshot */}
                <SectionCard title="Quick Snapshot" icon={<Shield className="h-4 w-4 text-[var(--color-primary)]" />}>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Address" value={`${participant.address}, ${participant.suburb} ${participant.state} ${participant.postcode}`} />
                    <InfoRow label="Emergency Contact" value={participant.emergencyContactName} />
                    <InfoRow label="Phone" value={participant.primaryPhoneNumber} />
                    <InfoRow label="Email" value={participant.primaryEmailAddress} />
                    <InfoRow label="NDIS No." value={participant.ndisNumber} />
                    <InfoRow label="DOB" value={new Date(participant.dateOfBirth).toLocaleDateString('en-AU')} />
                    <InfoRow label="Service Start" value={participant.serviceStartDate ? new Date(participant.serviceStartDate).toLocaleDateString('en-AU') : null} />
                    <InfoRow label="Service End" value={participant.serviceEndDate ? new Date(participant.serviceEndDate).toLocaleDateString('en-AU') : null} />
                    <InfoRow label="Plan Nominee" value={participant.planNominee} />
                    <InfoRow label="Region" value={participant.region?.name} />
                  </div>
                  {(participant.externalCoordinatorName || participant.externalCoordinatorEmail) && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                      <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">External Coordinator</p>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoRow label="Name" value={participant.externalCoordinatorName} />
                        <InfoRow label="Email" value={participant.externalCoordinatorEmail} />
                        <InfoRow label="Phone" value={participant.externalCoordinatorPhone} />
                        <InfoRow label="Company" value={participant.externalCoordinatorCompany} />
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Goals, Likes & Dislikes */}
                <SectionCard
                  title="Goals, Likes &amp; Dislikes"
                  icon={<Target className="h-4 w-4 text-[var(--color-primary)]" />}
                  action={
                    <Button size="sm" onClick={() => setGoalDialogOpen(true)}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />Add Goal
                    </Button>
                  }
                >
                  {/* Goals */}
                  <div className="space-y-2 mb-4">
                    {!goals?.length ? (
                      <p className="text-xs text-[var(--color-text-muted)]">No goals added yet.</p>
                    ) : (
                      goals.map((g: { id: string; description: string; goalType: string; progress: number }) => (
                        <div key={g.id} className="rounded-lg border border-[var(--color-border)] p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-[var(--color-text)]">{g.description}</p>
                            <Badge variant="secondary" className="shrink-0 text-xs">{g.goalType}</Badge>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-[var(--color-text-muted)]">Progress</span>
                              <span className="text-xs font-medium text-[var(--color-text)]">{g.progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[var(--color-subtle)]">
                              <div
                                className="h-1.5 rounded-full bg-[var(--color-primary)]"
                                style={{ width: `${g.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Likes */}
                  <div className="border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Heart className="h-3.5 w-3.5 text-[var(--color-error)]" />
                      <span className="text-xs font-semibold text-[var(--color-text)]">Likes</span>
                    </div>
                    {!participant.likes?.length ? (
                      <p className="text-xs text-[var(--color-text-muted)]">No likes added.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participant.likes.map((l: { id: string; description: string }) => (
                          <Badge key={l.id} variant="secondary" className="text-xs">{l.description}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dislikes */}
                  <div className="border-t border-[var(--color-border)] pt-4 mt-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      <span className="text-xs font-semibold text-[var(--color-text)]">Dislikes</span>
                    </div>
                    {!participant.dislikes?.length ? (
                      <p className="text-xs text-[var(--color-text-muted)]">No dislikes added.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participant.dislikes.map((d: { id: string; description: string }) => (
                          <Badge key={d.id} variant="secondary" className="text-xs">{d.description}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <SectionCard title="Contact" icon={<Phone className="h-4 w-4 text-[var(--color-primary)]" />}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Mail className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      {participant.primaryEmailAddress}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Phone className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      {participant.primaryPhoneNumber}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      {participant.address}, {participant.suburb}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Support Plan" icon={<Shield className="h-4 w-4 text-[var(--color-primary)]" />}>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    To add information on Support Plan, please submit initial assessment form.
                  </p>
                </SectionCard>

                <SectionCard title="NDIS Plans" icon={<Calendar className="h-4 w-4 text-[var(--color-primary)]" />}>
                  {!participant.ndisPlans?.length ? (
                    <p className="text-xs text-[var(--color-text-muted)]">No NDIS plans.</p>
                  ) : (
                    <div className="space-y-2">
                      {participant.ndisPlans.slice(0, 2).map((plan: { id: string; managementStyle: string; planStartDate: string; planEndDate: string; totalFunding: number; status: string }) => (
                        <div key={plan.id} className="rounded-lg border border-[var(--color-border)] p-3 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-[var(--color-text)]">{plan.managementStyle}</span>
                            <StatusBadge status={plan.status.toLowerCase() as 'active' | 'inactive'} />
                          </div>
                          <p className="mt-1 text-[var(--color-text-muted)]">
                            ${plan.totalFunding.toLocaleString()} · {new Date(plan.planStartDate).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          </TabsContent>

          {/* ── 2. CASE NOTES ── */}
          <TabsContent value="case-notes">
            <SectionCard
              title="Case Notes"
              icon={<ClipboardList className="h-4 w-4 text-[var(--color-primary)]" />}
              action={
                <Button size="sm" onClick={() => setNoteDialogOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />Add Case Note
                </Button>
              }
            >
              {!caseNotes?.length ? (
                <EmptyRows message="No case notes recorded yet." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">Subject</th>
                        <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">Content</th>
                        <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">Date</th>
                        <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">Time</th>
                        <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">Contact</th>
                        <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">Billable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caseNotes.map((n: { id: string; subject?: string | null; content: string; date: string; timeSpent?: string | null; howContacted?: string | null; billable: boolean }) => (
                        <tr key={n.id} className="border-b border-[var(--color-border-subtle)] last:border-0">
                          <td className="py-3 pr-4 text-xs font-medium text-[var(--color-text)]">{n.subject ?? '—'}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-secondary)] max-w-xs truncate">{n.content}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{new Date(n.date).toLocaleDateString('en-AU')}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{n.timeSpent ?? '—'}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{n.howContacted ?? '—'}</td>
                          <td className="py-3 text-xs">{n.billable ? <Badge variant="secondary" className="text-xs">Yes</Badge> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 3. MEDICATION ── */}
          <TabsContent value="medication">
            <SectionCard
              title="Medications"
              icon={<Pill className="h-4 w-4 text-[var(--color-primary)]" />}
              action={
                <Button size="sm" onClick={() => setMedDialogOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />Add Medication
                </Button>
              }
            >
              {!medications?.length ? (
                <EmptyRows message="No medications recorded yet." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        {['Name', 'Dosage', 'Frequency', 'Prescribed By', 'Start', 'End'].map((h) => (
                          <th key={h} className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {medications.map((m: { id: string; medicationName: string; dosage?: string | null; frequency?: string | null; prescribedBy?: string | null; startDate?: string | null; endDate?: string | null }) => (
                        <tr key={m.id} className="border-b border-[var(--color-border-subtle)] last:border-0">
                          <td className="py-3 pr-4 text-xs font-medium text-[var(--color-text)]">{m.medicationName}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{m.dosage ?? '—'}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{m.frequency ?? '—'}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{m.prescribedBy ?? '—'}</td>
                          <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{m.startDate ? new Date(m.startDate).toLocaleDateString('en-AU') : '—'}</td>
                          <td className="py-3 text-xs text-[var(--color-text-muted)]">{m.endDate ? new Date(m.endDate).toLocaleDateString('en-AU') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 4. SHIFT NOTES ── */}
          <TabsContent value="shift-notes">
            <SectionCard title="Shift Notes" icon={<FileText className="h-4 w-4 text-[var(--color-primary)]" />}>
              {!participant.shiftNotes?.length ? (
                <EmptyRows message="No Notes Found! Try adjusting your filters to see more results." />
              ) : (
                <div className="space-y-3">
                  {participant.shiftNotes.map((n: { id: string; content: string; shiftDate: string; workerId?: string | null }) => (
                    <div key={n.id} className="rounded-lg border border-[var(--color-border)] p-4">
                      <p className="text-sm text-[var(--color-text)]">{n.content}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {new Date(n.shiftDate).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 5. TASKS ── */}
          <TabsContent value="tasks">
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Total', count: tasks?.length ?? 0, color: 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]' },
                  { label: 'Overdue', count: 0, color: 'bg-[var(--color-error-dim)] text-[var(--color-error)]' },
                  { label: 'Due Today', count: 0, color: 'bg-[var(--color-warning-dim)] text-[var(--color-warning)]' },
                  { label: 'This Week', count: 0, color: 'bg-[var(--color-subtle)] text-[var(--color-text)]' },
                  { label: 'Upcoming', count: 0, color: 'bg-[var(--color-subtle)] text-[var(--color-text)]' },
                  { label: 'Completed', count: tasks?.filter((t: { status: string }) => t.status === 'Completed').length ?? 0, color: 'bg-[var(--color-success-dim)] text-[var(--color-success)]' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border border-[var(--color-border)] p-4 text-center ${s.color}`}>
                    <p className="text-2xl font-bold">{s.count}</p>
                    <p className="mt-0.5 text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              <SectionCard
                title="Tasks"
                icon={<CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />}
                action={
                  <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />Create Task
                  </Button>
                }
              >
                {!tasks?.length ? (
                  <EmptyRows message="No tasks yet. Create one to get started." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)]">
                          {['Title', 'Due Date', 'Priority', 'Status', 'Category'].map((h) => (
                            <th key={h} className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((t: { id: string; title: string; dueDate?: string | null; priority: string; status: string; category?: string | null }) => (
                          <tr key={t.id} className="border-b border-[var(--color-border-subtle)] last:border-0">
                            <td className="py-3 pr-4 text-xs font-medium text-[var(--color-text)]">{t.title}</td>
                            <td className="py-3 pr-4 text-xs text-[var(--color-text-muted)]">{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-AU') : '—'}</td>
                            <td className="py-3 pr-4"><PriorityBadge priority={t.priority} /></td>
                            <td className="py-3 pr-4"><TaskStatusBadge status={t.status} /></td>
                            <td className="py-3 text-xs text-[var(--color-text-muted)]">{t.category ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          </TabsContent>

          {/* ── 6. FUNDING ── */}
          <TabsContent value="funding">
            <SectionCard
              title="Funding Allocations"
              icon={<DollarSign className="h-4 w-4 text-[var(--color-primary)]" />}
              action={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Funding</Button>}
            >
              {!participant.fundingAllocations?.length ? (
                <EmptyRows message="No funding data found! Add funding setup to get started." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        {['Funding ID', 'Start', 'End', 'Total', 'Allocated', 'Delivered', 'Unallocated', 'Status'].map((h) => (
                          <th key={h} className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participant.fundingAllocations.map((f: { id: string; fundingId: string; startDate: string; endDate: string; totalFunding: number; totalAllocated: number; totalDelivered: number; unallocated: number; status: string }) => (
                        <tr key={f.id} className="border-b border-[var(--color-border-subtle)] last:border-0 text-xs">
                          <td className="py-3 pr-4 font-mono text-[var(--color-text)]">{f.fundingId}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{new Date(f.startDate).toLocaleDateString('en-AU')}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{new Date(f.endDate).toLocaleDateString('en-AU')}</td>
                          <td className="py-3 pr-4 text-[var(--color-text)]">${f.totalFunding.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">${f.totalAllocated.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">${f.totalDelivered.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">${f.unallocated.toLocaleString()}</td>
                          <td className="py-3"><StatusBadge status={f.status.toLowerCase() as 'active' | 'inactive'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 7. FORMS ── */}
          <TabsContent value="forms">
            <SectionCard
              title="Form Submissions"
              icon={<BarChart2 className="h-4 w-4 text-[var(--color-primary)]" />}
              action={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Form</Button>}
            >
              {!participant.formSubmissions?.length ? (
                <EmptyRows message="No form submissions found." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        {['Form Name', 'Status', 'Submitted By', 'Submitted', 'Expiry', 'Version'].map((h) => (
                          <th key={h} className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participant.formSubmissions.map((f: { id: string; formName: string; status: string; submittedBy: string; submittedDate?: string | null; expiryDate?: string | null; version: number }) => (
                        <tr key={f.id} className="border-b border-[var(--color-border-subtle)] last:border-0 text-xs">
                          <td className="py-3 pr-4 font-medium text-[var(--color-text)]">{f.formName}</td>
                          <td className="py-3 pr-4"><Badge variant="secondary" className="text-xs">{f.status}</Badge></td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{f.submittedBy}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{f.submittedDate ? new Date(f.submittedDate).toLocaleDateString('en-AU') : '—'}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{f.expiryDate ? new Date(f.expiryDate).toLocaleDateString('en-AU') : '—'}</td>
                          <td className="py-3 text-[var(--color-text-muted)]">v{f.version}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 8. DOCUMENTS ── */}
          <TabsContent value="documents">
            <SectionCard
              title="Documents"
              icon={<FolderOpen className="h-4 w-4 text-[var(--color-primary)]" />}
              action={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Create Folder</Button>
                  <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Upload</Button>
                </div>
              }
            >
              {!participant.documents?.length ? (
                <EmptyRows message="No documents found! Upload a document to get started." />
              ) : (
                <div className="space-y-2">
                  {participant.documents.map((doc: { id: string; fileName: string; fileType: string; uploadedBy: string; createdAt: string }) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{doc.fileName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{doc.fileType} · {doc.uploadedBy}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 9. RISK ASSESSMENT ── */}
          <TabsContent value="risk">
            <SectionCard
              title="Risk Assessments"
              icon={<AlertTriangle className="h-4 w-4 text-[var(--color-primary)]" />}
              action={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Assessment</Button>}
            >
              {!participant.riskAssessments?.length ? (
                <EmptyRows message="No Data found!" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        {['Form Name', 'Status', 'Likelihood', 'Impact', 'Risk Rating', 'Submitted', 'Expiry'].map((h) => (
                          <th key={h} className="pb-2 text-left text-xs font-medium text-[var(--color-text-muted)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participant.riskAssessments.map((r: { id: string; formName: string; status: string; likelihood?: string | null; impact?: string | null; riskRating?: string | null; submittedDate?: string | null; expiryDate?: string | null }) => (
                        <tr key={r.id} className="border-b border-[var(--color-border-subtle)] last:border-0 text-xs">
                          <td className="py-3 pr-4 font-medium text-[var(--color-text)]">{r.formName}</td>
                          <td className="py-3 pr-4"><Badge variant="secondary" className="text-xs">{r.status}</Badge></td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{r.likelihood ?? '—'}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{r.impact ?? '—'}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{r.riskRating ?? '—'}</td>
                          <td className="py-3 pr-4 text-[var(--color-text-muted)]">{r.submittedDate ? new Date(r.submittedDate).toLocaleDateString('en-AU') : '—'}</td>
                          <td className="py-3 text-[var(--color-text-muted)]">{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-AU') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 10. APPOINTMENTS ── */}
          <TabsContent value="appointments">
            <SectionCard
              title="Appointments"
              icon={<Calendar className="h-4 w-4 text-[var(--color-primary)]" />}
              action={
                <Button size="sm" onClick={() => setApptDialogOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />Appointment
                </Button>
              }
            >
              {!appointments?.length ? (
                <EmptyRows message="No Appointments Found! Schedule an appointment to get started." />
              ) : (
                <div className="space-y-3">
                  {appointments.map((a: { id: string; title: string; appointmentDate: string; appointmentTime?: string | null; location?: string | null; notes?: string | null }) => (
                    <div key={a.id} className="rounded-lg border border-[var(--color-border)] p-4">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-[var(--color-text)]">{a.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(a.appointmentDate).toLocaleDateString('en-AU')}
                          {a.appointmentTime ? ` at ${a.appointmentTime}` : ''}
                        </p>
                      </div>
                      {a.location && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{a.location}</p>}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── 11. SETTINGS ── */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <SectionCard title="Personal Information" icon={<User className="h-4 w-4 text-[var(--color-primary)]" />}>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="First Name" value={participant.firstName} />
                  <InfoRow label="Last Name" value={participant.lastName} />
                  <InfoRow label="Gender" value={participant.gender} />
                  <InfoRow label="DOB" value={new Date(participant.dateOfBirth).toLocaleDateString('en-AU')} />
                  <InfoRow label="Language Spoken" value={participant.languageSpoken} />
                  <InfoRow label="Cultural Background" value={participant.culturalBackground} />
                </div>
              </SectionCard>

              <SectionCard title="Emergency Contact" icon={<Phone className="h-4 w-4 text-[var(--color-primary)]" />}>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Name" value={participant.emergencyContactName} />
                  <InfoRow label="Number" value={participant.emergencyContactNumber} />
                </div>
              </SectionCard>

              <SectionCard title="Additional Settings" icon={<Settings className="h-4 w-4 text-[var(--color-primary)]" />}>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Timezone" value={participant.timezone} />
                  <InfoRow label="Plan Managed By" value={participant.planManagedBy} />
                  <InfoRow label="Status" value={participant.status} />
                  <InfoRow label="Audit Participation" value={participant.auditParticipation ? 'Yes' : 'No'} />
                </div>
              </SectionCard>

              <SectionCard title="Support Coordination" icon={<Shield className="h-4 w-4 text-[var(--color-primary)]" />}>
                <div className="space-y-3">
                  <InfoRow label="Service Support" value={participant.serviceSupport} />
                  {participant.importantAlert && (
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Important Alert</p>
                      <p className="text-sm text-[var(--color-text)] rounded-lg border border-[var(--color-border)] p-3 bg-[var(--color-subtle)]">
                        {participant.importantAlert}
                      </p>
                    </div>
                  )}
                  {participant.shiftInstructions && (
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Shift Instructions</p>
                      <p className="text-sm text-[var(--color-text)] rounded-lg border border-[var(--color-border)] p-3 bg-[var(--color-subtle)]">
                        {participant.shiftInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="External Coordinator" icon={<User className="h-4 w-4 text-[var(--color-primary)]" />}>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Name" value={participant.externalCoordinatorName} />
                  <InfoRow label="Email" value={participant.externalCoordinatorEmail} />
                  <InfoRow label="Phone" value={participant.externalCoordinatorPhone} />
                  <InfoRow label="Company" value={participant.externalCoordinatorCompany} />
                </div>
              </SectionCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── DIALOGS ── */}

      {/* Add Case Note */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Case Note</DialogTitle></DialogHeader>
          <form onSubmit={noteForm.handleSubmit((data) => {
            createCaseNote(data as Record<string, unknown>, {
              onSuccess: () => { toast.success('Case note added'); noteForm.reset(); setNoteDialogOpen(false); },
              onError: () => toast.error('Failed to add case note'),
            });
          })} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Subject</label>
              <Input {...noteForm.register('subject')} placeholder="Subject line" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Content *</label>
              <Textarea {...noteForm.register('content')} rows={4} placeholder="Note content…" />
              {noteForm.formState.errors.content && <p className="mt-1 text-xs text-[var(--color-error)]">{noteForm.formState.errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date</label>
                <Input type="date" {...noteForm.register('date')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Time Spent (HH:MM)</label>
                <Input {...noteForm.register('timeSpent')} placeholder="00:30" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">How Contacted</label>
              <Select onValueChange={(v) => noteForm.setValue('howContacted', v)}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {['Phone', 'Email', 'In-Person', 'Video Call'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Travel (KM)</label>
              <Input {...noteForm.register('travelKm')} placeholder="0" />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={noteForm.handleSubmit((data) => {
              createCaseNote(data as Record<string, unknown>, {
                onSuccess: () => { toast.success('Case note added'); noteForm.reset(); setNoteDialogOpen(false); },
                onError: () => toast.error('Failed to add case note'),
              });
            })} disabled={creatingNote}>
              {creatingNote ? 'Saving…' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Title *</label>
              <Input {...taskForm.register('title')} placeholder="Task title" />
              {taskForm.formState.errors.title && <p className="mt-1 text-xs text-[var(--color-error)]">{taskForm.formState.errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Description</label>
              <Textarea {...taskForm.register('description')} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Due Date</label>
                <Input type="date" {...taskForm.register('dueDate')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Due Time</label>
                <Input type="time" {...taskForm.register('dueTime')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Priority</label>
                <Select defaultValue="Medium" onValueChange={(v) => taskForm.setValue('priority', v as TaskFormData['priority'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Low', 'Medium', 'High'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Status</label>
                <Select defaultValue="Pending" onValueChange={(v) => taskForm.setValue('status', v as TaskFormData['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Pending', 'In Progress', 'Completed'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Category</label>
              <Input {...taskForm.register('category')} placeholder="Category" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Staff Notes</label>
              <Textarea {...taskForm.register('staffNotes')} rows={2} placeholder="Internal notes (not visible to participant)" />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={taskForm.handleSubmit((data) => {
              createTask(data as Record<string, unknown>, {
                onSuccess: () => { toast.success('Task created'); taskForm.reset(); setTaskDialogOpen(false); },
                onError: () => toast.error('Failed to create task'),
              });
            })} disabled={creatingTask}>
              {creatingTask ? 'Saving…' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Goal</DialogTitle></DialogHeader>
          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Description *</label>
              <Textarea {...goalForm.register('description')} rows={3} placeholder="Goal description" />
              {goalForm.formState.errors.description && <p className="mt-1 text-xs text-[var(--color-error)]">{goalForm.formState.errors.description.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Goal Type *</label>
              <Select onValueChange={(v) => goalForm.setValue('goalType', v as GoalFormData['goalType'])}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short Term">Short Term</SelectItem>
                  <SelectItem value="Long Term">Long Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Progress (%)</label>
              <Input type="number" min="0" max="100" {...goalForm.register('progress', { valueAsNumber: true })} placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Achievement Notes</label>
              <Textarea {...goalForm.register('achievementNotes')} rows={2} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Hurdles</label>
              <Textarea {...goalForm.register('hurdles')} rows={2} />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
            <Button onClick={goalForm.handleSubmit((data) => {
              createGoal(data as Record<string, unknown>, {
                onSuccess: () => { toast.success('Goal added'); goalForm.reset(); setGoalDialogOpen(false); },
                onError: () => toast.error('Failed to add goal'),
              });
            })} disabled={creatingGoal}>
              {creatingGoal ? 'Saving…' : 'Add Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication */}
      <Dialog open={medDialogOpen} onOpenChange={setMedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Medication Name *</label>
              <Input {...medForm.register('medicationName')} placeholder="e.g. Paracetamol" />
              {medForm.formState.errors.medicationName && <p className="mt-1 text-xs text-[var(--color-error)]">{medForm.formState.errors.medicationName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Dosage</label>
                <Input {...medForm.register('dosage')} placeholder="500mg" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Frequency</label>
                <Input {...medForm.register('frequency')} placeholder="Twice daily" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Prescribed By</label>
              <Input {...medForm.register('prescribedBy')} placeholder="Dr. Name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Start Date</label>
                <Input type="date" {...medForm.register('startDate')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">End Date</label>
                <Input type="date" {...medForm.register('endDate')} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Notes</label>
              <Textarea {...medForm.register('notes')} rows={2} />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedDialogOpen(false)}>Cancel</Button>
            <Button onClick={medForm.handleSubmit((data) => {
              createMedication(data as Record<string, unknown>, {
                onSuccess: () => { toast.success('Medication added'); medForm.reset(); setMedDialogOpen(false); },
                onError: () => toast.error('Failed to add medication'),
              });
            })} disabled={creatingMed}>
              {creatingMed ? 'Saving…' : 'Add Medication'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Appointment */}
      <Dialog open={apptDialogOpen} onOpenChange={setApptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Appointment</DialogTitle></DialogHeader>
          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Title *</label>
              <Input {...apptForm.register('title')} placeholder="Appointment title" />
              {apptForm.formState.errors.title && <p className="mt-1 text-xs text-[var(--color-error)]">{apptForm.formState.errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date *</label>
                <Input type="date" {...apptForm.register('appointmentDate')} />
                {apptForm.formState.errors.appointmentDate && <p className="mt-1 text-xs text-[var(--color-error)]">{apptForm.formState.errors.appointmentDate.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Time</label>
                <Input type="time" {...apptForm.register('appointmentTime')} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Location</label>
              <Input {...apptForm.register('location')} placeholder="e.g. Level 2, Health Centre" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Notes</label>
              <Textarea {...apptForm.register('notes')} rows={2} />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApptDialogOpen(false)}>Cancel</Button>
            <Button onClick={apptForm.handleSubmit((data) => {
              createAppointment(data as Record<string, unknown>, {
                onSuccess: () => { toast.success('Appointment added'); apptForm.reset(); setApptDialogOpen(false); },
                onError: () => toast.error('Failed to add appointment'),
              });
            })} disabled={creatingAppt}>
              {creatingAppt ? 'Saving…' : 'Add Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
