import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddNewSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => void;
}

export function AddNewSectionDialog({ open, onOpenChange, onSave }: AddNewSectionDialogProps) {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title);
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Please enter following details to add new section
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Section Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nearby Facilities"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
