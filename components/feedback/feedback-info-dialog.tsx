'use client';

import { useFeedback, useUpdateFeedback } from '@/hooks/use-feedback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface FeedbackInfoDialogProps {
  feedbackId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = ['New', 'In Progress', 'Resolved', 'Closed'];

export function FeedbackInfoDialog({
  feedbackId,
  open,
  onOpenChange,
}: FeedbackInfoDialogProps) {
  const { data: feedback, isLoading } = useFeedback(feedbackId);
  const updateFeedback = useUpdateFeedback(feedbackId);

  if (isLoading || !feedback) {
    return null;
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateFeedback.mutateAsync({ status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Feedback Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Detailed feedback from {feedback.name}
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-3 items-center">
              <span className="text-sm font-medium">Status</span>
              <div className="col-span-2">
                <Select
                  value={feedback.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-48 h-8 text-xs font-semibold" style={{
                    color: feedback.status === 'Resolved' || feedback.status === 'Closed' ? 'var(--color-success)' :
                           feedback.status === 'In Progress' ? 'var(--color-primary)' : 'var(--color-warning)'
                  }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Name</span>
              <span className="col-span-2 text-sm">{feedback.name}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Subject</span>
              <span className="col-span-2 text-sm">{feedback.subject}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Category</span>
              <span className="col-span-2 text-sm">{feedback.category}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Details</span>
              <span className="col-span-2 text-sm whitespace-pre-wrap">
                {feedback.details}
              </span>
            </div>

            {feedback.attachmentName && (
              <div className="grid grid-cols-3">
                <span className="text-sm font-medium">Attachment</span>
                <span className="col-span-2 text-sm text-[var(--color-primary)]">
                  {feedback.attachmentName}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
