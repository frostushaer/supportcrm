'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Download, FileIcon } from 'lucide-react';
import type { PolicyWithRegion } from '@/hooks/use-policies';

interface PolicyInfoDialogProps {
  policy: PolicyWithRegion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PolicyInfoDialog({ policy, open, onOpenChange }: PolicyInfoDialogProps) {
  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Policy Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 bg-[var(--color-subtle)] border border-[var(--color-border)] rounded-lg">
            <div className="w-10 h-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{policy.fileName}</p>
              {policy.fileSize && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {(policy.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                // Open the URL (mocked or real)
                window.open(policy.fileUrl, '_blank');
              }}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Category</p>
              <p className="font-medium">{policy.category}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Uploaded By</p>
              <p className="font-medium">{policy.uploadedByName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Uploaded On</p>
              <p className="font-medium">{format(new Date(policy.createdAt), 'MMM d, yyyy')}</p>
            </div>
            {policy.region && (
              <div>
                <p className="text-[var(--color-text-muted)] mb-1">Region</p>
                <p className="font-medium">{policy.region.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
