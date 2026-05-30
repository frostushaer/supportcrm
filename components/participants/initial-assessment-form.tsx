'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useInitialAssessment, useSaveInitialAssessment } from '@/hooks/use-participants';
import { toast } from 'sonner';

const STEPS = [
  'Participant',
  'Medical Provider',
  'Centered Plan',
  'Employment & Education',
  'Disability Requirement',
  'Behavior',
  'Services Required',
  'Medication',
  'Routines',
  'My Important Numbers',
  'My Important Services',
  'Insurance & Items',
  'Emergencies',
  'Acknowledgement',
];

const PRIMARY_DISABILITIES = [
  'Acute Brain Injury','Amputation','Anxiety','Acquired Brain Injury',
  'Attention Deficit Disorder (ADHD)','Autism','Bipolar disorder','Blind',
  'Borderline Autism','Learning disability','Borderline Personality Disorder',
  'Cerebral Palsy','Chronic Lung Disease','Depression','Developmental Delay',
  'Down Syndrome','Epilepsy','Hearing Impairment','Intellectual Disability',
  'Mental Health Issues','Multiple sclerosis','Schizophrenia','Scoliosis',
  'Speech Impairment','Spinal Injury','Visual Impairment',
];

interface InterestRow { goals: string; likes: string; dislikes: string }
interface MedProvider { credentials: string; name: string; phone: string; street: string; suburb: string; postcode: string; state: string; email: string }
interface ContactRow { name: string; relationship: string; phone: string }
interface ServiceRow { service: string; provider: string; contact: string; frequency: string }
interface ItemRow { item: string; description: string }
interface BehaviorRow { behavior: string; trigger: string; strategy: string }
interface ServiceRequiredRow { service: string; frequency: string; notes: string }
interface MedicationRow { name: string; dose: string; frequency: string; prescribedBy: string; reason: string }

const AU_STATES = ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania','ACT','Northern Territory'];

function emptyProvider(): MedProvider {
  return { credentials: 'General Practitioner and Medical Doctors', name: '', phone: '', street: '', suburb: '', postcode: '', state: 'New South Wales', email: '' };
}

export function InitialAssessmentForm({
  open,
  onClose,
  participantId,
  participantName,
}: {
  open: boolean;
  onClose: () => void;
  participantId: string;
  participantName: string;
}) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<boolean[]>(Array(STEPS.length).fill(false));

  const { data: existing } = useInitialAssessment(participantId);
  const { mutate: saveAssessment, isPending: isSaving } = useSaveInitialAssessment(participantId);

  // ── Step 0: Participant ──
  const [languageSpoken, setLanguageSpoken] = useState('');
  const [culturalBackground, setCulturalBackground] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [planValidUntil, setPlanValidUntil] = useState('');

  // ── Step 1: Medical Provider ──
  const [providers, setProviders] = useState<MedProvider[]>([emptyProvider()]);

  // ── Step 2: Centered Plan ──
  const [interests, setInterests] = useState<InterestRow[]>([{ goals: '', likes: '', dislikes: '' }]);
  const [strength, setStrength] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [participantPreferences, setParticipantPreferences] = useState('');
  const [aboriginal, setAboriginal] = useState('No');
  const [culturalPractices, setCulturalPractices] = useState('');
  const [genderRestriction, setGenderRestriction] = useState('No');
  const [specialConsiderations, setSpecialConsiderations] = useState('');

  // ── Step 3: Employment & Education ──
  const [educationLevel, setEducationLevel] = useState('');
  const [educationNotes, setEducationNotes] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [employmentNotes, setEmploymentNotes] = useState('');

  // ── Step 4: Disability Requirement ──
  const [primaryDisability, setPrimaryDisability] = useState('');
  const [secondaryDisability, setSecondaryDisability] = useState('None');
  const [physicalRestrictions, setPhysicalRestrictions] = useState('Not at all');
  const [hearingImpairment, setHearingImpairment] = useState('Not at all');
  const [visualImpairment, setVisualImpairment] = useState('Not at all');
  const [communicateNeeds, setCommunicateNeeds] = useState('Verbally');
  const [nonVerbalMethod, setNonVerbalMethod] = useState('');
  const [communicationAid, setCommunicationAid] = useState('No');
  const [followInstructions, setFollowInstructions] = useState('Yes');
  const [respondToName, setRespondToName] = useState('Yes');
  const [communicatePain, setCommunicatePain] = useState('');
  const [commNotes, setCommNotes] = useState('');
  const [dependency, setDependency] = useState('Semi-Independent');
  const [needsPhysicalSupport, setNeedsPhysicalSupport] = useState('No');
  const [usesWheelchair, setUsesWheelchair] = useState('No');
  const [physicalAssistance, setPhysicalAssistance] = useState('No');
  const [physicalActivities, setPhysicalActivities] = useState<string[]>([]);
  const [physicalOther, setPhysicalOther] = useState('');
  const [degreeOfReliance, setDegreeOfReliance] = useState('Moderate');

  // ── Step 5: Behavior ──
  const [behaviors, setBehaviors] = useState<BehaviorRow[]>([{ behavior: '', trigger: '', strategy: '' }]);
  const [behaviorTriggers, setBehaviorTriggers] = useState('');
  const [behaviorStrategies, setBehaviorStrategies] = useState('');

  // ── Step 6: Services Required ──
  const [servicesRequired, setServicesRequired] = useState<ServiceRequiredRow[]>([{ service: '', frequency: '', notes: '' }]);

  // ── Step 7: Medication ──
  const [medications, setMedications] = useState<MedicationRow[]>([{ name: '', dose: '', frequency: '', prescribedBy: '', reason: '' }]);
  const [medicationAllergies, setMedicationAllergies] = useState('');
  const [medicationNotes, setMedicationNotes] = useState('');

  // ── Step 8: Routines ──
  const [morningRoutine, setMorningRoutine] = useState('');
  const [afternoonRoutine, setAfternoonRoutine] = useState('');
  const [eveningRoutine, setEveningRoutine] = useState('');

  // ── Step 9: Important Numbers ──
  const [importantNumbers, setImportantNumbers] = useState<ContactRow[]>([{ name: '', relationship: '', phone: '' }]);

  // ── Step 10: Important Services ──
  const [importantServices, setImportantServices] = useState<ServiceRow[]>([{ service: '', provider: '', contact: '', frequency: '' }]);

  // ── Step 11: Insurance & Items ──
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [importantItems, setImportantItems] = useState<ItemRow[]>([{ item: '', description: '' }]);

  // ── Step 12: Emergencies ──
  const [emergencyPlan, setEmergencyPlan] = useState('');
  const [evacuationPlan, setEvacuationPlan] = useState('');

  // ── Step 13: Acknowledgement (signatures) ──
  const participantSigRef = useRef<HTMLCanvasElement>(null);
  const staffSigRef = useRef<HTMLCanvasElement>(null);
  const [participantSignDate, setParticipantSignDate] = useState('');
  const [staffSignDate, setStaffSignDate] = useState('');
  const [isDrawing, setIsDrawing] = useState<'participant' | 'staff' | null>(null);

  // Hydrate from DB on open
  useEffect(() => {
    if (!existing || !open) return;
    const d = existing as Record<string, unknown>;
    if (d.languageSpoken) setLanguageSpoken(d.languageSpoken as string);
    if (d.culturalBackground) setCulturalBackground(d.culturalBackground as string);
    if (d.ethnicity) setEthnicity(d.ethnicity as string);
    if (d.aboutMe) setAboutMe(d.aboutMe as string);
    if (d.planValidUntil) setPlanValidUntil((d.planValidUntil as string).slice(0, 10));
    if (d.medicalProviders) setProviders(d.medicalProviders as MedProvider[]);
    if (d.interests) setInterests(d.interests as InterestRow[]);
    if (d.strength) setStrength(d.strength as string);
    if (d.areasForImprovement) setAreasForImprovement(d.areasForImprovement as string);
    if (d.participantPreferences) setParticipantPreferences(d.participantPreferences as string);
    if (d.aboriginal) setAboriginal(d.aboriginal as string);
    if (d.culturalPractices) setCulturalPractices(d.culturalPractices as string);
    if (d.genderRestriction) setGenderRestriction(d.genderRestriction as string);
    if (d.specialConsiderations) setSpecialConsiderations(d.specialConsiderations as string);
    if (d.educationLevel) setEducationLevel(d.educationLevel as string);
    if (d.educationNotes) setEducationNotes(d.educationNotes as string);
    if (d.employmentStatus) setEmploymentStatus(d.employmentStatus as string);
    if (d.employmentNotes) setEmploymentNotes(d.employmentNotes as string);
    if (d.primaryDisability) setPrimaryDisability(d.primaryDisability as string);
    if (d.secondaryDisability) setSecondaryDisability(d.secondaryDisability as string);
    if (d.physicalRestrictions) setPhysicalRestrictions(d.physicalRestrictions as string);
    if (d.hearingImpairment) setHearingImpairment(d.hearingImpairment as string);
    if (d.visualImpairment) setVisualImpairment(d.visualImpairment as string);
    if (d.communicateNeeds) setCommunicateNeeds(d.communicateNeeds as string);
    if (d.nonVerbalMethod) setNonVerbalMethod(d.nonVerbalMethod as string);
    if (d.communicationAid) setCommunicationAid(d.communicationAid as string);
    if (d.followInstructions) setFollowInstructions(d.followInstructions as string);
    if (d.respondToName) setRespondToName(d.respondToName as string);
    if (d.communicatePain) setCommunicatePain(d.communicatePain as string);
    if (d.communicationNotes) setCommNotes(d.communicationNotes as string);
    if (d.dependency) setDependency(d.dependency as string);
    if (d.needsPhysicalSupport) setNeedsPhysicalSupport(d.needsPhysicalSupport as string);
    if (d.usesWheelchair) setUsesWheelchair(d.usesWheelchair as string);
    if (d.physicalAssistance) setPhysicalAssistance(d.physicalAssistance as string);
    if (d.physicalActivities) setPhysicalActivities(d.physicalActivities as string[]);
    if (d.physicalOther) setPhysicalOther(d.physicalOther as string);
    if (d.degreeOfReliance) setDegreeOfReliance(d.degreeOfReliance as string);
    if (d.behaviorsOfConcern) setBehaviors(d.behaviorsOfConcern as BehaviorRow[]);
    if (d.behaviorTriggers) setBehaviorTriggers(d.behaviorTriggers as string);
    if (d.behaviorStrategies) setBehaviorStrategies(d.behaviorStrategies as string);
    if (d.servicesRequired) setServicesRequired(d.servicesRequired as ServiceRequiredRow[]);
    if (d.morningRoutine) setMorningRoutine(d.morningRoutine as string);
    if (d.afternoonRoutine) setAfternoonRoutine(d.afternoonRoutine as string);
    if (d.eveningRoutine) setEveningRoutine(d.eveningRoutine as string);
    if (d.importantNumbers) setImportantNumbers(d.importantNumbers as ContactRow[]);
    if (d.importantServices) setImportantServices(d.importantServices as ServiceRow[]);
    if (d.insuranceProvider) setInsuranceProvider(d.insuranceProvider as string);
    if (d.insurancePolicyNumber) setInsurancePolicyNumber(d.insurancePolicyNumber as string);
    if (d.importantItems) setImportantItems(d.importantItems as ItemRow[]);
    if (d.emergencyPlan) setEmergencyPlan(d.emergencyPlan as string);
    if (d.evacuationPlan) setEvacuationPlan(d.evacuationPlan as string);
    if (d.participantSignDate) setParticipantSignDate((d.participantSignDate as string).slice(0, 10));
    if (d.staffSignDate) setStaffSignDate((d.staffSignDate as string).slice(0, 10));
  }, [existing, open]);

  // ── Build full payload ──
  const buildPayload = (status = 'Draft') => ({
    languageSpoken, culturalBackground, ethnicity, aboutMe,
    planValidUntil: planValidUntil || null,
    medicalProviders: providers,
    interests, strength, areasForImprovement, participantPreferences,
    aboriginal, culturalPractices, genderRestriction, specialConsiderations,
    educationLevel, educationNotes, employmentStatus, employmentNotes,
    primaryDisability, secondaryDisability, physicalRestrictions,
    hearingImpairment, visualImpairment, communicateNeeds, nonVerbalMethod,
    communicationAid, followInstructions, respondToName, communicatePain,
    communicationNotes: commNotes, dependency, needsPhysicalSupport,
    usesWheelchair, physicalAssistance, physicalActivities, physicalOther, degreeOfReliance,
    behaviorsOfConcern: behaviors, behaviorTriggers, behaviorStrategies,
    servicesRequired,
    medicationNotes, medicationAllergies,
    morningRoutine, afternoonRoutine, eveningRoutine,
    importantNumbers, importantServices,
    insuranceProvider, insurancePolicyNumber, importantItems,
    emergencyPlan, evacuationPlan,
    participantSignDate: participantSignDate || null,
    staffSignDate: staffSignDate || null,
    participantSignature: participantSigRef.current?.toDataURL() ?? null,
    staffSignature: staffSigRef.current?.toDataURL() ?? null,
    status,
    submittedAt: status === 'Submitted' ? new Date().toISOString() : null,
  });

  const markSaved = (s = step) => {
    const next = [...saved];
    next[s] = true;
    setSaved(next);
  };

  const handleNext = () => {
    markSaved();
    saveAssessment(buildPayload() as Record<string, unknown>);
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => { if (step > 0) setStep(step - 1); };

  const handleSaveExit = () => {
    markSaved();
    saveAssessment(buildPayload() as Record<string, unknown>, {
      onSuccess: () => { toast.success('Assessment saved'); onClose(); },
      onError: () => toast.error('Failed to save'),
    });
  };

  const handleSubmit = () => {
    markSaved();
    saveAssessment(buildPayload('Submitted') as Record<string, unknown>, {
      onSuccess: () => { toast.success('Assessment submitted!'); onClose(); },
      onError: () => toast.error('Failed to submit'),
    });
  };

  const handleClearExit = () => {
    setStep(0);
    setSaved(Array(STEPS.length).fill(false));
    onClose();
  };

  const toggleActivity = (a: string) =>
    setPhysicalActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  // Canvas drawing helpers
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (ref: React.RefObject<HTMLCanvasElement | null>, who: 'participant' | 'staff') =>
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const c = ref.current; if (!c) return;
      setIsDrawing(who);
      const ctx = c.getContext('2d')!;
      const { x, y } = getPos(e, c);
      ctx.beginPath(); ctx.moveTo(x, y);
    };

  const draw = (ref: React.RefObject<HTMLCanvasElement | null>, who: 'participant' | 'staff') =>
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (isDrawing !== who) return;
      const c = ref.current; if (!c) return;
      const ctx = c.getContext('2d')!;
      const { x, y } = getPos(e, c);
      ctx.lineWidth = 2; ctx.strokeStyle = '#000';
      ctx.lineTo(x, y); ctx.stroke();
    };

  const stopDraw = () => setIsDrawing(null);

  const clearSig = (ref: React.RefObject<HTMLCanvasElement | null>) => {
    const c = ref.current; if (!c) return;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <DialogTitle className="text-base font-semibold text-[var(--color-text)]">Initial Assessment Form</DialogTitle>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
              {participantName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-xs font-medium text-[var(--color-text)]">{participantName}</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-[var(--color-primary)] px-6 py-3 shrink-0 overflow-x-auto">
          <ol className="flex items-center min-w-max">
            {STEPS.map((s, i) => {
              const isComplete = saved[i] || i < step;
              const isCurrent = i === step;
              return (
                <li key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <button
                    onClick={() => setStep(i)}
                    title={s}
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all
                      ${isComplete ? 'bg-white text-[var(--color-primary)]' :
                        isCurrent ? 'bg-white/90 border-2 border-white text-[var(--color-primary)]' :
                        'bg-white/20 border border-white/40 text-white'}`}
                  >
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                    ) : (
                      <span className="text-[10px] text-white/70">{i + 1}</span>
                    )}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 mx-0.5 shrink-0 ${isComplete ? 'bg-white' : 'bg-white/30'}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-text)]">{STEPS[step]}</h2>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email This Form
            </Button>
          </div>

          {/* ── 0: Participant ── */}
          {step === 0 && (
            <Section title="Participant Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Language Spoken"><Input value={languageSpoken} onChange={e => setLanguageSpoken(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                <Field label="Cultural Background"><Input value={culturalBackground} onChange={e => setCulturalBackground(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                <Field label="Ethnicity"><Input value={ethnicity} onChange={e => setEthnicity(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                <Field label="About Me"><Input value={aboutMe} onChange={e => setAboutMe(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                <Field label="Support plan valid until" className="col-span-2"><Input type="date" value={planValidUntil} onChange={e => setPlanValidUntil(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
              </div>
            </Section>
          )}

          {/* ── 1: Medical Provider ── */}
          {step === 1 && (
            <div className="space-y-4">
              {providers.map((p, i) => (
                <Section key={i} title={`Carer / Provider ${i + 1}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Credentials">
                      <Select value={p.credentials} onValueChange={v => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, credentials: v } : pr))}>
                        <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['General Practitioner and Medical Doctors','Dentist','Physiotherapist','Occupational Therapist','Speech Therapist','Psychologist','Advocate','Carer Details','Other'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Name"><Input value={p.name} onChange={e => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, name: e.target.value } : pr))} className="h-10 bg-[var(--color-bg)]" /></Field>
                    <Field label="Phone Number" className="col-span-2"><Input value={p.phone} onChange={e => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, phone: e.target.value } : pr))} className="h-10 bg-[var(--color-bg)]" /></Field>
                    <Field label="Street Name"><Input value={p.street} onChange={e => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, street: e.target.value } : pr))} className="h-10 bg-[var(--color-bg)]" /></Field>
                    <Field label="Suburb"><Input value={p.suburb} onChange={e => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, suburb: e.target.value } : pr))} className="h-10 bg-[var(--color-bg)]" /></Field>
                    <Field label="Postcode"><Input value={p.postcode} onChange={e => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, postcode: e.target.value } : pr))} className="h-10 bg-[var(--color-bg)]" /></Field>
                    <Field label="State">
                      <Select value={p.state} onValueChange={v => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, state: v } : pr))}>
                        <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                        <SelectContent>{AU_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Email Address" className="col-span-2"><Input type="email" value={p.email} onChange={e => setProviders(prev => prev.map((pr, idx) => idx === i ? { ...pr, email: e.target.value } : pr))} className="h-10 bg-[var(--color-bg)]" /></Field>
                    {providers.length > 1 && (
                      <div className="col-span-2 flex justify-end">
                        <Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setProviders(prev => prev.filter((_, idx) => idx !== i))}>Remove</Button>
                      </div>
                    )}
                  </div>
                </Section>
              ))}
              <Button size="sm" className="h-9 bg-[var(--color-primary)] text-white" onClick={() => setProviders(p => [...p, emptyProvider()])}>+ Add Other</Button>
            </div>
          )}

          {/* ── 2: Centered Plan ── */}
          {step === 2 && (
            <div className="space-y-5">
              <Section title="Participant Centered Planning — Interests">
                <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-subtle)]">
                      <tr>{['Goals','Likes','Dislikes',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {interests.map((row, i) => (
                        <tr key={i}>
                          {(['goals','likes','dislikes'] as const).map(f => (
                            <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setInterests(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs" /></td>
                          ))}
                          <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={() => setInterests(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setInterests(r => [...r, { goals: '', likes: '', dislikes: '' }])}>+ Row</Button>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <Field label="Strength"><Input value={strength} onChange={e => setStrength(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <Field label="Areas for improvement"><Input value={areasForImprovement} onChange={e => setAreasForImprovement(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <Field label="Participant Preferences" className="col-span-2"><Textarea value={participantPreferences} onChange={e => setParticipantPreferences(e.target.value)} rows={2} className="bg-[var(--color-bg)] resize-none" /></Field>
                </div>
              </Section>
              <Section title="Cultural Consideration">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Do you identify yourself as someone from Aboriginal or Torres Strait Islander background?</p><RadioGroup value={aboriginal} onChange={setAboriginal} options={['Yes','No']} /></div>
                  <Field label="Cultural practices, festivals, holidays or observances?"><Input value={culturalPractices} onChange={e => setCulturalPractices(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Gender specific restrictions or preferences for support worker?</p><RadioGroup value={genderRestriction} onChange={setGenderRestriction} options={['Male','Female','No']} /></div>
                  <Field label="Special Considerations"><Input value={specialConsiderations} onChange={e => setSpecialConsiderations(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                </div>
              </Section>
            </div>
          )}

          {/* ── 3: Employment & Education ── */}
          {step === 3 && (
            <div className="space-y-5">
              <Section title="Education Background">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Highest Education Level">
                    <Select value={educationLevel} onValueChange={setEducationLevel}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{['Primary School','High School','Certificate','Diploma','Bachelor Degree','Postgraduate','None'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Education Notes" className="col-span-2"><Textarea value={educationNotes} onChange={e => setEducationNotes(e.target.value)} rows={3} className="bg-[var(--color-bg)] resize-none" /></Field>
                </div>
              </Section>
              <Section title="Employment Background">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Employment Status">
                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{['Employed Full Time','Employed Part Time','Self Employed','Unemployed','Retired','Unable to Work','Volunteer','Student'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Employment Notes" className="col-span-2"><Textarea value={employmentNotes} onChange={e => setEmploymentNotes(e.target.value)} rows={3} className="bg-[var(--color-bg)] resize-none" /></Field>
                </div>
              </Section>
            </div>
          )}

          {/* ── 4: Disability Requirement ── */}
          {step === 4 && (
            <div className="space-y-5">
              <Section title="Disability Requirement">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary Disability">
                    <Select value={primaryDisability} onValueChange={setPrimaryDisability}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{PRIMARY_DISABILITIES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Secondary Disability">
                    <Select value={secondaryDisability} onValueChange={setSecondaryDisability}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>{['None',...PRIMARY_DISABILITIES].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Physical Restrictions">
                    <Select value={physicalRestrictions} onValueChange={setPhysicalRestrictions}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>{['Extremely Restricted','Very Restricted','Moderately Restricted','Slightly Restricted','Not at all'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Hearing Impairment">
                    <Select value={hearingImpairment} onValueChange={setHearingImpairment}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>{['Extremely Impaired','Very Impaired','Moderately Impaired','Slightly Impaired','Not at all'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Visual Impairment">
                    <Select value={visualImpairment} onValueChange={setVisualImpairment}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>{['Extremely Impaired','Very Impaired','Moderately Impaired','Slightly Impaired','Not at all'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>
              <Section title="Communication">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Ability to communicate needs?</p><RadioGroup value={communicateNeeds} onChange={setCommunicateNeeds} options={['Verbally','Non-Verbally','No','Other']} horizontal /></div>
                  <Field label="Non-verbal communication method"><Input value={nonVerbalMethod} onChange={e => setNonVerbalMethod(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Requires communication aid?</p><RadioGroup value={communicationAid} onChange={setCommunicationAid} options={['Yes','No']} /></div>
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Understands and follows simple instructions?</p><RadioGroup value={followInstructions} onChange={setFollowInstructions} options={['Yes','No']} /></div>
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Responds when name is called?</p><RadioGroup value={respondToName} onChange={setRespondToName} options={['Yes','No']} /></div>
                  <Field label="How does participant communicate pain?"><Input value={communicatePain} onChange={e => setCommunicatePain(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <Field label="Communication Notes" className="col-span-2"><Input value={commNotes} onChange={e => setCommNotes(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                </div>
              </Section>
              <Section title="Physical Support Needs">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Dependency">
                    <Select value={dependency} onValueChange={setDependency}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent>{['Totally Dependent','Semi-Independent','Independent'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <div><p className="text-xs text-[var(--color-text-muted)] mb-2">Uses a wheelchair?</p><RadioGroup value={usesWheelchair} onChange={setUsesWheelchair} options={['Yes','No']} /></div>
                  <Field label="Needs physical support?">
                    <Select value={needsPhysicalSupport} onValueChange={setNeedsPhysicalSupport}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field label="Requires physical assistance?">
                    <Select value={physicalAssistance} onValueChange={setPhysicalAssistance}>
                      <SelectTrigger className="h-10 bg-[var(--color-bg)]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] mt-3 mb-2">Assistance required with:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Domestic Activities','Community Participation','Toileting','Walking','Feeding','Showering','Dressing','Grooming'].map(a => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={physicalActivities.includes(a)} onChange={() => toggleActivity(a)} className="h-4 w-4 rounded" />
                      <span className="text-sm text-[var(--color-text)]">{a}</span>
                    </label>
                  ))}
                </div>
                <Field label="Other" className="mt-3"><Input value={physicalOther} onChange={e => setPhysicalOther(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
              </Section>
              <Section title="Degree of Reliance">
                <p className="text-xs text-[var(--color-text-muted)] mb-2">To what degree is the participant relying on provider services to meet daily living needs?</p>
                <RadioGroup value={degreeOfReliance} onChange={setDegreeOfReliance} options={['Very Little','Moderate','Very High']} horizontal />
              </Section>
            </div>
          )}

          {/* ── 5: Behavior ── */}
          {step === 5 && (
            <div className="space-y-5">
              <Section title="Behaviors of Concern">
                <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-subtle)]">
                      <tr>{['Behavior','Trigger','Strategy',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {behaviors.map((row, i) => (
                        <tr key={i}>
                          {(['behavior','trigger','strategy'] as const).map(f => (
                            <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setBehaviors(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs" /></td>
                          ))}
                          <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setBehaviors(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setBehaviors(r => [...r, { behavior: '', trigger: '', strategy: '' }])}>+ Row</Button>
              </Section>
              <Section title="General Behavior Notes">
                <div className="space-y-3">
                  <Field label="Known Triggers"><Textarea value={behaviorTriggers} onChange={e => setBehaviorTriggers(e.target.value)} rows={3} className="bg-[var(--color-bg)] resize-none" /></Field>
                  <Field label="De-escalation Strategies"><Textarea value={behaviorStrategies} onChange={e => setBehaviorStrategies(e.target.value)} rows={3} className="bg-[var(--color-bg)] resize-none" /></Field>
                </div>
              </Section>
            </div>
          )}

          {/* ── 6: Services Required ── */}
          {step === 6 && (
            <Section title="Services Required">
              <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-subtle)]">
                    <tr>{['Service','Frequency','Notes',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {servicesRequired.map((row, i) => (
                      <tr key={i}>
                        {(['service','frequency','notes'] as const).map(f => (
                          <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setServicesRequired(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs" /></td>
                        ))}
                        <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setServicesRequired(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setServicesRequired(r => [...r, { service: '', frequency: '', notes: '' }])}>+ Row</Button>
            </Section>
          )}

          {/* ── 7: Medication ── */}
          {step === 7 && (
            <div className="space-y-5">
              <Section title="Medication List">
                <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-subtle)]">
                      <tr>{['Medication','Dose','Frequency','Prescribed By','Reason',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {medications.map((row, i) => (
                        <tr key={i}>
                          {(['name','dose','frequency','prescribedBy','reason'] as const).map(f => (
                            <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setMedications(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs w-24" /></td>
                          ))}
                          <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setMedications(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setMedications(r => [...r, { name: '', dose: '', frequency: '', prescribedBy: '', reason: '' }])}>+ Row</Button>
              </Section>
              <Section title="Medication Notes">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Allergies / Adverse Reactions"><Input value={medicationAllergies} onChange={e => setMedicationAllergies(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <Field label="General Notes" className="col-span-2"><Textarea value={medicationNotes} onChange={e => setMedicationNotes(e.target.value)} rows={3} className="bg-[var(--color-bg)] resize-none" /></Field>
                </div>
              </Section>
            </div>
          )}

          {/* ── 8: Routines ── */}
          {step === 8 && (
            <Section title="Daily Routines">
              <div className="space-y-4">
                <Field label="Morning Routine"><Textarea value={morningRoutine} onChange={e => setMorningRoutine(e.target.value)} rows={4} placeholder="Describe morning activities, wake-up time, personal care..." className="bg-[var(--color-bg)] resize-none" /></Field>
                <Field label="Afternoon Routine"><Textarea value={afternoonRoutine} onChange={e => setAfternoonRoutine(e.target.value)} rows={4} placeholder="Describe afternoon activities, meals, outings..." className="bg-[var(--color-bg)] resize-none" /></Field>
                <Field label="Evening Routine"><Textarea value={eveningRoutine} onChange={e => setEveningRoutine(e.target.value)} rows={4} placeholder="Describe evening activities, bedtime routine..." className="bg-[var(--color-bg)] resize-none" /></Field>
              </div>
            </Section>
          )}

          {/* ── 9: Important Numbers ── */}
          {step === 9 && (
            <Section title="My Important Numbers">
              <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-subtle)]">
                    <tr>{['Name','Relationship','Phone',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {importantNumbers.map((row, i) => (
                      <tr key={i}>
                        {(['name','relationship','phone'] as const).map(f => (
                          <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setImportantNumbers(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs" /></td>
                        ))}
                        <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setImportantNumbers(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setImportantNumbers(r => [...r, { name: '', relationship: '', phone: '' }])}>+ Row</Button>
            </Section>
          )}

          {/* ── 10: Important Services ── */}
          {step === 10 && (
            <Section title="My Important Services">
              <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-subtle)]">
                    <tr>{['Service','Provider','Contact','Frequency',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {importantServices.map((row, i) => (
                      <tr key={i}>
                        {(['service','provider','contact','frequency'] as const).map(f => (
                          <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setImportantServices(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs" /></td>
                        ))}
                        <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setImportantServices(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setImportantServices(r => [...r, { service: '', provider: '', contact: '', frequency: '' }])}>+ Row</Button>
            </Section>
          )}

          {/* ── 11: Insurance & Items ── */}
          {step === 11 && (
            <div className="space-y-5">
              <Section title="Insurance Information">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Insurance Provider"><Input value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  <Field label="Policy Number"><Input value={insurancePolicyNumber} onChange={e => setInsurancePolicyNumber(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                </div>
              </Section>
              <Section title="My Important Items">
                <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-subtle)]">
                      <tr>{['Item','Description',''].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text)]">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {importantItems.map((row, i) => (
                        <tr key={i}>
                          {(['item','description'] as const).map(f => (
                            <td key={f} className="px-2 py-1.5"><Input value={row[f]} onChange={e => setImportantItems(r => r.map((x, idx) => idx === i ? { ...x, [f]: e.target.value } : x))} className="h-9 bg-[var(--color-bg)] text-xs" /></td>
                          ))}
                          <td className="px-2 py-1.5"><Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => setImportantItems(r => r.filter((_, idx) => idx !== i))}>Del</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button size="sm" className="h-8 bg-[var(--color-primary)] text-white text-xs mt-2" onClick={() => setImportantItems(r => [...r, { item: '', description: '' }])}>+ Row</Button>
              </Section>
            </div>
          )}

          {/* ── 12: Emergencies ── */}
          {step === 12 && (
            <Section title="Emergency Plans">
              <div className="space-y-4">
                <Field label="Emergency Response Plan"><Textarea value={emergencyPlan} onChange={e => setEmergencyPlan(e.target.value)} rows={5} placeholder="Describe what to do in case of emergency, who to contact first, medical conditions to disclose..." className="bg-[var(--color-bg)] resize-none" /></Field>
                <Field label="Evacuation Plan"><Textarea value={evacuationPlan} onChange={e => setEvacuationPlan(e.target.value)} rows={5} placeholder="Describe evacuation procedures, mobility aids required, assembly points..." className="bg-[var(--color-bg)] resize-none" /></Field>
              </div>
            </Section>
          )}

          {/* ── 13: Acknowledgement ── */}
          {step === 13 && (
            <div className="space-y-5">
              <Section title="Signatures">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">Participant Signature</p>
                    <canvas
                      ref={participantSigRef}
                      width={300} height={120}
                      className="w-full h-28 border rounded-lg bg-gray-50 cursor-crosshair touch-none"
                      onMouseDown={startDraw(participantSigRef, 'participant')}
                      onMouseMove={draw(participantSigRef, 'participant')}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw(participantSigRef, 'participant')}
                      onTouchMove={draw(participantSigRef, 'participant')}
                      onTouchEnd={stopDraw}
                    />
                    <button onClick={() => clearSig(participantSigRef)} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      clear
                    </button>
                    <Field label="Participant Signature Date"><Input type="date" value={participantSignDate} onChange={e => setParticipantSignDate(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">Staff Signature</p>
                    <canvas
                      ref={staffSigRef}
                      width={300} height={120}
                      className="w-full h-28 border rounded-lg bg-gray-50 cursor-crosshair touch-none"
                      onMouseDown={startDraw(staffSigRef, 'staff')}
                      onMouseMove={draw(staffSigRef, 'staff')}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw(staffSigRef, 'staff')}
                      onTouchMove={draw(staffSigRef, 'staff')}
                      onTouchEnd={stopDraw}
                    />
                    <button onClick={() => clearSig(staffSigRef)} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      clear
                    </button>
                    <Field label="Staff Signature Date"><Input type="date" value={staffSignDate} onChange={e => setStaffSignDate(e.target.value)} className="h-10 bg-[var(--color-bg)]" /></Field>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] shrink-0 bg-[var(--color-bg)]">
          <Button variant="outline" className="h-9 px-4 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 text-sm" onClick={handleClearExit}>
            Clear &amp; Exit
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleBack}>Back</Button>
            )}
            <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleSaveExit} disabled={isSaving}>
              Save &amp; Exit
            </Button>
            {step < STEPS.length - 1 ? (
              <Button className="h-9 px-4 text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white" onClick={handleNext} disabled={isSaving}>
                Save &amp; Next
              </Button>
            ) : (
              <Button className="h-9 px-4 text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Submitting…' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs text-[var(--color-text-muted)]">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-subtle)] p-4 space-y-3">
      <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
      {children}
    </div>
  );
}

function RadioGroup({ value, onChange, options, horizontal = false }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  horizontal?: boolean;
}) {
  return (
    <div className={`flex gap-4 ${horizontal ? 'flex-row flex-wrap' : 'flex-col'}`}>
      {options.map(o => (
        <label key={o} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === o}
            onChange={() => onChange(o)}
            className="h-4 w-4 text-[var(--color-primary)]"
          />
          <span className="text-sm text-[var(--color-text)]">{o}</span>
        </label>
      ))}
    </div>
  );
}
