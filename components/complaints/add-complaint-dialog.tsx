'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useCreateComplaint } from '@/hooks/use-complaints';
import { complaintSchema, type ComplaintFormData } from '@/lib/validations/complaints';
import { useRegionStore } from '@/store/region-store';
import { cn } from '@/lib/utils';

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

interface AddComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddComplaintDialog({ open, onOpenChange }: AddComplaintDialogProps) {
  const { data: session } = useSession();
  const createComplaint = useCreateComplaint();
  const { selectedRegionId } = useRegionStore();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: standardSchemaResolver(complaintSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
  });

  useEffect(() => {
    if (session?.user?.name) {
      setValue('name', session.user.name);
    }
  }, [session, setValue]);

  useEffect(() => {
    if (date) {
      setValue('date', date.toISOString());
    }
  }, [date, setValue]);

  const onSubmit = (data: ComplaintFormData) => {
    createComplaint.mutate(
      {
        ...data,
        regionId: selectedRegionId,
      },
      {
        onSuccess: () => {
          toast.success('Complaint submitted successfully');
          reset();
          setDate(undefined);
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Failed to submit complaint');
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    setDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Add Complaint</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please add your complaint here
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="py-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <FieldLabel required>Name</FieldLabel>
              <Input
                {...register('name')}
                className="h-10 w-full"
                placeholder=""
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <FieldLabel required>Date</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
              <input type="hidden" {...register('date')} value={date?.toISOString() || ''} />
              <FieldError message={errors.date?.message} />
            </div>

            <div className="col-span-2">
              <FieldLabel required>Subject</FieldLabel>
              <Input
                {...register('subject')}
                className="h-10 w-full"
                placeholder=""
              />
              <FieldError message={errors.subject?.message} />
            </div>

            <div className="col-span-2">
              <FieldLabel required>Details</FieldLabel>
              <Textarea
                {...register('details')}
                className="w-full min-h-[150px] resize-y"
                placeholder=""
              />
              <FieldError message={errors.details?.message} />
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createComplaint.isPending}
            className="w-full sm:w-auto px-8 h-10"
          >
            {createComplaint.isPending ? 'Submitting…' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
