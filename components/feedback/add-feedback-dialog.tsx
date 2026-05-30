'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { feedbackSchema, type FeedbackFormData } from '@/lib/validations/feedback';
import { useCreateFeedback } from '@/hooks/use-feedback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const CATEGORIES = [
  'General',
  'IT Support',
  'HR',
  'Finance',
  'Operations',
  'Compliance',
  'Other',
];

interface AddFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFeedbackDialog({ open, onOpenChange }: AddFeedbackDialogProps) {
  const { data: session } = useSession();
  const createFeedback = useCreateFeedback();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: standardSchemaResolver(feedbackSchema),
    defaultValues: {
      name: session?.user?.name || '',
      status: 'New',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      const submissionData = {
        ...data,
        attachmentName: selectedFile ? selectedFile.name : null,
      };

      await createFeedback.mutateAsync(submissionData);
      toast.success('Feedback submitted successfully!');
      reset();
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Feedback</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Please provide your feedback details below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter your Name <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="Rishi Kumar"
              />
              {errors.name && (
                <p className="text-sm text-[var(--color-error)] mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                {...register('subject')}
                placeholder="Subject"
              />
              {errors.subject && (
                <p className="text-sm text-[var(--color-error)] mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Relevant Category <span className="text-[var(--color-error)]">*</span>
            </label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Please select the category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Details <span className="text-[var(--color-error)]">*</span>
            </label>
            
            {/* Rich Text Editor Mock */}
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
              </div>
              <Textarea
                {...register('details')}
                placeholder="Enter feedback details here..."
                className="border-0 rounded-none min-h-[120px] resize-none bg-transparent px-3 py-2.5 text-sm focus-visible:ring-0"
              />
            </div>
            {errors.details && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.details.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Attachment
            </label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => document.getElementById('feedback-file-upload')?.click()}>
                Choose File
              </Button>
              <input
                id="feedback-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-sm text-[var(--color-text-muted)]">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createFeedback.isPending}>
              {createFeedback.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
