'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Plus } from 'lucide-react';
import { AddNewSectionDialog } from './add-new-section-dialog';
import { AddNewSubSectionDialog } from './add-new-sub-section-dialog';
import { AddSectionFieldDialog, FieldData } from './add-section-field-dialog';
import { FormTemplate } from '@/hooks/use-home-forms';
import { FormTemplateInput } from '@/lib/validations/forms-home-mgt';
import { toast } from 'sonner';

export interface FormBuilderProps {
  initialData?: FormTemplate;
  kind?: 'HomeMgt' | 'HRM' | 'CRM';
  categories: string[];
  onSave: (payload: FormTemplateInput, status: 'Draft' | 'Published') => Promise<void>;
  onCancel: () => void;
}

export type BuilderSection = {
  id?: string;
  title: string;
  subSections?: BuilderSubSection[];
  fields?: FieldData[];
};

export type BuilderSubSection = {
  id?: string;
  title: string;
  addOther: boolean;
  fields?: FieldData[];
};

export function FormBuilder({ initialData, kind = 'HomeMgt', categories, onSave, onCancel }: FormBuilderProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const [sections, setSections] = useState<BuilderSection[]>(
    (initialData?.sections as unknown as BuilderSection[]) || []
  );

  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isSubSectionDialogOpen, setIsSubSectionDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  const [targetSectionIdx, setTargetSectionIdx] = useState<number | null>(null);
  const [targetSubSectionIdx, setTargetSubSectionIdx] = useState<number | null>(null);

  const handleAddSection = (sectionTitle: string) => {
    setSections([...sections, { title: sectionTitle, subSections: [], fields: [] }]);
  };

  const handleAddSubSection = (subTitle: string, addOther: boolean) => {
    if (targetSectionIdx === null) return;
    const newSections = [...sections];
    if (!newSections[targetSectionIdx].subSections) newSections[targetSectionIdx].subSections = [];
    newSections[targetSectionIdx].subSections.push({ title: subTitle, addOther, fields: [] });
    setSections(newSections);
  };

  const handleAddField = (field: FieldData) => {
    if (targetSectionIdx === null) return;
    const newSections = [...sections];
    
    if (targetSubSectionIdx !== null) {
      if (!newSections[targetSectionIdx].subSections) newSections[targetSectionIdx].subSections = [];
      if (!newSections[targetSectionIdx].subSections[targetSubSectionIdx].fields) {
        newSections[targetSectionIdx].subSections[targetSubSectionIdx].fields = [];
      }
      newSections[targetSectionIdx].subSections[targetSubSectionIdx].fields.push(field);
    } else {
      if (!newSections[targetSectionIdx].fields) {
        newSections[targetSectionIdx].fields = [];
      }
      newSections[targetSectionIdx].fields.push(field);
    }
    setSections(newSections);
  };

  const saveForm = async (status: 'Draft' | 'Published') => {
    if (!title || !category) {
      toast.error('Title and Category are required');
      return;
    }

    const payload = {
      title,
      category,
      description,
      status,
      kind,
      sections,
    };

    try {
      await onSave(payload, status);
    } catch (error) {
      // Handled by the hook / caller
    }
  };

  const getAvailableFields = () => {
    const available: { id: string; label: string }[] = [];
    sections.forEach((sec) => {
      sec.fields?.forEach((f) => {
        if (f.id) available.push({ id: f.id, label: f.label });
      });
      sec.subSections?.forEach((sub) => {
        sub.fields?.forEach((f) => {
          if (f.id) available.push({ id: f.id, label: f.label });
        });
      });
    });
    return available;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">
            Dashboard &gt; Forms List &gt; {initialData ? 'Edit Form' : 'New Form'}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            {initialData ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Supercharge your business with customisation on the standard forms.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg border flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nearby Facilities" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Form Category <span className="text-red-500">*</span></label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description..." rows={4} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="bg-[var(--color-bg-primary)] rounded-lg border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{sec.title}</h3>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="pl-4 border-l-2 border-gray-100 flex flex-col gap-4">
              {sec.fields?.map((f, fIdx) => (
                <div key={fIdx} className="bg-gray-50 p-3 rounded border text-sm flex justify-between">
                  <span>Field: <strong>{f.label}</strong> ({f.type})</span>
                </div>
              ))}

              {sec.subSections?.map((sub, subIdx) => (
                <div key={subIdx} className="bg-white border rounded p-4 flex flex-col gap-3">
                  <h4 className="font-medium text-[var(--color-text)] text-sm">{sub.title} {sub.addOther ? '(Allows Add Other)' : ''}</h4>
                  
                  {sub.fields?.map((f, fIdx) => (
                    <div key={fIdx} className="bg-gray-50 p-2 rounded border text-sm flex justify-between">
                      <span>Field: <strong>{f.label}</strong> ({f.type})</span>
                    </div>
                  ))}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-fit text-[var(--color-primary)] hover:text-[var(--color-primary)]/90"
                    onClick={() => {
                      setTargetSectionIdx(sIdx);
                      setTargetSubSectionIdx(subIdx);
                      setIsFieldDialogOpen(true);
                    }}
                  >
                    + Add new field
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/90"
                onClick={() => {
                  setTargetSectionIdx(sIdx);
                  setTargetSubSectionIdx(null);
                  setIsFieldDialogOpen(true);
                }}
              >
                + Add new field
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/90"
                onClick={() => {
                  setTargetSectionIdx(sIdx);
                  setIsSubSectionDialogOpen(true);
                }}
              >
                + Add new Sub Section
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Button 
          variant="outline" 
          className="w-full border-dashed text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
          onClick={() => setIsSectionDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Section
        </Button>
      </div>

      <div className="flex justify-end items-center gap-4 mt-8">
        <Button variant="outline" onClick={onCancel}>
          Clear & Exit
        </Button>
        <Button variant="outline" onClick={() => saveForm('Draft')}>
          Save As Draft
        </Button>
        <Button 
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
          onClick={() => {
            if(confirm('Are you sure to publish this form?')) {
              saveForm('Published');
            }
          }}
        >
          Publish
        </Button>
      </div>

      <AddNewSectionDialog 
        open={isSectionDialogOpen} 
        onOpenChange={setIsSectionDialogOpen} 
        onSave={handleAddSection} 
      />
      
      <AddNewSubSectionDialog 
        open={isSubSectionDialogOpen} 
        onOpenChange={setIsSubSectionDialogOpen} 
        onSave={handleAddSubSection} 
      />
      
      <AddSectionFieldDialog 
        open={isFieldDialogOpen} 
        onOpenChange={setIsFieldDialogOpen} 
        onSave={handleAddField}
        availableFields={getAvailableFields()}
      />
    </div>
  );
}
