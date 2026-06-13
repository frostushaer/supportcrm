'use client';

import { FormBuilder } from '@/components/forms-home-mgt/form-builder';
import { useCreateHrmForm } from '@/hooks/use-hrm-forms';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewHRMFormPage() {
  const router = useRouter();
  const createForm = useCreateHrmForm();

  const handleSave = async (payload: import('@/lib/validations/forms-home-mgt').FormTemplateInput, status: 'Draft' | 'Published') => {
    await createForm.mutateAsync(payload);
    toast.success(`Form ${status === 'Draft' ? 'saved as draft' : 'published'} successfully`);
    router.push('/forms-hrm');
  };

  return (
    <FormBuilder 
      kind="HRM"
      categories={['Onboarding', 'Performance', 'Leave', 'General']}
      onSave={handleSave}
      onCancel={() => router.push('/forms-hrm')}
    />
  );
}
