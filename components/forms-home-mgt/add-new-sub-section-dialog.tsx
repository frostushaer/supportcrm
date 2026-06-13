import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddNewSubSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, addOther: boolean) => void;
}

export function AddNewSubSectionDialog({ open, onOpenChange, onSave }: AddNewSubSectionDialogProps) {
  const [title, setTitle] = useState('');
  const [addOther, setAddOther] = useState('No');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, addOther === 'Yes');
    setTitle('');
    setAddOther('No');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Sub Section</DialogTitle>
          <DialogDescription>
            Please enter following details to add new sub section
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Sub Section Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter sub section title"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Add Other</Label>
            <Select value={addOther} onValueChange={setAddOther}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
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
