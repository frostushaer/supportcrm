'use client';

import { use } from 'react';
import { FormBuilder } from '@/components/forms-home-mgt/form-builder';
import { useHrmForm, useUpdateHrmForm } from '@/hooks/use-hrm-forms';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditHRMFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { data, isLoading } = useHrmForm(resolvedParams.id);
  const updateForm = useUpdateHrmForm(resolvedParams.id);

  if (isLoading) {
    return <div className="p-6">Loading form...</div>;
  }

  if (!data?.data) {
    return <div className="p-6 text-red-500">Form not found.</div>;
  }

  const handleSave = async (payload: import('@/lib/validations/forms-home-mgt').FormTemplateInput, status: 'Draft' | 'Published') => {
    await updateForm.mutateAsync(payload);
    toast.success(`Form ${status === 'Draft' ? 'saved as draft' : 'published'} successfully`);
    router.push('/forms-hrm');
  };

  return (
    <FormBuilder 
      initialData={data.data}
      kind="HRM"
      categories={['Onboarding', 'Performance', 'Leave', 'General']}
      onSave={handleSave}
      onCancel={() => router.push('/forms-hrm')}
    />
  );
}
