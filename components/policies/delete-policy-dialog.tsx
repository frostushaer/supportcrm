'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeletePolicy } from '@/hooks/use-policies';
import { toast } from 'sonner';

interface DeletePolicyDialogProps {
  policyId: string | null;
  policyName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePolicyDialog({ policyId, policyName, open, onOpenChange }: DeletePolicyDialogProps) {
  const deletePolicy = useDeletePolicy();

  const handleDelete = async () => {
    if (!policyId) return;
    
    try {
      await deletePolicy.mutateAsync(policyId);
      toast.success('Policy deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Policy</DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <strong className="text-[var(--color-text)]">{policyName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deletePolicy.isPending}
          >
            {deletePolicy.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
