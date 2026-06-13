'use client';

import { useParams } from 'next/navigation';
import { useHomeForm } from '@/hooks/use-home-forms';
import { FormBuilder } from '@/components/forms-home-mgt/form-builder';
import { use } from 'react';

export default function EditHomeFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading } = useHomeForm(resolvedParams.id);

  if (isLoading) {
    return <div className="p-6">Loading form...</div>;
  }

  if (!data?.data) {
    return <div className="p-6 text-red-500">Form not found.</div>;
  }

  return <FormBuilder initialData={data.data} />;
}
