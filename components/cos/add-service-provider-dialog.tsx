/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { externalServiceProviderSchema } from '@/lib/validations/cos';
import { useCreateServiceProvider, useUpdateServiceProvider } from '@/hooks/use-cos';
import { useRegionStore } from '@/store/region-store';
import { useEffect } from 'react';

export function AddServiceProviderDialog({ open, onOpenChange, provider }: { open: boolean, onOpenChange: (open: boolean) => void, provider?: any }) {
  const { selectedRegionId } = useRegionStore();
  const { mutate: createProvider, isPending: isCreating } = useCreateServiceProvider();
  const { mutate: updateProvider, isPending: isUpdating } = useUpdateServiceProvider();

  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: standardSchemaResolver(externalServiceProviderSchema),
    defaultValues: {
      name: '',
      contactInformation: '',
      billingContact: '',
      regionIds: [selectedRegionId].filter(id => id && id !== 'all')
    }
  });

  useEffect(() => {
    if (open && provider) {
      reset({
        name: provider.name,
        contactInformation: provider.contactInformation || '',
        billingContact: provider.billingContact || '',
        regionIds: provider.regions?.map((r: any) => r.id) || []
      });
    } else if (open) {
      reset({
        name: '',
        contactInformation: '',
        billingContact: '',
        regionIds: [selectedRegionId].filter(id => id && id !== 'all')
      });
    }
  }, [open, provider, reset, selectedRegionId]);

  const onSubmit = (data: any) => {
    if (provider) {
      updateProvider({ id: provider.id, data }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createProvider(data, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--color-surface)] w-full max-w-md p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
          {provider ? 'Edit' : 'Add'} Service Provider
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Name</label>
            <input type="text" {...register('name')} className="form-input w-full" placeholder="e.g. ABC Therapy" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Contact Information</label>
            <textarea {...register('contactInformation')} className="form-input w-full h-24" placeholder="Address, phone, email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Billing Contact</label>
            <input type="text" {...register('billingContact')} className="form-input w-full" placeholder="Contact person name/email" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
