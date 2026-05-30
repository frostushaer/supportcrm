'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useCreateQuestion } from '@/hooks/use-questions';
import { questionSchema, type QuestionFormData } from '@/lib/validations/questions';

const CATEGORIES = [
  'Accounting',
  'Compliance',
  'IT',
  'Legal Query',
  'Marketing',
  'Plan Review',
  'Operations',
  'HR',
  'Finance',
];

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

interface AskQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskQuestionDialog({ open, onOpenChange }: AskQuestionDialogProps) {
  const { data: session } = useSession();
  const createQuestion = useCreateQuestion();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: standardSchemaResolver(questionSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
  });

  useEffect(() => {
    if (session?.user?.name) {
      setValue('name', session.user.name);
    }
  }, [session, setValue]);

  const onSubmit = (data: QuestionFormData) => {
    createQuestion.mutate(data, {
      onSuccess: () => {
        toast.success('Question submitted successfully');
        reset();
        onOpenChange(false);
      },
      onError: () => {
        toast.error('Failed to submit question');
      },
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Ask a Question</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Submit your question and our SupportCRM team will get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="py-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <FieldLabel required>Your Name</FieldLabel>
              <Input
                {...register('name')}
                className="h-10 w-full"
                placeholder="Enter your name"
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <FieldLabel required>Subject of Inquiry</FieldLabel>
              <Input
                {...register('subject')}
                className="h-10 w-full"
                placeholder="Enter subject"
              />
              <FieldError message={errors.subject?.message} />
            </div>

            <div className="col-span-2">
              <FieldLabel required>Category</FieldLabel>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.category?.message} />
            </div>

            <div className="col-span-2">
              <FieldLabel required>Details of Inquiry</FieldLabel>
              <Textarea
                {...register('details')}
                className="w-full min-h-[120px] resize-y"
                placeholder="Enter details of your inquiry"
              />
              <FieldError message={errors.details?.message} />
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createQuestion.isPending}
            className="w-full sm:w-auto px-8 h-10"
          >
            {createQuestion.isPending ? 'Submitting…' : 'Submit Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
