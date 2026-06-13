'use client';

import { useComplaint } from '@/hooks/use-complaints';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ComplaintInfoDialogProps {
  complaintId: string;
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

export function ComplaintInfoDialog({
  complaintId,
  open,
  onOpenChange,
}: ComplaintInfoDialogProps) {
  const { data: complaint, isLoading } = useComplaint(complaintId);

  if (isLoading || !complaint) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Complaint Information</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Detailed complaint from {complaint.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="divide-y divide-[var(--color-border-subtle)]">
            <InfoRow label="Name" value={complaint.name} />
            <InfoRow label="Date" value={formatDate(complaint.date)} />
            <InfoRow label="Subjects" value={complaint.subject} />
            <div className="grid grid-cols-3 gap-4 py-3">
              <span className="text-sm font-normal text-[var(--color-text-muted)]">Details</span>
              <span className="col-span-2 text-sm text-[var(--color-text)] whitespace-pre-wrap">
                {complaint.details}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-8 h-10 border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error-dim)] hover:text-[var(--color-error)]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
