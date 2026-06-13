'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { policySchema, type PolicyFormData, POLICY_CATEGORIES } from '@/lib/validations/policies';
import { useCreatePolicy } from '@/hooks/use-policies';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegionStore } from '@/store/region-store';
import { toast } from 'sonner';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface AddPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPolicyDialog({ open, onOpenChange }: AddPolicyDialogProps) {
  const createPolicy = useCreatePolicy();
  const selectedRegionId = useRegionStore((state) => state.selectedRegionId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PolicyFormData>({
    resolver: standardSchemaResolver(policySchema),
    defaultValues: {
      fileName: '',
      category: '',
      fileUrl: '',
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    // Mocking file upload URL
    setValue('fileUrl', `/uploads/mock-${Date.now()}-${file.name}`);
    setValue('fileType', file.type || null);
    setValue('fileSize', file.size || null);
    
    // Auto-fill fileName if empty
    const currentFileName = watch('fileName');
    if (!currentFileName) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setValue('fileName', nameWithoutExt);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue('fileUrl', '');
    setValue('fileType', null);
    setValue('fileSize', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: PolicyFormData) => {
    try {
      if (!selectedFile) {
        toast.error('Please upload a file');
        return;
      }

      await createPolicy.mutateAsync({
        ...data,
        regionId: selectedRegionId || null,
      });
      
      toast.success('Policy uploaded successfully!');
      reset();
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to upload policy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Policy</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Please add your policy here
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* File Upload Zone */}
          <div>
            {!selectedFile ? (
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:bg-[var(--color-subtle)]'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={onFileInputChange}
                  accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                />
                <div className="w-12 h-12 bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>
                <p className="text-sm font-medium mb-1">
                  <span className="text-[var(--color-primary)]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  PNG, JPG, PDF, DOC, DOCX, XLSX, CSV, XLS up to 10MB
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-center justify-between bg-[var(--color-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            {errors.fileUrl && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.fileUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                File Name <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                {...register('fileName')}
                placeholder="e.g. Code of Conduct"
              />
              {errors.fileName && (
                <p className="text-sm text-[var(--color-error)] mt-1">
                  {errors.fileName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-[var(--color-error)]">*</span>
              </label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-[var(--color-error)] mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createPolicy.isPending}>
              {createPolicy.isPending ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
