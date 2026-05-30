'use client';

import React, { Fragment, use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { InitialAssessmentForm } from '@/components/participants/initial-assessment-form';
import {
  useParticipant,
  useCaseNotes,
  useCreateCaseNote,
  useUpdateCaseNote,
  useDeleteCaseNote,
  useTasks,
  useCreateTask,
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useMedications,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
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

const RISK_QUESTIONS = [
  'Is there a risk of falls or physical injury?',
  'Is there a risk of self-harm or harm to others?',
  'Is there a risk related to medication management?',
  'Is there a risk of financial abuse or exploitation?',
  'Is there a risk related to community access safety?',
  'Is there a risk of elopement or missing person?',
  'Is there a risk related to nutrition or hydration?',
  'Is there a risk of environmental hazards at home?',
];
const LIKELIHOOD_OPTS = ['Rare','Unlikely','Possible','Likely','Almost Certain'];
const IMPACT_OPTS = ['Insignificant','Minor','Moderate','Major','Catastrophic'];
const STATUS_OPTS = ['Open','Monitored','Resolved','Escalated'];

function computeRating(likelihood: string, impact: string): string {
  const l = LIKELIHOOD_OPTS.indexOf(likelihood);
  const i = IMPACT_OPTS.indexOf(impact);
  if (l < 0 || i < 0) return '—';
  const score = (l + 1) * (i + 1);
  if (score >= 15) return 'Extreme';
  if (score >= 8) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

function RiskAssessmentFormDialog({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (rows: {question: string; status: string; likelihood: string; impact: string; rating: string}[]) => void;
}) {
  const [rows, setRows] = useState(
    RISK_QUESTIONS.map(q => ({ question: q, status: 'Open', likelihood: 'Rare', impact: 'Insignificant', rating: 'Low' }))
  );

  const updateRow = (i: number, field: 'status' | 'likelihood' | 'impact', val: string) => {
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      const updated = { ...r, [field]: val };
      updated.rating = computeRating(
        field === 'likelihood' ? val : updated.likelihood,
        field === 'impact' ? val : updated.impact
      );
      return updated;
    }));
  };

  const ratingColor = (r: string) =>
    r === 'Extreme' ? 'text-red-700 bg-red-100' :
    r === 'High' ? 'text-orange-600 bg-orange-100' :
    r === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
    'text-green-600 bg-green-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--color-bg)] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-primary)]">
          <div>
            <h2 className="text-base font-semibold text-white">Risk Assessment Form</h2>
            <p className="text-[11px] text-white/70">Evaluate and record participant risk factors</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-6 py-2.5 bg-[var(--color-subtle)] border-b border-[var(--color-border)] text-xs">
          <span className="font-medium text-[var(--color-text-muted)]">Risk Rating:</span>
          {[['Low','text-green-600 bg-green-100'],['Medium','text-yellow-600 bg-yellow-100'],['High','text-orange-600 bg-orange-100'],['Extreme','text-red-700 bg-red-100']].map(([l, c]) => (
            <span key={l} className={`px-2 py-0.5 rounded-full font-medium ${c}`}>{l}</span>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface)] z-10">
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] w-[35%]">Question / Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">Likelihood</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">Impact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-subtle)]">
                  <td className="px-4 py-3 text-xs text-[var(--color-text)] leading-relaxed">{row.question}</td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      onChange={e => updateRow(i, 'status', e.target.value)}
                      className="h-8 w-32 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                      {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.likelihood}
                      onChange={e => updateRow(i, 'likelihood', e.target.value)}
                      className="h-8 w-36 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                      {LIKELIHOOD_OPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.impact}
                      onChange={e => updateRow(i, 'impact', e.target.value)}
                      className="h-8 w-36 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                      {IMPACT_OPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ratingColor(row.rating)}`}>
                      {row.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <button onClick={onClose} className="h-9 px-4 text-sm font-medium rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(rows)}
            className="h-9 px-5 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            Save Risk Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm text-[var(--color-text)]">{value ?? '—'}</span>
    </div>
  );
}

function SnapshotCell({ icon: Icon, label, value, onAddInfo }: { icon: React.ElementType; label: string; value?: string | null; onAddInfo?: () => void }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 ${!value && onAddInfo ? 'cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] transition-colors' : ''}`}
      onClick={!value && onAddInfo ? onAddInfo : undefined}
    >
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: participant, isLoading, isError } = useParticipant(id);
  const { data: caseNotes } = useCaseNotes(id);
  const { data: tasks } = useTasks(id);
  const { data: goals } = useGoals(id);
  const { data: medications } = useMedications(id);
  const { data: appointments } = useAppointments(id);

  const { mutate: createCaseNote, isPending: creatingNote } = useCreateCaseNote(id);
  const { mutate: updateCaseNote, isPending: updatingNote } = useUpdateCaseNote(id);
  const { mutate: deleteCaseNote, isPending: deletingNote } = useDeleteCaseNote(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const editNoteForm = useForm<CaseNoteFormData>();
  const { mutate: createTask, isPending: creatingTask } = useCreateTask(id);
  const { mutate: createGoal, isPending: creatingGoal } = useCreateGoal(id);
  const { mutate: updateGoal, isPending: updatingGoal } = useUpdateGoal(id);
  const { mutate: deleteGoal, isPending: deletingGoal } = useDeleteGoal(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [goalMenuOpen, setGoalMenuOpen] = useState<string | null>(null);
  const editGoalForm = useForm<GoalFormData>({ resolver: standardSchemaResolver(goalSchema), defaultValues: { progress: 0 } });
  const { mutate: createMedication, isPending: creatingMed } = useCreateMedication(id);
  const { mutate: updateMedication, isPending: updatingMed } = useUpdateMedication(id);
  const { mutate: deleteMedication, isPending: deletingMed } = useDeleteMedication(id);
  const { mutate: createAppointment, isPending: creatingAppt } = useCreateAppointment(id);

  const [medPlanOpen, setMedPlanOpen] = useState(false);
  const [deleteMedDialogOpen, setDeleteMedDialogOpen] = useState(false);
  const [deletingMedId, setDeletingMedId] = useState<string | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editGoalDialogOpen, setEditGoalDialogOpen] = useState(false);
  const [deleteGoalDialogOpen, setDeleteGoalDialogOpen] = useState(false);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<typeof medications extends (infer T)[] ? T : never | null>(null);
  const [apptDialogOpen, setApptDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [riskMgtOpen, setRiskMgtOpen] = useState(false);
  const [riskRatingOpen, setRiskRatingOpen] = useState(false);
  const [riskMitigationOpen, setRiskMitigationOpen] = useState(false);
  const [assessmentFormOpen, setAssessmentFormOpen] = useState(false);
  const [riskFormOpen, setRiskFormOpen] = useState(false);
  const [riskRows, setRiskRows] = useState<{question: string; status: string; likelihood: string; impact: string; rating: string}[]>([]);
  const [taskView, setTaskView] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const noteForm = useForm<CaseNoteFormData>({ resolver: standardSchemaResolver(caseNoteSchema) });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6 pt-3 pb-0">
        {/* Back link */}
        <div className="mb-2">
          <Link href="/participants" className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Participants
          </Link>
        </div>

        {/* Profile row */}
        <div className="flex items-center justify-between gap-4 pb-3">
          {/* Avatar + name/email */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white shadow">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)] leading-tight">
                {participant.firstName} {participant.lastName}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                {participant.primaryEmailAddress}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium"
              onClick={() => setMedPlanOpen(true)}
            >
              <Pill className="h-3.5 w-3.5" />
              View Medication Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium"
              onClick={() => window.print()}
            >
              <FileText className="h-3.5 w-3.5" />
              Print Support Plan
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
              onClick={() => setActiveTab('case-notes')}
            >
              <Plus className="h-3.5 w-3.5" />
              Case Notes
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-6 py-4 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
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
                    <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => setActiveTab('settings')}>
                      Add information ↗
                    </Button>
                  </div>
                  <div className="bg-[var(--color-surface)] grid grid-cols-3 gap-1.5 p-2">
                    <SnapshotCell icon={MapPin} label="Address" value={[participant.address, participant.suburb, participant.state, participant.postcode].filter(Boolean).join(', ')} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={User} label="Primary Disability" value={null} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={AlertTriangle} label="Emergency Contact Name" value={participant.emergencyContactName} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Phone} label="Emergency Phone" value={participant.emergencyContactNumber} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Phone} label="Participant Phone" value={participant.primaryPhoneNumber} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Mail} label="Participant Email" value={participant.primaryEmailAddress} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Shield} label="NDIS No." value={participant.ndisNumber} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Calendar} label="Date of Birth" value={participant.dateOfBirth ? new Date(participant.dateOfBirth).toLocaleDateString('en-AU') : null} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Calendar} label="Service Start Date" value={participant.serviceStartDate ? new Date(participant.serviceStartDate).toLocaleDateString('en-AU') : null} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Calendar} label="Service End Date" value={participant.serviceEndDate ? new Date(participant.serviceEndDate).toLocaleDateString('en-AU') : null} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={User} label="Public Guardian" value={null} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Shield} label="Child Safety Officer" value={null} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={User} label="Plan Nominee" value={participant.planNominee} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={User} label="External Coordinator Name" value={participant.externalCoordinatorName} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Mail} label="External Coordinator Email" value={participant.externalCoordinatorEmail} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={Phone} label="External Coordinator Phone" value={participant.externalCoordinatorPhone} onAddInfo={() => setActiveTab('settings')} />
                    <SnapshotCell icon={User} label="External Coordinator Company" value={participant.externalCoordinatorCompany} onAddInfo={() => setActiveTab('settings')} />
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
                          {goals.map((g: { id: string; description: string; goalType: string; progress: number; achievementNotes?: string; hurdles?: string }) => (
                            <div key={g.id} className="rounded-lg border border-[var(--color-border)] p-2.5 relative">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[var(--color-primary)] text-xs">●</span>
                                  <p className="text-xs text-[var(--color-text)] truncate">{g.description}</p>
                                </div>
                                <div className="relative shrink-0">
                                  <button
                                    onClick={() => setGoalMenuOpen(goalMenuOpen === g.id ? null : g.id)}
                                    className="p-1 rounded hover:bg-[var(--color-subtle)] text-[var(--color-text-muted)]"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                  </button>
                                  {goalMenuOpen === g.id && (
                                    <div className="absolute right-0 top-7 z-50 min-w-[110px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg py-1">
                                      <button
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-subtle)] text-[var(--color-text)]"
                                        onClick={() => {
                                          setEditingGoal(g);
                                          editGoalForm.reset({
                                            description: g.description,
                                            goalType: g.goalType as GoalFormData['goalType'],
                                            progress: g.progress,
                                            achievementNotes: g.achievementNotes ?? '',
                                            hurdles: g.hurdles ?? '',
                                          });
                                          setGoalMenuOpen(null);
                                          setEditGoalDialogOpen(true);
                                        }}
                                      >
                                        <svg className="w-3 h-3 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Edit
                                      </button>
                                      <button
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-subtle)] text-red-500"
                                        onClick={() => {
                                          setDeletingGoalId(g.id);
                                          setGoalMenuOpen(null);
                                          setDeleteGoalDialogOpen(true);
                                        }}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="secondary" className="shrink-0 text-[10px]">{g.goalType}</Badge>
                                <div className="flex-1 h-1 rounded-full bg-[var(--color-subtle)]">
                                  <div className="h-1 rounded-full bg-[var(--color-primary)]" style={{ width: `${g.progress}%` }} />
                                </div>
                                <span className="text-[10px] text-[var(--color-text-muted)]">{g.progress}%</span>
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
                  <div className="flex items-center justify-between bg-[var(--color-primary)] px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Support Plan</h3>
                      <p className="text-[11px] text-white/60">Comprehensive support plan information</p>
                    </div>
                    <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => setAssessmentFormOpen(true)}>
                      Add information ↗
                    </Button>
                  </div>
                  <div className="bg-[var(--color-surface)] p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <SnapshotCell icon={Calendar} label="Date of Birth" value={participant.dateOfBirth ? new Date(participant.dateOfBirth).toLocaleDateString('en-AU') : null} onAddInfo={() => setAssessmentFormOpen(true)} />
                      <SnapshotCell icon={Shield} label="NDIS Plan" value={participant.ndisPlans?.[0]?.managementStyle} onAddInfo={() => setAssessmentFormOpen(true)} />
                    </div>
                    <button
                      onClick={() => setAssessmentFormOpen(true)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-left hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] transition-colors group"
                    >
                      <p className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
                        To add information on Support Plan, Please submit initial assessment form →
                      </p>
                    </button>
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
                    <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setRiskFormOpen(true)}>Select Form</Button>
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
                          {riskRows.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center">
                                <span className="text-xs text-[var(--color-error)]">Please select risk form!</span>
                              </td>
                            </tr>
                          ) : (
                            riskRows.map((row, i) => {
                              const ratingColor = row.rating === 'High' || row.rating === 'Extreme' ? 'text-red-600 bg-red-50' : row.rating === 'Medium' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
                              return (
                                <tr key={i} className="border-t border-[var(--color-border)] hover:bg-[var(--color-subtle)]">
                                  <td className="px-4 py-3 text-xs text-[var(--color-text)]">{row.question}</td>
                                  <td className="px-4 py-3 text-xs text-[var(--color-text)]">{row.status}</td>
                                  <td className="px-4 py-3 text-xs text-[var(--color-text)]">{row.likelihood}</td>
                                  <td className="px-4 py-3 text-xs text-[var(--color-text)]">{row.impact}</td>
                                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ratingColor}`}>{row.rating}</span></td>
                                </tr>
                              );
                            })
                          )}
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

                  <form className="p-5 space-y-3" onSubmit={noteForm.handleSubmit((data) => {
                    const formData = { ...data, attachment: selectedFile };
                    createCaseNote(formData as Record<string, unknown>, {
                      onSuccess: () => { toast.success('Case note added'); noteForm.reset(); setSelectedFile(null); },
                      onError: () => toast.error('Failed to add case note'),
                    });
                  })}>
                    {/* Subject Line */}
                    <Input
                      placeholder="Subject Line"
                      className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] text-sm"
                      {...noteForm.register('subject')}
                    />

                    {/* Rich Text Editor */}
                    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
                      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-subtle)] flex-wrap">
                        <select className="text-xs bg-transparent border border-[var(--color-border)] rounded px-2 py-0.5 outline-none text-[var(--color-text)] mr-1">
                          <option>Paragraph</option>
                          <option>Heading 1</option>
                          <option>Heading 2</option>
                        </select>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] font-bold text-sm transition-colors" title="Bold">B</button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] italic text-sm transition-colors" title="Italic">I</button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] text-sm transition-colors" title="Link">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] text-sm transition-colors" title="Bullet list">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        </button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] text-sm transition-colors" title="Numbered list">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] text-sm transition-colors" title="Image">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2}/><circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2}/><polyline points="21 15 16 10 5 21" strokeWidth={2}/></svg>
                        </button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] text-xs font-mono transition-colors" title="Quote">&ldquo;&rdquo;</button>
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] text-xs font-mono transition-colors" title="Table">⊞</button>
                        <div className="flex-1" />
                        <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text-muted)] text-sm transition-colors" title="More options">⋮</button>
                      </div>
                      <Textarea
                        placeholder="Enter case note here..."
                        className="border-0 rounded-none min-h-[120px] resize-none bg-transparent px-3 py-2.5 text-sm focus-visible:ring-0"
                        {...noteForm.register('content')}
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Date</label>
                      <Input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="h-10 w-full bg-[var(--color-surface)] border-[var(--color-border)] text-sm"
                        {...noteForm.register('date')}
                      />
                    </div>

                    {/* File Attachment — inline row */}
                    <label className="flex items-center gap-2 h-10 px-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] cursor-pointer hover:border-[var(--color-primary)] transition-colors group">
                      <svg className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-xs text-[var(--color-text)] truncate flex-1">
                        {selectedFile ? selectedFile.name : 'PDF, DOC, DOCX, CSV, XLSX, XLS, PNG, JPG, JPEG, GIF, ZIP up to 5MB'}
                      </span>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                          className="p-1 rounded hover:bg-[var(--color-subtle)] text-[var(--color-text-muted)] hover:text-red-500"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.zip"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && file.size > 5 * 1024 * 1024) {
                            toast.error('File size exceeds 5MB limit');
                            return;
                          }
                          setSelectedFile(file);
                        }}
                      />
                    </label>

                    {/* Row: Time Spent + How Contacted */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Time Spent (00:00)"
                        className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] text-sm"
                        {...noteForm.register('timeSpent')}
                      />
                      <Select onValueChange={(value) => noteForm.setValue('howContacted', value)}>
                        <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] text-sm">
                          <SelectValue placeholder="How Contacted" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Incident Reporting">Incident Reporting</SelectItem>
                          <SelectItem value="Report Writing">Report Writing</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Row: Travel (KM) + Non-direct Support */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Travel (KM)"
                        className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] text-sm"
                        {...noteForm.register('travelKm')}
                      />
                      <Select onValueChange={(value) => noteForm.setValue('nonDirectSupport', value)}>
                        <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] text-sm">
                          <SelectValue placeholder="Non-direct support" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Toggles + Submit */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <input type="checkbox" className="peer sr-only" {...noteForm.register('billable')} />
                            <div className="w-9 h-5 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all" />
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
                          </div>
                          <span className="text-sm text-[var(--color-text)]">Billable</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <input type="checkbox" className="peer sr-only" {...noteForm.register('showToWorker')} />
                            <div className="w-9 h-5 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all" />
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
                          </div>
                          <span className="text-sm text-[var(--color-text)]">Show to worker</span>
                        </label>
                      </div>
                      <Button type="submit" disabled={creatingNote} className="h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-sm font-medium">
                        {creatingNote ? 'Saving…' : 'Submit'}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Case Notes List */}
                {!caseNotes?.length ? (
                  <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                    <p className="text-sm font-medium text-[var(--color-text)] mb-1">No Data Found!</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Get started by creating a new case note</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-1">
                    {(() => {
                      // Group notes by date
                      type CNType = { id: string; date: string; subject?: string; content: string; createdBy: string; timeSpent?: string; howContacted?: string; createdAt?: string; billable?: boolean; nonDirectSupport?: string; attachmentUrl?: string; travelKm?: string; showToWorker?: boolean };
                      const typedNotes = (caseNotes ?? []) as CNType[];
                      const groups: Record<string, CNType[]> = {};
                      typedNotes.forEach((n) => {
                        const key = new Date(n.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(n);
                      });
                      return Object.entries(groups).map(([dateLabel, notes]) => (
                        <div key={dateLabel}>
                          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide px-1 py-3">{dateLabel}</p>
                          <div className="space-y-3">
                            {notes.map((n) => {
                              const noteInitials = (n.createdBy ?? 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                              const createdAt = new Date(n.createdAt ?? n.date);
                              const now = new Date();
                              const diffMs = now.getTime() - createdAt.getTime();
                              const diffMins = Math.floor(diffMs / 60000);
                              const timeAgo = diffMins < 1 ? 'just now' : diffMins < 60 ? `${diffMins} minute${diffMins > 1 ? 's' : ''} ago` : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago` : `${Math.floor(diffMins / 1440)}d ago`;
                              return (
                                <div key={n.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:shadow-sm transition-shadow">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                                      {noteInitials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {/* Header row: Name + Badges + Actions */}
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-semibold text-[var(--color-text)]">{n.createdBy ?? 'Unknown'}</span>
                                          {/* Badges */}
                                          {n.subject && (
                                            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text)]">
                                              Subject: {n.subject}
                                            </span>
                                          )}
                                          {n.timeSpent && (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                                              Time: {n.timeSpent}
                                            </span>
                                          )}
                                          {n.howContacted && (
                                            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                                              Contacted: {n.howContacted}
                                            </span>
                                          )}
                                          {n.travelKm && (
                                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                                              Travel: {n.travelKm} KM
                                            </span>
                                          )}
                                          {n.billable && (
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                                              Billable: Yes
                                            </span>
                                          )}
                                          {n.nonDirectSupport && (
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                              Non-direct: {n.nonDirectSupport}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-xs text-[var(--color-text-muted)] mr-1">{timeAgo}</span>
                                          <button
                                            onClick={() => {
                                              setEditingNote(n);
                                              editNoteForm.reset({
                                                subject: n.subject ?? '',
                                                content: n.content,
                                                date: n.date ? new Date(n.date).toISOString().split('T')[0] : '',
                                                timeSpent: n.timeSpent ?? '',
                                                howContacted: n.howContacted ?? '',
                                                travelKm: n.travelKm ?? '',
                                                billable: n.billable ?? false,
                                                showToWorker: n.showToWorker ?? false,
                                              });
                                              setEditNoteDialogOpen(true);
                                            }}
                                            className="p-1.5 rounded hover:bg-[var(--color-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                            title="Edit"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                          </button>
                                          <button
                                            onClick={() => { setDeletingNoteId(n.id); setDeleteNoteDialogOpen(true); }}
                                            className="p-1.5 rounded hover:bg-[var(--color-subtle)] text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                                            title="Delete"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                      {/* Timestamp */}
                                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                                        Last updated: {createdAt.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} {createdAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                      {/* Content */}
                                      <p className="text-sm text-[var(--color-text-secondary)] mt-2 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                                      {/* Attachment indicator */}
                                      {n.attachmentUrl && (
                                        <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                                          <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                          </svg>
                                          <span className="text-xs text-[var(--color-text-muted)] truncate flex-1">{n.attachmentUrl.split('/').pop()}</span>
                                          <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] hover:underline font-medium">Download</a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
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

              {/* Medications Table with Expandable Rows */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-[var(--color-subtle)] to-[var(--color-bg)] border-b border-[var(--color-border)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider w-10"></th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">Medication Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">Dosage</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">Schedule</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {!medications?.length ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center">
                            <div className="flex flex-col items-center justify-center py-8">
                              <div className="w-12 h-12 rounded-full bg-[var(--color-subtle)] flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <p className="text-sm text-[var(--color-text-muted)] mb-1">No medication history found</p>
                              <p className="text-xs text-[var(--color-text-muted)]">Add medications to view history</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (medications as {id:string;medicationName:string;medicineType?:string;dosage?:string;frequency?:string;startDate?:string;endDate?:string;instructions?:string;sideEffects?:string}[]).map((m) => {
                          const isExpanded = expandedMedId === m.id;
                          return (
                            <Fragment key={`med-${m.id}`}>
                              <tr
                                className={`transition-all duration-200 ${isExpanded ? 'bg-gradient-to-r from-blue-50/50 to-transparent shadow-sm' : 'hover:bg-[var(--color-subtle)]/50'}`}
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedMedId(isExpanded ? null : m.id)}
                                    className="flex items-center justify-center w-7 h-7 hover:bg-[var(--color-primary)]/10 rounded-lg transition-all duration-200 group"
                                    title={isExpanded ? 'Collapse details' : 'Expand details'}
                                  >
                                    <svg
                                      className={`w-3.5 h-3.5 text-[var(--color-primary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                      fill="currentColor"
                                      viewBox="0 0 448 512"
                                    >
                                      <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" />
                                    </svg>
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-sm font-semibold text-[var(--color-text)]">{m.medicationName || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm bg-purple-50 text-purple-700 border border-purple-200">
                                    {m.medicineType || 'PRN'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-[var(--color-text)]">{m.dosage || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-[var(--color-text)]">{m.frequency || 'N/A'}</span>
                                    <span className="text-xs text-[var(--color-text-muted)] font-medium">As Needed</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium text-[var(--color-text)]">
                                    {m.startDate ? new Date(m.startDate).toLocaleDateString('en-AU') : <span className="text-[var(--color-text-muted)]">N/A</span>}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium text-[var(--color-text)]">
                                    {m.endDate ? new Date(m.endDate).toLocaleDateString('en-AU') : <span className="text-[var(--color-text-muted)]">-</span>}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedMedId(isExpanded ? null : m.id)}
                                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                      {isExpanded ? 'Cancel' : 'Edit'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        medForm.setValue('medicationName', m.medicationName + ' (Copy)');
                                        medForm.setValue('dosage', m.dosage || '');
                                        medForm.setValue('frequency', m.frequency || '');
                                        medForm.setValue('startDate', m.startDate || '');
                                        medForm.setValue('endDate', m.endDate || '');
                                        medForm.setValue('instructions', m.instructions || '');
                                        medForm.setValue('sideEffects', m.sideEffects || '');
                                        setMedDialogOpen(true);
                                        toast.success('Medication cloned - edit and save');
                                      }}
                                      className="px-2.5 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-sm rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1"
                                      title="Clone Medication"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 448 512">
                                        <path d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z" />
                                      </svg>
                                      Clone
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={8} className="px-4 py-6 bg-gradient-to-b from-[var(--color-subtle)]/50 to-transparent">
                                    <div className="space-y-6 bg-[var(--color-bg)] rounded-lg p-6 border-2 border-[var(--color-primary)]/20 shadow-lg">
                                      {/* Edit Header */}
                                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
                                        <h3 className="text-lg font-bold text-[var(--color-text)]">Edit Medication</h3>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            disabled={updatingMed}
                                            onClick={() => {
                                              updateMedication({ medicationId: m.id, medicationName: m.medicationName, dosage: m.dosage, frequency: m.frequency, startDate: m.startDate, endDate: m.endDate, instructions: m.instructions, sideEffects: m.sideEffects }, {
                                                onSuccess: () => { toast.success('Medication updated'); setExpandedMedId(null); },
                                                onError: () => toast.error('Failed to update medication'),
                                              });
                                            }}
                                            className="h-9 px-4 bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white"
                                          >
                                            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            {updatingMed ? 'Saving…' : 'Save'}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setDeletingMedId(m.id); setDeleteMedDialogOpen(true); }}
                                            className="h-9 px-4 text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-red-50"
                                          >
                                            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setExpandedMedId(null)}
                                            className="h-9 px-4"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Warning Banner */}
                                      <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 flex items-start gap-3">
                                        <svg className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="text-sm text-[var(--color-warning)]">
                                          <span className="font-semibold">Warning:</span> Medication listing must be added/ updated by an appropriate medical practitioner
                                        </p>
                                      </div>

                                      {/* Basic Info Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="flex flex-col gap-2">
                                          <label className="text-xs font-semibold text-[var(--color-text)]">Medicine Type <span className="text-[var(--color-error)]">*</span></label>
                                          <Select defaultValue={m.medicineType || 'prn'}>
                                            <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]">
                                              <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="prescription">Prescription</SelectItem>
                                              <SelectItem value="otc">Over the Counter</SelectItem>
                                              <SelectItem value="supplement">Supplement</SelectItem>
                                              <SelectItem value="prn">PRN</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <label className="text-xs font-semibold text-[var(--color-text)]">Medicine Name <span className="text-[var(--color-error)]">*</span></label>
                                          <Input defaultValue={m.medicationName} placeholder="Enter name..." className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <label className="text-xs font-semibold text-[var(--color-text)]">Start Date <span className="text-[var(--color-error)]">*</span></label>
                                          <div className="relative">
                                            <Input type="date" defaultValue={m.startDate} className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] pr-10" />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <label className="text-xs font-semibold text-[var(--color-text)]">End Date</label>
                                          <div className="relative">
                                            <Input type="date" defaultValue={m.endDate} className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] pr-10" />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Event & Dosage */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-2">
                                          <label className="text-xs font-semibold text-[var(--color-text)]">Event <span className="text-[var(--color-error)]">*</span></label>
                                          <Select defaultValue="prn">
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
                                      </div>

                                      {/* Dosage Information Section */}
                                      <div className="border-t border-[var(--color-border)] pt-5">
                                        <div className="flex items-center gap-2 mb-4">
                                          <div className="w-1 h-5 bg-blue-500 rounded-full" />
                                          <h4 className="text-sm font-semibold text-blue-600">Dosage Information</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-[var(--color-text)]">Quantity <span className="text-[var(--color-error)]">*</span></label>
                                            <Input type="number" step="0.01" min="0" max="9" placeholder="Enter quantity (0-9)" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                                          </div>
                                          <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-[var(--color-text)]">Unit of Measure <span className="text-[var(--color-error)]">*</span></label>
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
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                          <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-4 bg-green-500 rounded-full" />
                                            <h4 className="text-sm font-semibold text-green-600">Medication Instructions</h4>
                                          </div>
                                          <Textarea
                                            defaultValue={m.instructions}
                                            placeholder="Write details of how and when the medication should be administered..."
                                            className="min-h-[100px] bg-[var(--color-surface)] border-[var(--color-border)] resize-y"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                            <h4 className="text-sm font-semibold text-orange-600">Side Effects</h4>
                                          </div>
                                          <Textarea
                                            defaultValue={m.sideEffects}
                                            placeholder="Write any known or observed side effects of this medicine..."
                                            className="min-h-[100px] bg-[var(--color-surface)] border-[var(--color-border)] resize-y"
                                          />
                                        </div>
                                      </div>

                                      {/* Allergies Section */}
                                      <div className="border border-[var(--color-error)]/30 rounded-lg bg-[var(--color-error)]/5 p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                          <svg className="h-5 w-5 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                          </svg>
                                          <h4 className="text-sm font-semibold text-[var(--color-error)]">Allergies & Adverse Drug Reactions (ADRs)</h4>
                                          <span className="text-xs text-[var(--color-text-muted)]">(for this medication)</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-[var(--color-error)] flex items-center gap-1.5">
                                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                              </svg>
                                              Medicines Type/Name
                                            </label>
                                            <Input placeholder="e.g., Penicillin, Aspirin..." className="h-10 bg-[var(--color-bg)] border-[var(--color-error)]/30" />
                                          </div>
                                          <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-[var(--color-error)] flex items-center gap-1.5">
                                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                              </svg>
                                              Allergy Name
                                            </label>
                                            <Input placeholder="e.g., Drug Allergy, Food Allergy..." className="h-10 bg-[var(--color-bg)] border-[var(--color-error)]/30" />
                                          </div>
                                          <div className="flex flex-col gap-2">
                                            <label className="text-xs font-semibold text-[var(--color-error)] flex items-center gap-1.5">
                                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                              </svg>
                                              Reaction Type
                                            </label>
                                            <Input placeholder="e.g., Rash, Nausea, Difficulty Breathing..." className="h-10 bg-[var(--color-bg)] border-[var(--color-error)]/30" />
                                          </div>
                                          <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
                                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              Allergy Notes
                                            </label>
                                            <Textarea placeholder="Write down any additional details, severity, date of occurrence..." className="min-h-[80px] bg-[var(--color-bg)] border-[var(--color-error)]/30 resize-y" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inline Add Medication Form */}
              {medDialogOpen && (
                <div className="space-y-6 bg-[var(--color-bg)] rounded-xl p-6 border-2 border-[var(--color-primary)]/20 shadow-lg">
                  {/* Add Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
                    <h3 className="text-lg font-bold text-[var(--color-text)]">Add New Medication</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={medForm.handleSubmit((data) => {
                          createMedication(data as Record<string, unknown>, {
                            onSuccess: () => { toast.success('Medication added'); medForm.reset(); setMedDialogOpen(false); },
                            onError: () => toast.error('Failed to add medication'),
                          });
                        })}
                        disabled={creatingMed}
                        className="h-9 px-4 bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {creatingMed ? 'Saving…' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setMedDialogOpen(false); medForm.reset(); }}
                        className="h-9 px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Warning Banner */}
                  <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 flex items-start gap-3">
                    <svg className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-[var(--color-warning)]">
                      <span className="font-semibold">Warning:</span> Medication listing must be added/ updated by an appropriate medical practitioner
                    </p>
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">Medicine Type <span className="text-[var(--color-error)]">*</span></label>
                      <Select>
                        <SelectTrigger className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="otc">Over the Counter</SelectItem>
                          <SelectItem value="supplement">Supplement</SelectItem>
                          <SelectItem value="prn">PRN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">Medicine Name <span className="text-[var(--color-error)]">*</span></label>
                      <Input {...medForm.register('medicationName')} placeholder="Enter name..." className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                      {medForm.formState.errors.medicationName && <p className="text-xs text-[var(--color-error)]">{medForm.formState.errors.medicationName.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">Start Date <span className="text-[var(--color-error)]">*</span></label>
                      <div className="relative">
                        <Input type="date" {...medForm.register('startDate')} className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] pr-10" />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">End Date</label>
                      <div className="relative">
                        <Input type="date" {...medForm.register('endDate')} className="h-10 bg-[var(--color-surface)] border-[var(--color-border)] pr-10" />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Event & Dosage */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">Event <span className="text-[var(--color-error)]">*</span></label>
                      <Select defaultValue="prn">
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
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">Dosage</label>
                      <Input {...medForm.register('dosage')} placeholder="e.g., 500mg" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text)]">Frequency</label>
                      <Input {...medForm.register('frequency')} placeholder="e.g., Twice daily" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                    </div>
                  </div>

                  {/* Dosage Information Section */}
                  <div className="border-t border-[var(--color-border)] pt-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-5 bg-blue-500 rounded-full" />
                      <h4 className="text-sm font-semibold text-blue-600">Dosage Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[var(--color-text)]">Quantity <span className="text-[var(--color-error)]">*</span></label>
                        <Input type="number" step="0.01" min="0" max="9" placeholder="Enter quantity (0-9)" className="h-10 bg-[var(--color-surface)] border-[var(--color-border)]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[var(--color-text)]">Unit of Measure <span className="text-[var(--color-error)]">*</span></label>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4 bg-green-500 rounded-full" />
                        <h4 className="text-sm font-semibold text-green-600">Medication Instructions</h4>
                      </div>
                      <Textarea {...medForm.register('instructions')} placeholder="Write details of how and when the medication should be administered..." className="min-h-[100px] bg-[var(--color-surface)] border-[var(--color-border)] resize-y" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                        <h4 className="text-sm font-semibold text-orange-600">Side Effects</h4>
                      </div>
                      <Textarea {...medForm.register('sideEffects')} placeholder="Write any known or observed side effects of this medicine..." className="min-h-[100px] bg-[var(--color-surface)] border-[var(--color-border)] resize-y" />
                    </div>
                  </div>

                  {/* Allergies Section */}
                  <div className="border border-[var(--color-error)]/30 rounded-lg bg-[var(--color-error)]/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="h-5 w-5 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-[var(--color-error)]">Allergies & Adverse Drug Reactions (ADRs)</h4>
                      <span className="text-xs text-[var(--color-text-muted)]">(for this medication)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[var(--color-error)] flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          Medicines Type/Name
                        </label>
                        <Input placeholder="e.g., Penicillin, Aspirin..." className="h-10 bg-[var(--color-bg)] border-[var(--color-error)]/30" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[var(--color-error)] flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Allergy Name
                        </label>
                        <Input placeholder="e.g., Drug Allergy, Food Allergy..." className="h-10 bg-[var(--color-bg)] border-[var(--color-error)]/30" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[var(--color-error)] flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Reaction Type
                        </label>
                        <Input placeholder="e.g., Rash, Nausea, Difficulty Breathing..." className="h-10 bg-[var(--color-bg)] border-[var(--color-error)]/30" />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Allergy Notes
                        </label>
                        <Textarea placeholder="Write down any additional details, severity, date of occurrence..." className="min-h-[80px] bg-[var(--color-bg)] border-[var(--color-error)]/30 resize-y" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Medication Confirmation Dialog */}
              <Dialog open={deleteMedDialogOpen} onOpenChange={(o) => { setDeleteMedDialogOpen(o); if (!o) setDeletingMedId(null); }}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Delete Medication</DialogTitle></DialogHeader>
                  <div className="flex items-start gap-3 py-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">Are you sure you want to delete this medication?</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">This action cannot be undone.</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setDeleteMedDialogOpen(false); setDeletingMedId(null); }}>Cancel</Button>
                    <Button
                      variant="destructive"
                      disabled={deletingMed}
                      onClick={() => {
                        if (!deletingMedId) return;
                        deleteMedication(deletingMedId, {
                          onSuccess: () => { toast.success('Medication deleted'); setDeleteMedDialogOpen(false); setDeletingMedId(null); setExpandedMedId(null); },
                          onError: () => toast.error('Failed to delete medication'),
                        });
                      }}
                    >
                      {deletingMed ? 'Deleting…' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
                    {(participant.shiftNotes as {id:string;content:string;shiftDate:string;workerId?:string}[]).map((n) => (
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
                          <p className="text-xs text-[var(--color-text-muted)] text-center">Control Matrix (Use RAM to determine risk ratings based on risks&apos; impact and likelihood)</p>
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
                    <Input defaultValue={participant.ndisNumber} placeholder="Enter NDIS number" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Primary Phone Number</label>
                    <Input defaultValue={participant.primaryPhoneNumber} placeholder="Enter phone number" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Primary Email Address</label>
                    <Input defaultValue={participant.primaryEmailAddress} placeholder="Enter email address" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Street Address</label>
                    <Input defaultValue={participant.address} placeholder="Enter street address" className="h-10 bg-[var(--color-bg)]" />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Start typing an address and select from suggestions</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Suburb</label>
                    <Input defaultValue={participant.suburb} placeholder="Enter suburb" className="h-10 bg-[var(--color-bg)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">State</label>
                    <Select defaultValue={participant.state}>
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
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Emails for Invoice <span className="text-[var(--color-text-muted)]">(Enter one email, press &quot;Enter&quot; to add another. repeat for more emails.)</span></label>
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

              {/* Initial Assessment Form */}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">Initial Assessment Form</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Complete the participant on-boarding assessment form with disability requirements, communication, medical providers and more.</p>
                  </div>
                  <Button
                    className="h-9 px-4 shrink-0 ml-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-sm"
                    onClick={() => setAssessmentFormOpen(true)}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Open Form
                  </Button>
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
      <Dialog open={goalDialogOpen} onOpenChange={(o) => { setGoalDialogOpen(o); if (!o) goalForm.reset(); }}>
        <DialogContent className="sm:max-w-lg">
          {/* Blue header */}
          <div className="-mx-6 -mt-6 rounded-t-lg bg-[var(--color-primary)] px-6 py-4 mb-4">
            <DialogTitle className="text-white text-base font-semibold">Add Goal</DialogTitle>
          </div>

          <form className="space-y-4" onSubmit={goalForm.handleSubmit((data) => {
            createGoal(data as Record<string, unknown>, {
              onSuccess: () => { toast.success('Goal added'); goalForm.reset(); setGoalDialogOpen(false); },
              onError: () => toast.error('Failed to add goal'),
            });
          })}>
            {/* Describe the Goal */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                <span className="text-[var(--color-primary)]">◉</span>
                Describe the Goal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Textarea
                  {...goalForm.register('description')}
                  rows={4}
                  maxLength={1500}
                  placeholder="Enter a clear and measurable goal description..."
                  className="resize-none bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">
                  {goalForm.watch('description')?.length ?? 0} / 1500
                </span>
              </div>
              {goalForm.formState.errors.description && (
                <p className="mt-1 text-xs text-red-500">{goalForm.formState.errors.description.message}</p>
              )}
            </div>

            {/* Goal Type + Progress */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                  <svg className="h-3.5 w-3.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Goal Type
                </label>
                <Select defaultValue="Short Term" onValueChange={(v) => goalForm.setValue('goalType', v as GoalFormData['goalType'])}>
                  <SelectTrigger className="h-11 bg-[var(--color-surface)] border-[var(--color-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short Term">Short Term</SelectItem>
                    <SelectItem value="Medium Term">Medium Term</SelectItem>
                    <SelectItem value="Long Term">Long Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                  <svg className="h-3.5 w-3.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Progress
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="h-11 pr-8 bg-[var(--color-surface)] border-[var(--color-border)]"
                    {...goalForm.register('progress', { valueAsNumber: true })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">%</span>
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--color-subtle)]">
                    <div
                      className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, goalForm.watch('progress') ?? 0))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{goalForm.watch('progress') ?? 0}%</span>
                </div>
              </div>
            </div>

            {/* Achievement Notes */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                <svg className="h-3.5 w-3.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Achievement Notes
              </label>
              <div className="relative">
                <Textarea
                  {...goalForm.register('achievementNotes')}
                  rows={3}
                  maxLength={1500}
                  placeholder="Document key milestones and achievements..."
                  className="resize-none bg-[var(--color-surface)] border-[var(--color-border)]"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">
                  {goalForm.watch('achievementNotes')?.length ?? 0} / 1500
                </span>
              </div>
            </div>

            {/* Hurdles */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                <span className="text-orange-500">⚠</span>
                Hurdles
              </label>
              <div className="relative">
                <Textarea
                  {...goalForm.register('hurdles')}
                  rows={3}
                  maxLength={1500}
                  placeholder="Note any challenges or obstacles encountered..."
                  className="resize-none bg-[var(--color-surface)] border-[var(--color-border)]"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">
                  {goalForm.watch('hurdles')?.length ?? 0} / 1500
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setGoalDialogOpen(false); goalForm.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={creatingGoal} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                {creatingGoal ? 'Saving…' : 'Add Goal'}
              </Button>
            </DialogFooter>
          </form>
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

      {/* ── Risk Assessment Form ── */}
      {riskFormOpen && (
        <RiskAssessmentFormDialog
          onClose={() => setRiskFormOpen(false)}
          onSubmit={(rows: {question: string; status: string; likelihood: string; impact: string; rating: string}[]) => { setRiskRows(rows); setRiskFormOpen(false); }}
        />
      )}

      {/* ── Initial Assessment Form ── */}
      <InitialAssessmentForm
        open={assessmentFormOpen}
        onClose={() => setAssessmentFormOpen(false)}
        participantId={participant.id}
        participantName={`${participant.firstName} ${participant.lastName}`}
      />

      {/* ── Edit Goal ── */}
      <Dialog open={editGoalDialogOpen} onOpenChange={(o) => { setEditGoalDialogOpen(o); if (!o) { setEditingGoal(null); editGoalForm.reset(); } }}>
        <DialogContent className="sm:max-w-lg">
          <div className="-mx-6 -mt-6 rounded-t-lg bg-[var(--color-primary)] px-6 py-4 mb-4">
            <DialogTitle className="text-white text-base font-semibold">Edit Goal</DialogTitle>
          </div>
          <form className="space-y-4" onSubmit={editGoalForm.handleSubmit((data) => {
            updateGoal({ goalId: editingGoal?.id, ...data } as Record<string, unknown>, {
              onSuccess: () => { toast.success('Goal updated'); setEditGoalDialogOpen(false); setEditingGoal(null); editGoalForm.reset(); },
              onError: () => toast.error('Failed to update goal'),
            });
          })}>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                <span className="text-[var(--color-primary)]">◉</span> Describe the Goal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Textarea {...editGoalForm.register('description')} rows={4} maxLength={1500} placeholder="Enter a clear and measurable goal description..." className="resize-none bg-[var(--color-surface)] border-[var(--color-border)]" />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">{editGoalForm.watch('description')?.length ?? 0} / 1500</span>
              </div>
              {editGoalForm.formState.errors.description && <p className="mt-1 text-xs text-red-500">{editGoalForm.formState.errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Goal Type</label>
                <Select defaultValue={editingGoal?.goalType ?? 'Short Term'} onValueChange={(v) => editGoalForm.setValue('goalType', v as GoalFormData['goalType'])}>
                  <SelectTrigger className="h-11 bg-[var(--color-surface)] border-[var(--color-border)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short Term">Short Term</SelectItem>
                    <SelectItem value="Medium Term">Medium Term</SelectItem>
                    <SelectItem value="Long Term">Long Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Progress</label>
                <div className="relative">
                  <Input type="number" min="0" max="100" placeholder="0" className="h-11 pr-8 bg-[var(--color-surface)] border-[var(--color-border)]" {...editGoalForm.register('progress', { valueAsNumber: true })} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">%</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--color-subtle)]">
                    <div className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all" style={{ width: `${Math.min(100, Math.max(0, editGoalForm.watch('progress') ?? 0))}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{editGoalForm.watch('progress') ?? 0}%</span>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Achievement Notes</label>
              <div className="relative">
                <Textarea {...editGoalForm.register('achievementNotes')} rows={3} maxLength={1500} placeholder="Document key milestones and achievements..." className="resize-none bg-[var(--color-surface)] border-[var(--color-border)]" />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">{editGoalForm.watch('achievementNotes')?.length ?? 0} / 1500</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Hurdles</label>
              <div className="relative">
                <Textarea {...editGoalForm.register('hurdles')} rows={3} maxLength={1500} placeholder="Note any challenges or obstacles encountered..." className="resize-none bg-[var(--color-surface)] border-[var(--color-border)]" />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">{editGoalForm.watch('hurdles')?.length ?? 0} / 1500</span>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setEditGoalDialogOpen(false); setEditingGoal(null); editGoalForm.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={updatingGoal} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                {updatingGoal ? 'Saving…' : 'Update Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Goal ── */}
      <Dialog open={deleteGoalDialogOpen} onOpenChange={(o) => { setDeleteGoalDialogOpen(o); if (!o) setDeletingGoalId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Goal</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Are you sure you want to delete this Goal?</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteGoalDialogOpen(false); setDeletingGoalId(null); }}>Cancel</Button>
            <Button variant="destructive" disabled={deletingGoal} onClick={() => {
              if (!deletingGoalId) return;
              deleteGoal(deletingGoalId, {
                onSuccess: () => { toast.success('Goal deleted'); setDeleteGoalDialogOpen(false); setDeletingGoalId(null); },
                onError: () => toast.error('Failed to delete goal'),
              });
            }}>
              {deletingGoal ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Medication Plan ── */}
      <Dialog open={medPlanOpen} onOpenChange={setMedPlanOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-[var(--color-primary)]" />
              Medication Plan — {participant.firstName} {participant.lastName}
            </DialogTitle>
          </DialogHeader>
          {!medications?.length ? (
            <div className="py-10 text-center">
              <Pill className="mx-auto h-10 w-10 text-[var(--color-text-muted)] mb-3 opacity-30" />
              <p className="text-sm font-medium text-[var(--color-text)]">No medications recorded</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Go to the Medication tab to add medications.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-subtle)]">
                  <tr>
                    {['Medication', 'Dosage', 'Frequency', 'Route', 'Prescribed By', 'Start Date', 'End Date'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {medications.map((m: {
                    id: string; medicationName: string; dosage?: string | null;
                    frequency?: string | null; route?: string | null;
                    prescribedBy?: string | null; startDate?: string | null; endDate?: string | null;
                  }) => (
                    <tr key={m.id} className="hover:bg-[var(--color-subtle)]">
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{m.medicationName}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.dosage ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.frequency ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.route ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.prescribedBy ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.startDate ? new Date(m.startDate).toLocaleDateString('en-AU') : '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.endDate ? new Date(m.endDate).toLocaleDateString('en-AU') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedPlanOpen(false)}>Close</Button>
            <Button onClick={() => { setMedPlanOpen(false); setActiveTab('medication'); }}>
              <Pill className="h-3.5 w-3.5 mr-1.5" />
              Manage Medications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Case Note ── */}
      <Dialog open={editNoteDialogOpen} onOpenChange={(o) => { setEditNoteDialogOpen(o); if (!o) setEditingNote(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Case Note</DialogTitle></DialogHeader>
          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Subject Line</label>
              <Input {...editNoteForm.register('subject')} placeholder="Subject line" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date</label>
              <Input type="date" {...editNoteForm.register('date')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Case Note *</label>
              <Textarea {...editNoteForm.register('content', { required: 'Content is required' })} rows={4} placeholder="Enter case note here..." />
              {editNoteForm.formState.errors.content && <p className="mt-1 text-xs text-[var(--color-error)]">{editNoteForm.formState.errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Time Spent</label>
                <Input {...editNoteForm.register('timeSpent')} placeholder="00:00" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">How Contacted</label>
                <Select defaultValue={editingNote?.howContacted ?? ''} onValueChange={(v) => editNoteForm.setValue('howContacted', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="In Person">In Person</SelectItem>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Travel (KM)</label>
                <Input {...editNoteForm.register('travelKm')} placeholder="0" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="peer sr-only" {...editNoteForm.register('billable')} />
                <div className="relative w-11 h-6 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-primary)] transition-all">
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                </div>
                <span className="text-sm">Billable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="peer sr-only" {...editNoteForm.register('showToWorker')} />
                <div className="relative w-11 h-6 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-primary)] transition-all">
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                </div>
                <span className="text-sm">Show to Worker</span>
              </label>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditNoteDialogOpen(false); setEditingNote(null); }}>Close</Button>
            <Button
              onClick={editNoteForm.handleSubmit((data) => {
                updateCaseNote({ noteId: editingNote.id, ...data } as Record<string, unknown>, {
                  onSuccess: () => { toast.success('Case note updated'); setEditNoteDialogOpen(false); setEditingNote(null); },
                  onError: () => toast.error('Failed to update case note'),
                });
              })}
              disabled={updatingNote}
            >
              {updatingNote ? 'Saving…' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Case Note ── */}
      <Dialog open={deleteNoteDialogOpen} onOpenChange={(o) => { setDeleteNoteDialogOpen(o); if (!o) setDeletingNoteId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Case Note</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Are you sure you want to delete this Case Note?</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">This action will be recorded in the audit log.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteNoteDialogOpen(false); setDeletingNoteId(null); }}>Close</Button>
            <Button
              variant="destructive"
              disabled={deletingNote}
              onClick={() => {
                if (!deletingNoteId) return;
                deleteCaseNote(deletingNoteId, {
                  onSuccess: () => { toast.success('Case note deleted'); setDeleteNoteDialogOpen(false); setDeletingNoteId(null); },
                  onError: () => toast.error('Failed to delete case note'),
                });
              }}
            >
              {deletingNote ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
