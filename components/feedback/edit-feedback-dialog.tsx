'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { feedbackSchema, type FeedbackFormData, FEEDBACK_CATEGORIES } from '@/lib/validations/feedback';
import { useFeedback, useUpdateFeedback } from '@/hooks/use-feedback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EditFeedbackDialogProps {
  feedbackId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFeedbackDialog({ feedbackId, open, onOpenChange }: EditFeedbackDialogProps) {
  const { data: feedback, isLoading } = useFeedback(feedbackId);
  const updateFeedback = useUpdateFeedback(feedbackId);
  
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
      name: '',
      status: 'New',
    },
  });

  useEffect(() => {
    if (feedback) {
      reset({
        name: feedback.name,
        subject: feedback.subject,
        category: feedback.category,
        details: feedback.details,
        status: feedback.status,
      });
    }
  }, [feedback, reset]);

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      const submissionData = {
        ...data,
        ...(selectedFile && { attachmentName: selectedFile.name }),
      };

      await updateFeedback.mutateAsync(submissionData);
      toast.success('Feedback updated successfully!');
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update feedback');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (isLoading || !feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Feedback</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-[var(--color-error)]">*</span>
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
              onValueChange={(value) => setValue('category', value as typeof FEEDBACK_CATEGORIES[number])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Please select the category" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((category) => (
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
                <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] font-bold text-sm transition-colors">B</button>
                <button type="button" className="p-1.5 hover:bg-[var(--color-bg)] rounded text-[var(--color-text)] italic text-sm transition-colors">I</button>
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
              <Button type="button" variant="outline" onClick={() => document.getElementById('edit-feedback-file-upload')?.click()}>
                Choose File
              </Button>
              <input
                id="edit-feedback-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-sm text-[var(--color-text-muted)]">
                {selectedFile ? selectedFile.name : feedback.attachmentName || 'No file chosen'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={updateFeedback.isPending}>
              {updateFeedback.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
