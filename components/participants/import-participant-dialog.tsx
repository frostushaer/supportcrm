'use client';

import { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ImportParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportParticipantDialog({ open, onOpenChange }: ImportParticipantDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.xlsx')) {
      toast.error('Only .xlsx files are supported');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20 MB');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleImport = () => {
    if (!file) return;
    toast.success(`Importing ${file.name}…`);
    onOpenChange(false);
    setFile(null);
  };

  const handleClose = () => {
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Participant List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download template */}
          <Button variant="outline" className="w-full gap-2" onClick={() => toast.info('Template download coming soon')}>
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-dim)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
            }`}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-[var(--color-primary)]" />
                <p className="text-sm font-medium text-[var(--color-text)]">{file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--color-text-muted)]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    Browse or drag &amp; drop
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    .xlsx only · max 20 MB
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Warnings */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-subtle)] p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text)]">
              <AlertCircle className="h-3.5 w-3.5 text-[var(--color-warning)]" />
              Important
            </div>
            <ul className="space-y-1 text-xs text-[var(--color-text-secondary)] list-disc list-inside">
              <li>Do not change column headings in the template</li>
              <li>Remove the dummy data row before importing</li>
              <li>Fields marked with * are required</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
