'use client';

import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ValidationError {
  row: number;
  message: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ValidationError[];
  message: string;
}

interface ImportParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportParticipantDialog({ open, onOpenChange }: ImportParticipantDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [supportedFormat, setSupportedFormat] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFile = async (f: File) => {
    if (!f.name.endsWith('.xlsx')) {
      toast.error('Only .xlsx files are supported');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20 MB');
      return;
    }
    setFile(f);
    setSupportedFormat(true);
    setErrors([]); // Clear previous errors
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSupportedFormat(false);
    setErrors([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!file || errors.length > 0 || isImporting) return;
    
    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/participants/import', {
        method: 'POST',
        body: formData,
      });
      
      const result: ImportResult = await response.json();
      
      if (!response.ok) {
        // Show validation errors from server
        if (result.errors && result.errors.length > 0) {
          setErrors(result.errors);
          toast.error(result.message || 'Import failed. Please fix the errors.');
        } else {
          toast.error(result.message || 'Import failed. Please try again.');
        }
        return;
      }
      
      // Success
      if (result.errors && result.errors.length > 0) {
        // Partial success with some errors
        toast.success(result.message);
        setErrors(result.errors);
      } else {
        // Complete success
        toast.success(`Successfully imported ${result.imported} participant(s)!`);
      }
      
      // Refresh participants list
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      // Close dialog after a short delay if no errors
      if (!result.errors || result.errors.length === 0) {
        setTimeout(() => {
          onOpenChange(false);
          setFile(null);
          setSupportedFormat(false);
          setErrors([]);
        }, 1500);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (isImporting) return; // Don't close while importing
    setFile(null);
    setSupportedFormat(false);
    setErrors([]);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="w-full max-w-lg bg-[var(--color-bg)] rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Blue Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-primary)] rounded-t-lg">
          <h3 className="text-sm font-semibold text-white">Import Participant list</h3>
          <button onClick={handleClose} className="text-white/80 hover:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Download Template</p>
                <p className="text-xs text-[var(--color-text-muted)]">Use the template to ensure correct format</p>
              </div>
            </div>
            <Button size="sm" className="h-9 px-4 bg-blue-500 text-white hover:bg-blue-600">
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Download
            </Button>
          </div>

          {/* Browse / Upload File Label */}
          <p className="text-sm font-medium text-[var(--color-text)]">Browse / Upload File</p>

          {/* Drop zone */}
          {!file && (
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
              <svg className="h-10 w-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-center">
                <p className="text-sm">
                  <span className="text-[var(--color-primary)] font-medium">Upload a file</span>
                  <span className="text-[var(--color-text-muted)]"> or drag and drop</span>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  XLSX up to 20MB
                </p>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Uploaded File Card */}
          {file && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)] truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{(file.size / 1024).toFixed(2)}MB</p>
                </div>
              </div>
              <button onClick={handleRemoveFile} className="text-sm text-red-500 hover:text-red-600 font-medium">
                Remove
              </button>
            </div>
          )}

          {/* Supported formats checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={supportedFormat}
              onChange={(e) => setSupportedFormat(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)]" 
            />
            <span className="text-xs text-[var(--color-text-muted)]">Supported formats: .xlsx</span>
          </label>

          {/* Errors Found */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-red-700">Errors Found:</span>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                    <span className="mt-0.5">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-red-600 pt-1">Please fix these errors before importing.</p>
            </div>
          )}

          {/* Important Warning Box */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-semibold text-amber-700">IMPORTANT:</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Do not change the column headings provided in the template. These must remain unchanged for the import to work correctly.
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">Before proceeding with your data, please remove the dummy data row.</span> The template includes a dummy row for reference - delete it and enter your actual participant data.
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Fields marked with an asterisk (*) are required fields and must be filled in.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isImporting} className="h-9 px-4">Cancel</Button>
            <Button 
              size="sm" 
              onClick={handleImport} 
              disabled={!file || errors.length > 0 || isImporting} 
              className="h-9 px-4 bg-[var(--color-primary)] text-white"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
