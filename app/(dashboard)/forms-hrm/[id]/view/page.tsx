'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useHrmForm } from '@/hooks/use-hrm-forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function ViewHRMFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { data, isLoading } = useHrmForm(resolvedParams.id);
  
  const [extraRows, setExtraRows] = useState<Record<string, number>>({});

  if (isLoading) {
    return <div className="p-6">Loading form...</div>;
  }

  const form = data?.data;
  if (!form) {
    return <div className="p-6 text-red-500">Form not found.</div>;
  }

  const handleAddOther = (subSectionId: string) => {
    setExtraRows(prev => ({
      ...prev,
      [subSectionId]: (prev[subSectionId] || 0) + 1
    }));
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-[var(--color-primary)] text-white text-xs font-semibold px-2 py-1 rounded">
            {form.status}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">HR Management</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{form.title}</h1>
        {form.description && (
          <p className="text-[var(--color-text-secondary)]">{form.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {form.sections?.map((section) => (
          <div key={section.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)] pb-2 border-b">
              {section.title}
            </h2>

            {section.fields && section.fields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                {section.fields.map((field) => (
                  <div key={field.id} className={`flex flex-col gap-2 ${field.fullWidth ? 'md:col-span-2' : ''}`}>
                    <label className="text-sm font-medium text-[var(--color-text)]">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'LongText' ? (
                      <Textarea placeholder="" className="bg-gray-50" />
                    ) : (
                      <Input placeholder="" className="bg-gray-50" />
                    )}
                    {field.hint && <p className="text-xs text-[var(--color-text-secondary)]">{field.hint}</p>}
                  </div>
                ))}
              </div>
            )}

            {section.subSections?.map((subSection) => {
              const rows = Array.from({ length: extraRows[subSection.id] || 0 });

              return (
                <div key={subSection.id} className="mb-6 last:mb-0 bg-gray-50/50 p-4 rounded-md border border-gray-100">
                  <h3 className="text-lg font-medium mb-4 text-[var(--color-text)] flex justify-between items-center">
                    {subSection.title}
                    {subSection.addOther && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddOther(subSection.id)}
                        className="text-[var(--color-primary)] border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/5"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Other
                      </Button>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {subSection.fields?.map((field) => (
                      <div key={field.id} className={`flex flex-col gap-2 ${field.fullWidth ? 'md:col-span-2' : ''}`}>
                        <label className="text-sm font-medium text-[var(--color-text)]">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'LongText' ? (
                          <Textarea placeholder="" className="bg-white" />
                        ) : (
                          <Input placeholder="" className="bg-white" />
                        )}
                        {field.hint && <p className="text-xs text-[var(--color-text-secondary)]">{field.hint}</p>}
                      </div>
                    ))}
                  </div>

                  {rows.length > 0 && (
                    <div className="mt-4 flex flex-col gap-4 border-t pt-4 border-gray-200">
                      {rows.map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-[var(--color-text)]">
                            Other {i + 1}
                          </label>
                          <Input placeholder="Enter details..." className="bg-white" />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={() => router.push('/forms-hrm')}>
          Clear & Exit
        </Button>
      </div>
    </div>
  );
}
