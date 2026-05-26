'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateParticipant } from '@/hooks/use-participants';
import { participantSchema, type ParticipantFormData } from '@/lib/validations/participants';

const AU_STATES = ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory'];

interface AddParticipantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-normal text-[var(--color-text)]">
      {children}{required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[var(--color-error)]">{message}</p>;
}

export function AddParticipantSheet({ open, onOpenChange }: AddParticipantSheetProps) {
  const { mutate: createParticipant, isPending } = useCreateParticipant();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ParticipantFormData>({
    resolver: standardSchemaResolver(participantSchema),
    defaultValues: { 
      auditParticipation: false, 
      status: 'Active',
      serviceSupport: 'Core',
      regionId: 'region_1',
    },
  });

  const onSubmit = (data: ParticipantFormData) => {
    console.log('Form submitted with data:', data);
    createParticipant(data, {
      onSuccess: () => {
        toast.success('Participant added successfully');
        reset();
        onOpenChange(false);
      },
      onError: (error) => {
        console.error('Failed to create participant:', error);
        toast.error('Failed to add participant');
      },
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Add New Participant</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please enter following details to Add a New Participant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="py-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <FieldLabel>First Name</FieldLabel>
              <Input 
                {...register('firstName')} 
                className="h-10 w-full"
                placeholder="Enter first name"
              />
              <FieldError message={errors.firstName?.message} />
            </div>
            <div>
              <FieldLabel>Last Name</FieldLabel>
              <Input 
                {...register('lastName')} 
                className="h-10 w-full"
                placeholder="Enter last name"
              />
              <FieldError message={errors.lastName?.message} />
            </div>

            <div>
              <FieldLabel>Gender</FieldLabel>
              <Select onValueChange={(v) => setValue('gender', v as ParticipantFormData['gender'])}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.gender?.message} />
            </div>
            <div>
              <FieldLabel>Primary Email Address</FieldLabel>
              <Input 
                type="email" 
                {...register('primaryEmailAddress')} 
                className="h-10 w-full"
                placeholder="email@example.com"
              />
              <FieldError message={errors.primaryEmailAddress?.message} />
            </div>

            <div>
              <FieldLabel>Primary Phone Number</FieldLabel>
              <Input 
                {...register('primaryPhoneNumber')} 
                className="h-10 w-full"
                placeholder="0412 345 678"
              />
              <FieldError message={errors.primaryPhoneNumber?.message} />
            </div>
            <div>
              <FieldLabel>Secondary Phone Number</FieldLabel>
              <Input 
                {...register('secondaryPhoneNumber')} 
                className="h-10 w-full"
                placeholder="0412 345 678"
              />
            </div>

            <div>
              <FieldLabel>NDIS No.</FieldLabel>
              <Input 
                {...register('ndisNumber')} 
                className="h-10 w-full"
                placeholder="430123456"
              />
              <FieldError message={errors.ndisNumber?.message} />
            </div>
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <Input 
                type="date" 
                {...register('dateOfBirth')} 
                className="h-10 w-full"
              />
              <FieldError message={errors.dateOfBirth?.message} />
            </div>

            <div>
              <FieldLabel>Street Address</FieldLabel>
              <Input 
                {...register('address')} 
                className="h-10 w-full"
                placeholder="12 Main Street"
              />
              <FieldError message={errors.address?.message} />
            </div>
            <div>
              <FieldLabel>Suburb</FieldLabel>
              <Input 
                {...register('suburb')} 
                className="h-10 w-full"
                placeholder="Sydney"
              />
              <FieldError message={errors.suburb?.message} />
            </div>

            <div>
              <FieldLabel>State</FieldLabel>
              <Select onValueChange={(v) => setValue('state', v)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {AU_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError message={errors.state?.message} />
            </div>
            <div>
              <FieldLabel>Postcode</FieldLabel>
              <Input 
                {...register('postcode')} 
                className="h-10 w-full"
                placeholder="2000"
                maxLength={4}
              />
              <FieldError message={errors.postcode?.message} />
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t">
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={isPending} 
            className="w-full sm:w-auto px-8 h-10"
          >
            {isPending ? 'Adding…' : 'Add Participant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
