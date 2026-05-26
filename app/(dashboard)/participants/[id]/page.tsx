'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, FileText, Mail, MapPin, Phone, Plus, Shield,
  User, Pill, ClipboardList, DollarSign, BarChart2, FolderOpen,
  AlertTriangle, Settings, Target, Heart, ThumbsDown, CheckCircle2, Search
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

function SnapshotCell({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-[var(--color-primary)]" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
      </div>
      {value ? (
        <span className="text-xs font-semibold text-[var(--color-text)] leading-snug">{value}</span>
      ) : (
        <span className="text-[10px] text-[var(--color-primary)] font-medium">Add information ↗</span>
      )}
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
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [riskMgtOpen, setRiskMgtOpen] = useState(false);
  const [riskRatingOpen, setRiskRatingOpen] = useState(false);
  const [riskMitigationOpen, setRiskMitigationOpen] = useState(false);
  const [taskView, setTaskView] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());

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
      <div className="flex-1 px-6 py-4 min-h-0">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList variant="line" className="mb-6 h-10 w-full max-w-full overflow-x-auto scrollbar-hide whitespace-nowrap [&>button]:inline-flex [&>button]:shrink-0">
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
          <TabsContent value="overview" className="data-[state=active]:block data-[state=inactive]:hidden min-h-[200px]">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              {/* ── Left: Quick Snapshot ── */}
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="flex items-center justify-between bg-[var(--color-primary)] px-5 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Quick Snapshot</h3>
                      <p className="text-[11px] text-white/60">Essential participant information</p>
                    </div>
                    <Button size="sm" variant="secondary" className="text-xs h-7">
                      Add information ↗
                    </Button>
                  </div>
                  <div className="bg-[var(--color-surface)] grid grid-cols-3 gap-1.5 p-2">
                    <SnapshotCell icon={MapPin} label="Address" value={[participant.address, participant.suburb, participant.state, participant.postcode].filter(Boolean).join(', ')} />
                    <SnapshotCell icon={User} label="Primary Disability" value={null} />
                    <SnapshotCell icon={AlertTriangle} label="Emergency Contact Name" value={participant.emergencyContactName} />
                    <SnapshotCell icon={Phone} label="Emergency Phone" value={participant.emergencyContactNumber} />
                    <SnapshotCell icon={Phone} label="Participant Phone" value={participant.primaryPhoneNumber} />
                    <SnapshotCell icon={Mail} label="Participant Email" value={participant.primaryEmailAddress} />
                    <SnapshotCell icon={Shield} label="NDIS No." value={participant.ndisNumber} />
                    <SnapshotCell icon={Calendar} label="Date of Birth" value={participant.dateOfBirth ? new Date(participant.dateOfBirth).toLocaleDateString('en-AU') : null} />
                    <SnapshotCell icon={Calendar} label="Service Start Date" value={participant.serviceStartDate ? new Date(participant.serviceStartDate).toLocaleDateString('en-AU') : null} />
                    <SnapshotCell icon={Calendar} label="Service End Date" value={participant.serviceEndDate ? new Date(participant.serviceEndDate).toLocaleDateString('en-AU') : null} />
                    <SnapshotCell icon={User} label="Public Guardian" value={null} />
                    <SnapshotCell icon={Shield} label="Child Safety Officer" value={null} />
                    <SnapshotCell icon={User} label="Plan Nominee" value={participant.planNominee} />
                    <SnapshotCell icon={User} label="External Coordinator Name" value={participant.externalCoordinatorName} />
                    <SnapshotCell icon={Mail} label="External Coordinator Email" value={participant.externalCoordinatorEmail} />
                    <SnapshotCell icon={Phone} label="External Coordinator Phone" value={participant.externalCoordinatorPhone} />
                    <SnapshotCell icon={User} label="External Coordinator Company" value={participant.externalCoordinatorCompany} />
                  </div>
                </div>
              </div>

              {/* ── Right: Goals, Likes & Dislikes ── */}
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="bg-[var(--color-primary)] px-4 py-3">
                    <h3 className="text-sm font-semibold text-white">Goals, Likes &amp; Dislikes</h3>
                    <p className="text-[11px] text-white/60">Participant preferences and goals</p>
                  </div>
                  <div className="bg-[var(--color-surface)] p-4 space-y-4">
                    {/* Goals */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[var(--color-text)]">Goals</span>
                        <Button size="sm" className="h-7 text-xs" onClick={() => setGoalDialogOpen(true)}>
                          Add Goal
                        </Button>
                      </div>
                      {!goals?.length ? (
                        <p className="text-xs text-center text-[var(--color-text-muted)] py-3">No goals added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {goals.map((g: { id: string; description: string; goalType: string; progress: number }) => (
                            <div key={g.id} className="rounded-lg border border-[var(--color-border)] p-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs text-[var(--color-text)]">{g.description}</p>
                                <Badge variant="secondary" className="shrink-0 text-[10px]">{g.goalType}</Badge>
                              </div>
                              <div className="mt-1.5">
                                <div className="h-1 rounded-full bg-[var(--color-subtle)]">
                                  <div className="h-1 rounded-full bg-[var(--color-primary)]" style={{ width: `${g.progress}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Likes */}
                    <div className="border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5 text-[var(--color-error)]" />
                          <span className="text-xs font-semibold text-[var(--color-text)]">Likes</span>
                        </div>
                      </div>
                      {!participant.likes?.length ? (
                        <p className="text-xs text-center text-[var(--color-text-muted)] py-2">No likes added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {participant.likes.map((l: { id: string; description: string }) => (
                            <Badge key={l.id} variant="secondary" className="text-xs">{l.description}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dislikes */}
                    <div className="border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ThumbsDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                        <span className="text-xs font-semibold text-[var(--color-text)]">Dislikes</span>
                      </div>
                      {!participant.dislikes?.length ? (
                        <p className="text-xs text-center text-[var(--color-text-muted)] py-2">No dislikes added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {participant.dislikes.map((d: { id: string; description: string }) => (
                            <Badge key={d.id} variant="secondary" className="text-xs">{d.description}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Support Plan ── */}
              <div className="col-span-1 lg:col-span-3 w-full">
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="bg-[var(--color-primary)] px-4 py-3">
                    <h3 className="text-sm font-semibold text-white">Support Plan</h3>
                    <p className="text-[11px] text-white/60">Comprehensive support plan information</p>
                  </div>
                  <div className="bg-[var(--color-surface)] p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <SnapshotCell icon={Calendar} label="Date of Birth" value={participant.dateOfBirth ? new Date(participant.dateOfBirth).toLocaleDateString('en-AU') : null} />
                      <SnapshotCell icon={Shield} label="NDIS Plan" value={participant.ndisPlans?.[0]?.managementStyle} />
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        To add information on Support Plan, Please submit initial assessment form
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Risk Assessment ── */}
              <div className="col-span-1 lg:col-span-3 w-full">
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="bg-[var(--color-primary)] px-4 py-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Risk Assessment</h3>
                      <p className="text-[11px] text-white/60">Participant risk evaluation</p>
                    </div>
                    <Button size="sm" variant="secondary" className="h-7 text-xs">Select Form</Button>
                  </div>
                  <div className="bg-[var(--color-surface)]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]">Question</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]">Status</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]">Likelihood</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]">Impact</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-text-muted)]">Risk Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center">
                              <span className="text-xs text-[var(--color-error)]">Please select risk form!</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* ── 2. CASE NOTES ── */}
          <TabsContent value="case-notes" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* ── Left: Add Case Note Form ── */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white shadow-sm">
                      {initials}
                    </div>
                    <h3 className="text-base font-semibold text-[var(--color-text)]">Add Case Note</h3>
                  </div>

                  <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); setNoteDialogOpen(true); }}>
                    {/* Subject */}
                    <div>
                      <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Subject Line</label>
                      <Input 
                        placeholder="Enter subject..." 
                        className="w-full h-11 bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                        {...noteForm.register('subject')}
                      />
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                      <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Case Note</label>
                      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)] shadow-sm">
                        {/* Toolbar */}
                        <div className="flex items-center gap-1 px-3 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                          <select className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 outline-none text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors">
                            <option>Paragraph</option>
                            <option>Heading 1</option>
                            <option>Heading 2</option>
                          </select>
                          <div className="w-px h-5 bg-[var(--color-border)] mx-2" />
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] font-bold transition-colors" title="Bold">B</button>
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] italic transition-colors" title="Italic">I</button>
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] underline transition-colors" title="Underline">U</button>
                          <div className="w-px h-5 bg-[var(--color-border)] mx-2" />
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] transition-colors" title="Bullet list">•</button>
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] transition-colors" title="Numbered list">1.</button>
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] transition-colors" title="Quote">"</button>
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text)] transition-colors" title="Code">&lt;/&gt;</button>
                          <div className="flex-1" />
                          <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text-muted)] transition-colors" title="More options">⋮</button>
                        </div>
                        <Textarea 
                          placeholder="Enter case note here..." 
                          className="border-0 rounded-none min-h-[140px] resize-none bg-transparent px-4 py-3 text-sm"
                          {...noteForm.register('content')}
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Date</label>
                      <Input 
                        type="date" 
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full h-11 bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                        {...noteForm.register('date')}
                      />
                    </div>

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-5 text-center bg-[var(--color-subtle)] hover:bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-all cursor-pointer group">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-dim)] flex items-center justify-center group-hover:bg-[var(--color-primary)] transition-colors">
                          <svg className="w-5 h-5 text-[var(--color-primary)] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">PDF, DOC, DOCX, CSV, XLSX, XLS, PNG, JPG, JPEG, GIF, ZIP <span className="text-[var(--color-primary)] font-medium">up to 5MB</span></p>
                      </div>
                    </div>

                    {/* Grid Fields */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Time Spent</label>
                        <Input placeholder="00:00" className="h-11 bg-[var(--color-surface)] border-[var(--color-border)]" {...noteForm.register('timeSpent')} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">How Contacted</label>
                        <Select {...noteForm.register('howContacted')}>
                          <SelectTrigger className="h-11 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="In Person">In Person</SelectItem>
                            <SelectItem value="Video Call">Video Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Travel (KM)</label>
                        <Input placeholder="0" className="h-11 bg-[var(--color-surface)] border-[var(--color-border)]" {...noteForm.register('travelKm')} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Non-direct Support</label>
                        <Select {...noteForm.register('nonDirectSupport')}>
                          <SelectTrigger className="h-11 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-8 py-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" className="peer sr-only" {...noteForm.register('billable')} />
                          <div className="w-11 h-6 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all" />
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text)]">Billable</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" className="peer sr-only" {...noteForm.register('showToWorker')} />
                          <div className="w-11 h-6 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all" />
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text)]">Show to Worker</span>
                      </label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                      <Button type="submit" className="h-11 px-8 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium">
                        Submit Case Note
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Case Notes List */}
                {!caseNotes?.length ? (
                  <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                    <p className="text-sm font-medium text-[var(--color-text)] mb-1">No Data Found!</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Get started by creating a new case Note</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {caseNotes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">{n.subject || 'Case Note'}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">{new Date(n.date).toLocaleDateString('en-AU')}</p>
                          </div>
                          {n.billable && <Badge variant="secondary" className="text-xs">Billable</Badge>}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-2">{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Support Team ── */}
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-6">Support Team</h3>
                  
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-[var(--color-text)] mb-2">No Workers Assigned</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Get started by assigning a new worker</p>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* ── 3. MEDICATION ── */}
          <TabsContent value="medication" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="space-y-5">
              
              {/* Warning Banner */}
              <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4">
                <p className="text-xs text-[var(--color-warning)]">
                  <span className="font-semibold">Warning:</span> Medication listing must be added/updated by an appropriate medical practitioner
                </p>
              </div>

              {/* Header with Dropdown and Add Button */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Select defaultValue="listing">
                    <SelectTrigger className="w-[180px] h-10 bg-[var(--color-surface)] border-[var(--color-border)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listing">Medication Listing</SelectItem>
                      <SelectItem value="history">Medication History</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-[var(--color-text-muted)]">{medications?.length || 0} of {medications?.length || 0} medications</span>
                </div>
                <Button onClick={() => setMedDialogOpen(true)} className="h-10 px-4 bg-[var(--color-primary)] text-white">
                  <Plus className="mr-2 h-4 w-4" />Add Medication
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <Input 
                  placeholder="Search medications by name or type..." 
                  className="pl-10 h-11 bg-[var(--color-surface)] border-[var(--color-border)]"
                />
              </div>

              {/* Medications Table */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">Medication Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">Dosage</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">Schedule</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!medications?.length ? (
                        <tr className="border-b border-[var(--color-border-subtle)]">
                          <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">N/A</td>
                          <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">PRN</td>
                          <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">N/A</td>
                          <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">As Needed</td>
                          <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">N/A</td>
                          <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">-</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-[var(--color-error)]">Cancel</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-[var(--color-primary)]">Clone</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-[var(--color-primary)]">Edit</Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        medications.map((m) => (
                          <tr key={m.id} className="border-b border-[var(--color-border-subtle)] last:border-0">
                            <td className="px-4 py-3 text-xs font-medium text-[var(--color-text)]">{m.medicationName}</td>
                            <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{m.medicineType || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{m.dosage || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{m.frequency || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{m.startDate ? new Date(m.startDate).toLocaleDateString('en-AU') : '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{m.endDate ? new Date(m.endDate).toLocaleDateString('en-AU') : '-'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-[var(--color-error)]">Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {!medications?.length && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">No medications found</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Add a new medication record using the "Add Medication" button above</p>
                  </div>
                )}
              </div>

              {/* Add Medication Form (shown when medDialogOpen) */}
              {medDialogOpen && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <h3 className="text-base font-semibold text-[var(--color-text)]">Add New Medication</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setMedDialogOpen(false)}>Cancel</Button>
                      <Button size="sm" onClick={() => setMedDialogOpen(false)} className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white h-9">
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save
                      </Button>
                    </div>
                  </div>
                  
                  <form className="p-6 space-y-6">
                    {/* Warning Banner */}
                    <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 flex items-start gap-3">
                      <svg className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-[var(--color-warning)]">
                        <span className="font-semibold">Warning:</span> Medication listing must be added/ updated by an appropriate medical practitioner
                      </p>
                    </div>

                    {/* Basic Info Row 1 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Medicine Type <span className="text-[var(--color-error)]">*</span></label>
                        <Select>
                          <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prescription">Prescription</SelectItem>
                            <SelectItem value="otc">Over the Counter</SelectItem>
                            <SelectItem value="supplement">Supplement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Medicine Name <span className="text-[var(--color-error)]">*</span></label>
                        <Input placeholder="Enter name..." className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Start Date <span className="text-[var(--color-error)]">*</span></label>
                        <div className="relative">
                          <Input type="date" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] pr-10" />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Basic Info Row 2 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Event <span className="text-[var(--color-error)]">*</span></label>
                        <Select>
                          <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="prn">PRN (As Needed)</SelectItem>
                            <SelectItem value="one_time">One Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">End Date</label>
                        <div className="relative">
                          <Input type="date" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] pr-10" />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Dosage Information Section */}
                    <div className="border-t border-[var(--color-border)] pt-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-blue-500 rounded-full" />
                        <h4 className="text-sm font-semibold text-blue-600">Dosage Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Quantity <span className="text-[var(--color-error)]">*</span></label>
                          <Input placeholder="Enter quantity (0-9)" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Unit of Measure <span className="text-[var(--color-error)]">*</span></label>
                          <Select>
                            <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mg">mg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="tablet">tablet(s)</SelectItem>
                              <SelectItem value="capsule">capsule(s)</SelectItem>
                              <SelectItem value="drop">drop(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Instructions & Side Effects */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-green-500 rounded-full" />
                          <h4 className="text-sm font-semibold text-green-600">Medication Instructions</h4>
                        </div>
                        <Textarea 
                          placeholder="Write details of how and when the medication should be administered..." 
                          className="min-h-[100px] bg-[var(--color-surface)] border-[var(--color-border)] resize-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-orange-500 rounded-full" />
                          <h4 className="text-sm font-semibold text-orange-600">Side Effects</h4>
                        </div>
                        <Textarea 
                          placeholder="Write any known or observed side effects of this medicine..." 
                          className="min-h-[100px] bg-[var(--color-surface)] border-[var(--color-border)] resize-none"
                        />
                      </div>
                    </div>

                    {/* Allergies Section */}
                    <div className="border border-[var(--color-error)]/30 rounded-lg bg-[var(--color-error)]/5 p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="h-5 w-5 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-[var(--color-error)]">Allergies & Adverse Drug Reactions (ADRs)</h4>
                        <span className="text-xs text-[var(--color-text-muted)]">(for this medication)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-xs font-medium text-[var(--color-error)] mb-1.5 flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Medicines Type/Name
                          </label>
                          <Input placeholder="e.g., Penicillin, Aspirin..." className="h-10 bg-white border-[var(--color-error)]/30 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--color-error)] mb-1.5 flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Allergy Name
                          </label>
                          <Input placeholder="e.g., Drug Allergy, Food Allergy..." className="h-10 bg-white border-[var(--color-error)]/30 text-sm" />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="text-xs font-medium text-[var(--color-error)] mb-1.5 flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Reaction Type
                        </label>
                        <Input placeholder="e.g., Rash, Nausea, Difficulty Breathing..." className="h-10 bg-white border-[var(--color-error)]/30 text-sm" />
                      </div>
                      
                      <div className="mt-4">
                        <label className="text-xs font-medium text-[var(--color-primary)] mb-1.5 flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Allergy Notes
                        </label>
                        <Textarea 
                          placeholder="Write down any additional details, severity, date of occurrence..." 
                          className="min-h-[80px] bg-white border-[var(--color-error)]/30 resize-none"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── 4. SHIFT NOTES ── */}
          <TabsContent value="shift-notes" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="space-y-5">
              
              {/* Filters Card */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">Filters</h3>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Filter By Shift Date (Max 3 Months)</label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        defaultValue="25/02/2026 - 26/05/2026"
                        className="h-10 bg-[var(--color-bg)] border-[var(--color-border)] pr-10"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Worker Filter */}
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Filter By Worker</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)] border-[var(--color-border)]">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="worker1">Worker 1</SelectItem>
                        <SelectItem value="worker2">Worker 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] min-h-[300px] flex flex-col">
                {!participant.shiftNotes?.length ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-subtle)] flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-[var(--color-text-muted)]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text)] mb-1">No Notes Found!</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Try adjusting your filters to see more results</p>
                  </div>
                ) : (
                  <div className="p-5 space-y-3">
                    {participant.shiftNotes.map((n) => (
                      <div key={n.id} className="rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
                        <p className="text-sm text-[var(--color-text)]">{n.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {new Date(n.shiftDate).toLocaleDateString('en-AU')}
                          </p>
                          {n.workerId && (
                            <Badge variant="secondary" className="text-xs">Worker: {n.workerId}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── 5. TASKS ── */}
          <TabsContent value="tasks" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[var(--color-primary)] rounded-full" />
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-text)]">Tasks</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Manage tasks for {participant.firstName} {participant.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setTaskDialogOpen(true)} className="h-9 bg-[var(--color-primary)] text-white">
                    <Plus className="mr-1.5 h-4 w-4" />Create Task
                  </Button>
                  <button
                    onClick={() => setTaskView('list')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      taskView === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-subtle)]'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    List
                  </button>
                  <button
                    onClick={() => setTaskView('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      taskView === 'calendar'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-subtle)]'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Total Tasks', count: tasks?.length ?? 0, cls: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { label: 'Overdue', count: 0, cls: 'bg-red-50 text-red-500 border-red-100' },
                  { label: 'Due Today', count: 0, cls: 'bg-orange-50 text-orange-500 border-orange-100' },
                  { label: 'This Week', count: 0, cls: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
                  { label: 'Upcoming', count: tasks?.filter((t: {status: string}) => t.status !== 'Completed').length ?? 0, cls: 'bg-purple-50 text-purple-500 border-purple-100' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border p-4 text-center ${s.cls}`}>
                    <p className="text-3xl font-bold">{s.count}</p>
                    <p className="mt-1 text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filters Row */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 flex flex-wrap items-center gap-4">
                {[{label:'Time'},{label:'Status'},{label:'Priority'},{label:'Category'}].map(f => (
                  <div key={f.label} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-text)]">{f.label}:</span>
                    <Select defaultValue="all">
                      <SelectTrigger className="h-8 w-28 text-xs bg-[var(--color-bg)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* List View */}
              {taskView === 'list' && (
                <div className="space-y-3">
                  {!tasks?.length ? (
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-subtle)] flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-[var(--color-text-muted)]" />
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text)] mb-1">No tasks found</p>
                      <p className="text-xs text-[var(--color-text-muted)] mb-4">Create a task to get started</p>
                      <Button onClick={() => setTaskDialogOpen(true)} className="h-9 bg-[var(--color-primary)] text-white">
                        <Plus className="mr-1.5 h-4 w-4" />Create Task
                      </Button>
                    </div>
                  ) : (
                    tasks.map((t: { id: string; title: string; description?: string | null; dueDate?: string | null; priority: string; status: string; category?: string | null; staffNotes?: string | null }) => (
                      <div key={t.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>{t.status}</span>
                            <PriorityBadge priority={t.priority} />
                            {t.category && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-subtle)] text-[var(--color-text-muted)]">{t.category}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            {t.dueDate && (
                              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
                                {new Date(t.dueDate).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' })}
                              </span>
                            )}
                            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">{t.title}</p>
                        {t.description && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-0.5">Description</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{t.description}</p>
                          </div>
                        )}
                        {t.staffNotes && (
                          <p className="mt-2 text-xs text-[var(--color-text-muted)]">Staff Notes: <span className="text-[var(--color-text)]">{t.staffNotes}</span></p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Calendar View */}
              {taskView === 'calendar' && (() => {
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth();
                const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
                  i < firstDay ? null : i - firstDay + 1
                );
                return (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                      <h3 className="text-base font-semibold text-[var(--color-text)]">{monthName}</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-[var(--color-subtle)] rounded-lg transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={() => setCalendarDate(new Date())} className="px-3 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors">Today</button>
                        <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-[var(--color-subtle)] rounded-lg transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} className="px-3 py-2 text-center text-xs font-semibold text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-subtle)]">{d}</div>
                      ))}
                      {cells.map((day, i) => {
                        const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                        const dayTasks = day ? tasks?.filter((t: {dueDate?: string | null}) => {
                          if (!t.dueDate) return false;
                          const d = new Date(t.dueDate);
                          return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                        }) ?? [] : [];
                        return (
                          <div key={i} className={`min-h-[90px] p-2 border-b border-r border-[var(--color-border)] last:border-r-0 ${
                            isToday ? 'bg-[var(--color-primary)]/5 ring-2 ring-inset ring-[var(--color-primary)]/30' : 'bg-[var(--color-bg)]'
                          } ${!day ? 'bg-[var(--color-subtle)]' : ''}`}>
                            {day && (
                              <>
                                <p className={`text-xs font-medium mb-1 ${
                                  isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                                }`}>{day}</p>
                                {dayTasks.map((t: {id: string; title: string}) => (
                                  <div key={t.id} className="text-[11px] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 mb-0.5 truncate">{t.title}</div>
                                ))}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Create Task Dialog */}
              {taskDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setTaskDialogOpen(false)}>
                  <div className="w-full max-w-lg bg-[var(--color-bg)] rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-primary)] rounded-t-xl">
                      <h3 className="text-base font-semibold text-white">Create New Task</h3>
                      <button onClick={() => setTaskDialogOpen(false)} className="text-white/80 hover:text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <form className="p-6 space-y-4" onSubmit={taskForm.handleSubmit((data) => { createTask(data, { onSuccess: () => { setTaskDialogOpen(false); taskForm.reset(); } }); })}>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Title <span className="text-[var(--color-error)]">*</span></label>
                        <Input placeholder="Enter task title" className="h-10 bg-[var(--color-surface)] border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30" {...taskForm.register('title')} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Description</label>
                        <Textarea placeholder="Enter task description" className="min-h-[80px] bg-[var(--color-surface)] resize-none" {...taskForm.register('description')} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Due Date <span className="text-[var(--color-error)]">*</span></label>
                          <Input type="date" className="h-10 bg-[var(--color-surface)]" {...taskForm.register('dueDate')} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Due Time</label>
                          <Input type="time" className="h-10 bg-[var(--color-surface)]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Priority</label>
                          <Select defaultValue="Medium" onValueChange={v => taskForm.setValue('priority', v as 'Low'|'Medium'|'High')}>
                            <SelectTrigger className="h-10 bg-[var(--color-surface)]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Status</label>
                          <Select defaultValue="Pending" onValueChange={v => taskForm.setValue('status', v as 'Pending'|'In Progress'|'Completed')}>
                            <SelectTrigger className="h-10 bg-[var(--color-surface)]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Category</label>
                          <Select onValueChange={v => taskForm.setValue('category', v)}>
                            <SelectTrigger className="h-10 bg-[var(--color-surface)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="personal care">Personal Care</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="transport">Transport</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-text)] mb-1.5 block">Staff Notes</label>
                        <Textarea placeholder="Internal notes (not visible to participant)" className="min-h-[70px] bg-[var(--color-surface)] resize-none" {...taskForm.register('staffNotes')} />
                      </div>
                      <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
                        <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={creatingTask} className="bg-[var(--color-primary)] text-white">
                          {creatingTask ? 'Creating...' : 'Create Task'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </TabsContent>

          {/* ── 6. FUNDING ── */}
          <TabsContent value="funding" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-9 gap-4 px-5 py-3 bg-[var(--color-subtle)] border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]">
                <div>Funding Id</div>
                <div>Start Date</div>
                <div>End Date</div>
                <div>Total Funding</div>
                <div>Total Allocated</div>
                <div>Total Delivered</div>
                <div>Unallocated</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Empty State */}
              <div className="min-h-[280px] flex flex-col items-center justify-center p-8">
                <div className="w-14 h-14 rounded-full bg-[var(--color-subtle)] flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-[var(--color-text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-1">No funding data found!</p>
                <p className="text-xs text-[var(--color-text-muted)]">Add funding setup to get started</p>
              </div>
            </div>
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
          <TabsContent value="documents" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">Documents</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 px-4 border-[var(--color-border)]">
                    <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Create Folder
                  </Button>
                  <Button size="sm" className="h-9 px-4 bg-[var(--color-primary)] text-white" onClick={() => setDocDialogOpen(true)}>
                    <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Document
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <Input 
                    placeholder="Search files and folders..." 
                    className="pl-10 h-10 bg-[var(--color-bg)] border-[var(--color-border)]"
                  />
                </div>
                <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <button className="p-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-subtle)] transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Empty State */}
              <div className="min-h-[320px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-xl bg-[var(--color-subtle)] flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-[var(--color-text)] mb-1">No documents found!</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-5">Upload a document to get started</p>
                <Button className="h-10 px-5 bg-[var(--color-primary)] text-white" onClick={() => setDocDialogOpen(true)}>
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Your First Document
                </Button>
              </div>

              {/* Upload New File Modal */}
              {docDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDocDialogOpen(false)}>
                  <div className="w-full max-w-md bg-[var(--color-bg)] rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-primary)] rounded-t-lg">
                      <h3 className="text-sm font-semibold text-white">Upload New File</h3>
                      <button onClick={() => setDocDialogOpen(false)} className="text-white/80 hover:text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    
                    <form className="p-5 space-y-4">
                      {/* File Name */}
                      <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1 block">File Name</label>
                        <Input className="h-9 bg-[var(--color-surface)] border-[var(--color-border)]" />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Category</label>
                        <Select>
                          <SelectTrigger className="h-9 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Documents</SelectItem>
                            <SelectItem value="inactive">Inactive Plan Documents</SelectItem>
                            <SelectItem value="medical">Medical Documents</SelectItem>
                            <SelectItem value="intake">Intake Related Documents</SelectItem>
                            <SelectItem value="reporting">Reporting Documents</SelectItem>
                            <SelectItem value="other">Other Documents</SelectItem>
                            <SelectItem value="general">General Documents</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-[var(--color-border)]" />
                          <span className="text-xs text-[var(--color-text)]">Show to Worker</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-[var(--color-border)]" />
                          <span className="text-xs text-[var(--color-text)]">Set Expiry Date</span>
                        </label>
                      </div>

                      {/* File Upload Area */}
                      <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center bg-[var(--color-subtle)] hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-8 w-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">
                            <span className="text-[var(--color-primary)] font-medium">Upload a file</span>
                            <span className="text-[var(--color-text-muted)]"> or drag and drop</span>
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            PNG,JPG,JPEG,GIF,PDF,DOC,DOCX,XLSX,CSV,XLS up to 20MB
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setDocDialogOpen(false)} className="h-8 px-4">Cancel</Button>
                        <Button type="button" size="sm" onClick={() => setDocDialogOpen(false)} className="h-8 px-4 bg-[var(--color-primary)] text-white">Upload</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── 9. RISK ASSESSMENT ── */}
          <TabsContent value="risk" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Risk Assessment
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-sm font-medium hover:bg-[var(--color-subtle)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Risk Rating
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setRiskMgtOpen(true)} className="h-9 px-4">Risk MGT</Button>
                <Button variant="outline" size="sm" onClick={() => setRiskRatingOpen(true)} className="h-9 px-4">Risk Rating</Button>
                <Button variant="outline" size="sm" onClick={() => setRiskMitigationOpen(true)} className="h-9 px-4">Risk Mitigation</Button>
              </div>

              {/* Filters Row */}
              <div className="flex items-center justify-between gap-4">
                <Select>
                  <SelectTrigger className="h-10 w-48 bg-[var(--color-surface)] border-[var(--color-border)]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <Input placeholder="Search" className="pl-10 h-10 w-48 bg-[var(--color-surface)] border-[var(--color-border)]" />
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="grid grid-cols-10 gap-4 px-5 py-3 bg-[var(--color-subtle)] border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]">
                  <div className="col-span-1">Form Name</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Created By</div>
                  <div className="col-span-1">Submitted Date</div>
                  <div className="col-span-1">Last Updated By</div>
                  <div className="col-span-1">Last Updated Date</div>
                  <div className="col-span-1">Expiry Date</div>
                  <div className="col-span-1">Version</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {/* Empty State */}
                <div className="py-16 flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm text-[var(--color-error)]">No Data found!</span>
                </div>
              </div>

              {/* Risk MGT Modal */}
              {riskMgtOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRiskMgtOpen(false)}>
                  <div className="w-full max-w-lg bg-[var(--color-bg)] rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-primary)] rounded-t-lg">
                      <h3 className="text-sm font-semibold text-white">Risk MGT</h3>
                      <button onClick={() => setRiskMgtOpen(false)} className="text-white/80 hover:text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 relative">
                          <div className="absolute w-8 h-8 bg-pink-500 rounded transform rotate-45 -translate-x-2 translate-y-2" />
                          <div className="absolute w-8 h-8 bg-yellow-400 rounded transform rotate-45 translate-x-2 translate-y-2" />
                          <div className="absolute w-8 h-8 bg-teal-400 rounded transform rotate-45 translate-x-4" />
                          <div className="absolute w-8 h-8 bg-purple-600 rounded transform rotate-45 translate-x-2 -translate-y-2" />
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-center text-[var(--color-text)] mb-1">Control Activities</h4>
                      <h4 className="text-xl font-bold text-center text-[var(--color-text)] mb-6">Monitoring and Evaluation</h4>
                      <div className="space-y-4">
                        <div className="relative bg-gray-100 rounded-lg p-4 pr-8">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-600 rounded text-white text-xs flex items-center justify-center font-bold -ml-3">01</div>
                          <p className="font-semibold text-sm text-[var(--color-text)]">Risk Identification</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Use Risk Assessment template to assess and records risk details</p>
                        </div>
                        <div className="relative bg-gray-100 rounded-lg p-4 pl-8">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-600 rounded text-white text-xs flex items-center justify-center font-bold -mr-3">02</div>
                          <p className="font-semibold text-sm text-[var(--color-text)] text-center">Risk Assessment</p>
                          <p className="text-xs text-[var(--color-text-muted)] text-center">Control Matrix (Use RAM to determine risk ratings based on risks' impact and likelihood)</p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" size="sm" onClick={() => setRiskMgtOpen(false)} className="h-8 px-4 border-red-400 text-red-500 hover:bg-red-50">Close</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Rating Modal */}
              {riskRatingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRiskRatingOpen(false)}>
                  <div className="w-full max-w-lg bg-[var(--color-bg)] rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-primary)] rounded-t-lg">
                      <h3 className="text-sm font-semibold text-white">Risk Rating</h3>
                      <button onClick={() => setRiskRatingOpen(false)} className="text-white/80 hover:text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 relative">
                          <div className="absolute w-8 h-8 bg-pink-500 rounded transform rotate-45 -translate-x-2 translate-y-2" />
                          <div className="absolute w-8 h-8 bg-yellow-400 rounded transform rotate-45 translate-x-2 translate-y-2" />
                          <div className="absolute w-8 h-8 bg-teal-400 rounded transform rotate-45 translate-x-4" />
                          <div className="absolute w-8 h-8 bg-purple-600 rounded transform rotate-45 translate-x-2 -translate-y-2" />
                        </div>
                      </div>
                      <div className="relative border-2 border-purple-300 rounded-lg p-6">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 -rotate-90 text-xs font-medium text-purple-600">Probability</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border-r border-b border-purple-200">
                            <p className="text-xs text-[var(--color-text)]">Mitigate these risks; usually requires updating procedures and communication</p>
                          </div>
                          <div className="p-3 border-b border-purple-200">
                            <p className="text-xs text-[var(--color-text)]">Procure subject matter expertise to mitigate these risks and design a contingency plan</p>
                          </div>
                          <div className="p-3 border-r border-purple-200">
                            <p className="text-xs text-[var(--color-text)]">Mitigate these risks; usually require change management</p>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-[var(--color-text)]">Have a contingency plan in place for these risks</p>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-purple-600">
                          <span>Low Impact</span>
                          <span>High Impact</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <Button variant="outline" size="sm" onClick={() => setRiskRatingOpen(false)} className="h-8 px-4 border-red-400 text-red-500 hover:bg-red-50">Close</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Mitigation Modal */}
              {riskMitigationOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRiskMitigationOpen(false)}>
                  <div className="w-full max-w-lg bg-[var(--color-bg)] rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-primary)] rounded-t-lg">
                      <h3 className="text-sm font-semibold text-white">Risk Mitigation</h3>
                      <button onClick={() => setRiskMitigationOpen(false)} className="text-white/80 hover:text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col items-center gap-1 mb-8">
                        <div className="w-full max-w-xs bg-yellow-400 text-white text-center py-2 text-xs font-medium rounded-t-lg">Risk Identification</div>
                        <div className="w-full max-w-xs bg-teal-500 text-white text-center py-2 text-xs font-medium">Substitution</div>
                        <div className="w-full max-w-xs bg-purple-600 text-white text-center py-2 text-xs font-medium">Engineering</div>
                        <div className="w-full max-w-xs bg-pink-500 text-white text-center py-2 text-xs font-medium">Administration</div>
                        <div className="w-full max-w-xs bg-sky-500 text-white text-center py-4 text-xs font-medium rounded-b-lg">PPE</div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setRiskMitigationOpen(false)} className="h-8 px-4 border-red-400 text-red-500 hover:bg-red-50">Close</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── 10. APPOINTMENTS ── */}
          <TabsContent value="appointments" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] min-h-[400px] flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-full bg-[var(--color-subtle)] flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-[var(--color-text-muted)]" />
              </div>
              <p className="text-base font-medium text-[var(--color-text)] mb-1">No Appointments Found!</p>
              <p className="text-sm text-[var(--color-text-muted)]">Schedule an appointment to get started.</p>
            </div>
          </TabsContent>

          {/* ── 11. SETTINGS ── */}
          <TabsContent value="settings" className="data-[state=active]:block data-[state=inactive]:hidden">
            <div className="max-w-4xl space-y-6">
              {/* Photo / Profile */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Photo</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-subtle)] flex items-center justify-center text-lg font-semibold text-[var(--color-text)]">
                    {participant.firstName?.[0]}{participant.lastName?.[0]}
                  </div>
                  <div>
                    <Button size="sm" className="h-9 bg-[var(--color-primary)] text-white mb-1">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload Image
                    </Button>
                    <p className="text-xs text-[var(--color-text-muted)]">File size must be less than 2MB. Supported formats: JPEG, PNG</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">First Name</label>
                    <Input defaultValue={participant.firstName} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Last Name</label>
                    <Input defaultValue={participant.lastName} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Date of Birth</label>
                    <Input defaultValue={new Date(participant.dateOfBirth).toLocaleDateString('en-GB')} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">NDIS Number</label>
                    <Input defaultValue={participant.ndisNumber || '432198765'} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Primary Phone Number</label>
                    <Input defaultValue={participant.phone || '0412345678'} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Primary Email Address</label>
                    <Input defaultValue={participant.email} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Street Address</label>
                    <Input defaultValue="456 Secondary St" className="h-10 bg-[var(--color-bg)]" />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Start typing an address and select from suggestions</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Suburb</label>
                    <Input defaultValue="Melbourne" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">State</label>
                    <Select defaultValue={participant.state || 'TAS'}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TAS">TAS</SelectItem>
                        <SelectItem value="VIC">VIC</SelectItem>
                        <SelectItem value="NSW">NSW</SelectItem>
                        <SelectItem value="QLD">QLD</SelectItem>
                        <SelectItem value="WA">WA</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="NT">NT</SelectItem>
                        <SelectItem value="ACT">ACT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Postcode</label>
                    <Input defaultValue={participant.postcode || '3000'} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Additional Information</h3>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Quick Snapshot</label>
                  <Textarea className="min-h-[60px] bg-[var(--color-bg)] resize-none" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Status Description <span className="text-[var(--color-text-muted)]">(max. 256)</span></label>
                  <Input className="h-10 bg-[var(--color-bg)]" />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Emergency Contact Name</label>
                    <Input defaultValue={participant.emergencyContactName || ''} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Emergency Contact Number</label>
                    <Input defaultValue={participant.emergencyContactNumber || ''} className="h-10 bg-[var(--color-bg)]" />
                  </div>
                </div>
              </div>

              {/* Disability Information */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Disability Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Primary Disability</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Secondary Disability</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Gender</label>
                    <Select defaultValue={participant.gender || 'Other'}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Additional Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Timezone</label>
                    <Select defaultValue={participant.timezone || 'Australia/Hobart'}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Australia/Hobart">Australia/Hobart</SelectItem>
                        <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Plan Managed By</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Service Start Date</label>
                    <Input placeholder="DD/MM/YYYY" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Service End Date</label>
                    <Input placeholder="DD/MM/YYYY" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Public Guardian</label>
                    <Input className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Child Safety Officer</label>
                    <Input className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Plan Nominee</label>
                    <Input className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Assigned Workers</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Region</label>
                    <Select defaultValue={participant.regionId || ''}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select a region" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select a region</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Select Participant Conditions</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Service Support</label>
                  <Select defaultValue={participant.serviceSupport || 'Core'}>
                    <SelectTrigger className="h-10 bg-[var(--color-bg)] w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Core">Core</SelectItem>
                      <SelectItem value="Capacity Building">Capacity Building</SelectItem>
                      <SelectItem value="Capital">Capital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Important Alert <span className="text-[var(--color-text-muted)]">(max. 256)</span></label>
                  <Textarea defaultValue={participant.importantAlert || ''} className="min-h-[60px] bg-[var(--color-bg)] resize-none" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Shift Instructions <span className="text-[var(--color-text-muted)]">(Please specify default instructions template for your support workers to follow)</span></label>
                  <Textarea defaultValue={participant.shiftInstructions || ''} className="min-h-[80px] bg-[var(--color-bg)] resize-none" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Default Shift End Questions</label>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Select up to 8 questions for participant shift end screen (Selected: 0/8)</p>
                  <div className="p-4 bg-[var(--color-subtle)] rounded-lg text-sm text-[var(--color-text-muted)] text-center">
                    No questions available
                  </div>
                </div>
              </div>

              {/* External Coordinator */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">External Coordinator</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">External Coordinator Name</label>
                    <Input defaultValue={participant.externalCoordinatorName || ''} placeholder="Enter Coordinator Name" className="h-10 bg-[var(--color-bg)]" />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">0 / 255</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">External Coordinator Email</label>
                    <Input defaultValue={participant.externalCoordinatorEmail || ''} placeholder="Enter Coordinator Email" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">External Coordinator Company</label>
                    <Input defaultValue={participant.externalCoordinatorCompany || ''} placeholder="Enter Coordinator Company" className="h-10 bg-[var(--color-bg)]" />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">0 / 255</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">External Coordinator Phone</label>
                    <Input defaultValue={participant.externalCoordinatorPhone || ''} placeholder="Enter Coordinator Phone" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Service Catalogue State</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Category Item Name</label>
                    <Select>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Service Category</label>
                  <Select>
                    <SelectTrigger className="h-10 bg-[var(--color-bg)] w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Select...</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Emails for Invoice <span className="text-[var(--color-text-muted)]">(Enter one email, press "Enter" to add another. repeat for more emails.)</span></label>
                  <Input placeholder="Input your emails" className="h-10 bg-[var(--color-bg)]" />
                </div>
              </div>

              {/* Payroll */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
                <h3 className="text-sm font-medium text-[var(--color-text)]">Payroll</h3>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Xero Contact ID</label>
                  <Button variant="outline" size="sm" className="h-8 text-[var(--color-primary)] border-transparent hover:bg-[var(--color-primary)]/10 px-0">
                    Connect Xero
                    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Button>
                </div>
              </div>

              {/* Toggles */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--color-primary)]">
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">Is active</p>
                      <p className="text-xs text-[var(--color-text-muted)]">is the participant active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--color-primary)]">
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">Opt-in Audit</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Include this participant in audit reports and compliance checks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                      <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">Support Coordination</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Require Support Coordination Services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                      <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">Allied Health</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Require Allied Health Services</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes */}
              <div className="flex justify-end">
                <Button className="h-10 px-6 bg-[var(--color-primary)] text-white">Save Changes</Button>
              </div>

              {/* Delete Participant */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 mb-1">Delete Participant</h3>
                    <p className="text-xs text-red-500">This will permanently delete the user, and all their data will be removed from the system.</p>
                  </div>
                  <Button variant="outline" className="h-9 px-4 border-red-300 text-red-600 hover:bg-red-100">Delete Participant</Button>
                </div>
              </div>
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
