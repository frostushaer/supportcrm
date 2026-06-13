'use client';

import { FormBuilder } from '@/components/forms-home-mgt/form-builder';
import { useCreateCrmForm } from '@/hooks/use-crm-forms';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewCRMFormPage() {
  const router = useRouter();
  const createForm = useCreateCrmForm();

  const handleSave = async (payload: import('@/lib/validations/forms-home-mgt').FormTemplateInput, status: 'Draft' | 'Published') => {
    await createForm.mutateAsync(payload);
    toast.success(`Form ${status === 'Draft' ? 'saved as draft' : 'published'} successfully`);
    router.push('/forms-crm');
  };

  return (
    <FormBuilder 
      kind="CRM"
      categories={['Risk Management', 'High Care', 'Medication', 'Behaviour Support', 'Intake / Admission', 'General']}
      onSave={handleSave}
      onCancel={() => router.push('/forms-crm')}
    />
  );
}
