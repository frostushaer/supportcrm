'use client';

import { useQuestion } from '@/hooks/use-questions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QuestionInfoDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-sm font-normal text-[var(--color-text-muted)]">{label}</span>
      <span className="col-span-2 text-sm text-[var(--color-text)]">{value}</span>
    </div>
  );
}

export function QuestionInfoDialog({
  questionId,
  open,
  onOpenChange,
}: QuestionInfoDialogProps) {
  const { data: question, isLoading } = useQuestion(questionId);

  if (isLoading || !question) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Question Information</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Detailed question from {question.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="divide-y divide-[var(--color-border-subtle)]">
            <InfoRow label="Submitted By" value={question.name} />
            <InfoRow label="Subject" value={question.subject} />
            <InfoRow label="Category" value={question.category} />
            <div className="grid grid-cols-3 gap-4 py-3">
              <span className="text-sm font-normal text-[var(--color-text-muted)]">Details</span>
              <span className="col-span-2 text-sm text-[var(--color-text)] whitespace-pre-wrap">
                {question.details}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-8 h-10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
