'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateParticipant } from '@/hooks/use-participants';
import { participantSchema, type ParticipantFormData } from '@/lib/validations/participants';

const REGIONS = [
  { id: 'region_1', name: 'Sydney Metro' },
  { id: 'region_2', name: 'Melbourne Metro' },
  { id: 'region_3', name: 'Brisbane Metro' },
  { id: 'region_4', name: 'Perth Metro' },
];

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

interface AddParticipantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddParticipantSheet({ open, onOpenChange }: AddParticipantSheetProps) {
  const [step, setStep] = useState(1);
  const { mutate: createParticipant, isPending } = useCreateParticipant();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ParticipantFormData>({
    resolver: standardSchemaResolver(participantSchema),
    defaultValues: { auditParticipation: false },
  });

  const onSubmit = (data: ParticipantFormData) => {
    createParticipant(data, {
      onSuccess: () => {
        reset();
        setStep(1);
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>Add New Participant</SheetTitle>
          <SheetDescription>
            Step {step} of 4 — {
              step === 1 ? 'Personal Details'
              : step === 2 ? 'Contact Information'
              : step === 3 ? 'NDIS Details'
              : 'Region Assignment'
            }
          </SheetDescription>
        </SheetHeader>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-4 pb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-subtle)]'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">First Name</label>
                  <Input {...register('firstName')} placeholder="Jane" />
                  {errors.firstName && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Last Name</label>
                  <Input {...register('lastName')} placeholder="Smith" />
                  {errors.lastName && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Gender</label>
                <Select onValueChange={(v) => setValue('gender', String(v) as ParticipantFormData['gender'])}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.gender.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Date of Birth</label>
                <Input type="date" {...register('dateOfBirth')} />
                {errors.dateOfBirth && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.dateOfBirth.message}</p>}
              </div>
            </>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Email Address</label>
                <Input type="email" {...register('primaryEmailAddress')} placeholder="jane@example.com" />
                {errors.primaryEmailAddress && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.primaryEmailAddress.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Primary Phone</label>
                <Input {...register('primaryPhoneNumber')} placeholder="0412 345 678" />
                {errors.primaryPhoneNumber && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.primaryPhoneNumber.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Secondary Phone <span className="text-[var(--color-text-muted)]">(optional)</span></label>
                <Input {...register('secondaryPhoneNumber')} placeholder="0298 765 432" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Address</label>
                <Input {...register('address')} placeholder="12 Main Street" />
                {errors.address && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Suburb</label>
                  <Input {...register('suburb')} placeholder="Sydney" />
                  {errors.suburb && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.suburb.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">State</label>
                  <Select onValueChange={(v) => setValue('state', String(v))}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      {AU_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Postcode</label>
                  <Input {...register('postcode')} placeholder="2000" maxLength={4} />
                  {errors.postcode && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.postcode.message}</p>}
                </div>
              </div>
            </>
          )}

          {/* Step 3: NDIS Details */}
          {step === 3 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">NDIS Number</label>
                <Input {...register('ndisNumber')} placeholder="430123456" maxLength={9} />
                {errors.ndisNumber && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.ndisNumber.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Status</label>
                <Select onValueChange={(v) => setValue('status', String(v) as ParticipantFormData['status'])}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.status.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Service Support</label>
                <Select onValueChange={(v) => setValue('serviceSupport', String(v) as ParticipantFormData['serviceSupport'])}>
                  <SelectTrigger><SelectValue placeholder="Select support type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Capacity Building">Capacity Building</SelectItem>
                    <SelectItem value="Capital">Capital</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceSupport && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.serviceSupport.message}</p>}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="auditParticipation"
                  className="h-4 w-4 rounded border-[var(--color-border)]"
                  checked={watch('auditParticipation')}
                  onChange={(e) => setValue('auditParticipation', e.target.checked)}
                />
                <label htmlFor="auditParticipation" className="text-sm text-[var(--color-text)]">
                  Included in audit participation
                </label>
              </div>
            </>
          )}

          {/* Step 4: Region */}
          {step === 4 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Region</label>
              <Select onValueChange={(v) => setValue('regionId', String(v))}>
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.regionId && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.regionId.message}</p>}
            </div>
          )}
        </form>

        <SheetFooter className="border-t border-[var(--color-border)] px-4 pt-4">
          <div className="flex w-full justify-between">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Participant'}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
