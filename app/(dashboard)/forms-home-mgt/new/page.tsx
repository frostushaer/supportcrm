'use client';

import { FormBuilder } from '@/components/forms-home-mgt/form-builder';
import { useCreateHomeForm } from '@/hooks/use-home-forms';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormTemplateInput } from '@/lib/validations/forms-home-mgt';

export default function NewHomeFormPage() {
  const router = useRouter();
  const createForm = useCreateHomeForm();

  const handleSave = async (payload: FormTemplateInput, status: 'Draft' | 'Published') => {
    await createForm.mutateAsync(payload);
    toast.success(`Form ${status === 'Draft' ? 'saved as draft' : 'published'} successfully`);
    router.push('/forms-home-mgt');
  };

  return (
    <FormBuilder 
      categories={['Property Management', 'Participant Management']}
      onSave={handleSave}
      onCancel={() => router.push('/forms-home-mgt')}
    />
  );
}
