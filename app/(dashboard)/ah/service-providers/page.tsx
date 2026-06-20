/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useAhServiceProviders, useDeleteAhServiceProvider } from '@/hooks/use-allied-health';

import { Edit2, Plus, Trash2 } from 'lucide-react';
import { AddServiceProviderDialog } from '@/components/ah/add-service-provider-dialog';

export default function ServiceProvidersPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const { data: providers, isLoading } = useAhServiceProviders({ search });
  const { mutate: deleteProvider } = useDeleteAhServiceProvider();

  const handleEdit = (provider: any) => {
    setSelectedProvider(provider);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedProvider(null);
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Service Provider Name' },
    { key: 'contactInformation', label: 'Contact Information' },
    { key: 'billingContact', label: 'Billing Contact' },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this provider?')) {
                deleteProvider(item.id);
              }
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="External Service Providers"
          description="Manage external providers for Allied Health."
        />
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search providers..."
          className="form-input flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <DataTable
          data={providers || []}
          columns={columns}
        />
      </div>

      {isDialogOpen && (
        <AddServiceProviderDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          provider={selectedProvider}
        />
      )}
    </div>
  );
}
