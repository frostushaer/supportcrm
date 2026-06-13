'use client';

import { use } from 'react';
import { FormBuilder } from '@/components/forms-home-mgt/form-builder';
import { useCrmForm, useUpdateCrmForm } from '@/hooks/use-crm-forms';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditCRMFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { data, isLoading } = useCrmForm(resolvedParams.id);
  const updateForm = useUpdateCrmForm(resolvedParams.id);

  if (isLoading) {
    return <div className="p-6">Loading form...</div>;
  }

  if (!data?.data) {
    return <div className="p-6 text-red-500">Form not found.</div>;
  }

  const handleSave = async (payload: import('@/lib/validations/forms-home-mgt').FormTemplateInput, status: 'Draft' | 'Published') => {
    await updateForm.mutateAsync(payload);
    toast.success(`Form ${status === 'Draft' ? 'saved as draft' : 'published'} successfully`);
    router.push('/forms-crm');
  };

  return (
    <FormBuilder 
      initialData={data.data}
      kind="CRM"
      categories={['Risk Management', 'High Care', 'Medication', 'Behaviour Support', 'Intake / Admission', 'General']}
      onSave={handleSave}
      onCancel={() => router.push('/forms-crm')}
    />
  );
}
