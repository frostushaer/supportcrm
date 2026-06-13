import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FieldData {
  id?: string;
  label: string;
  type: string;
  required: boolean;
  fullWidth: boolean;
  addedInSupportPlan: boolean;
  dependentOnFieldId: string | null;
  hint: string | null;
  legalReference: string | null;
}

interface AddSectionFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (field: FieldData) => void;
  availableFields: { id: string; label: string }[]; // for dependencies
}

export function AddSectionFieldDialog({ open, onOpenChange, onSave, availableFields }: AddSectionFieldDialogProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('ShortText');
  const [required, setRequired] = useState('No');
  const [fullWidth, setFullWidth] = useState('No');
  const [addedInSupportPlan, setAddedInSupportPlan] = useState('No');
  const [isDependent, setIsDependent] = useState('No');
  const [dependentOnFieldId, setDependentOnFieldId] = useState<string>('');
  const [hint, setHint] = useState('');
  const [legalReference, setLegalReference] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setLabel('');
      setType('ShortText');
      setRequired('No');
      setFullWidth('No');
      setAddedInSupportPlan('No');
      setIsDependent('No');
      setDependentOnFieldId('');
      setHint('');
      setLegalReference('');
    }
  }, [open]);

  const handleSave = () => {
    if (!label.trim()) return;

    onSave({
      label,
      type,
      required: required === 'Yes',
      fullWidth: fullWidth === 'Yes',
      addedInSupportPlan: addedInSupportPlan === 'Yes',
      dependentOnFieldId: isDependent === 'Yes' && dependentOnFieldId ? dependentOnFieldId : null,
      hint: hint.trim() || null,
      legalReference: legalReference.trim() || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Section Input Field</DialogTitle>
          <DialogDescription>
            Please enter following details to add section input field
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Label <span className="text-red-500">*</span>
            </Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Nearby Shopping Centre" />
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ShortText">Short Text</SelectItem>
                <SelectItem value="LongText">Long Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Required</Label>
            <Select value={required} onValueChange={setRequired}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Full Width Column</Label>
            <Select value={fullWidth} onValueChange={setFullWidth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Added In Support Plan</Label>
            <Select value={addedInSupportPlan} onValueChange={setAddedInSupportPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Is Dependent On Other Field?</Label>
            <Select value={isDependent} onValueChange={setIsDependent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isDependent === 'Yes' && (
            <div className="grid gap-2 md:col-span-2">
              <Label className="text-sm font-medium">Select Dependent Field</Label>
              <Select value={dependentOnFieldId} onValueChange={setDependentOnFieldId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                  ))}
                  {availableFields.length === 0 && (
                    <SelectItem value="none" disabled>No fields available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2 md:col-span-2">
            <Label className="text-sm font-medium">Hint</Label>
            <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Enter hint text" />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label className="text-sm font-medium">Legal Reference</Label>
            <Input value={legalReference} onChange={(e) => setLegalReference(e.target.value)} placeholder="Enter legal reference text" />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
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
