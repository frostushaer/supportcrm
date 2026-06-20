/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useAhCatalogue } from '@/hooks/use-allied-health';


export default function CatalogueServicesPage() {
  const [category, setCategory] = useState('All');
  const [priceCatalogueLabel, setPriceCatalogueLabel] = useState('All');
  const [search, setSearch] = useState('');

  const { data: services, isLoading } = useAhCatalogue({
    category,
    priceCatalogueLabel,
    search
  });

  const columns = [
    { key: 'supportItemNumber', label: 'Support Item Number' },
    { key: 'supportItemName', label: 'Support Item Name' },
    { key: 'supportCategoryName', label: 'Support Category' },
    { 
      key: 'price', 
      label: 'Price',
      render: (item: any) => `$${parseFloat(item.price).toFixed(2)}`
    },
    { key: 'priceCatalogueLabel', label: 'Catalogue Label' },
  ];

  const uniqueLabels = Array.from(new Set(services?.map((s: any) => s.priceCatalogueLabel) || []));
  const uniqueCategories = Array.from(new Set(services?.map((s: any) => s.supportCategoryName) || []));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue Services"
        description="View NDIS support catalogue items."
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setPriceCatalogueLabel('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors \${priceCatalogueLabel === 'All' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-subtle)] text-[var(--color-text)] hover:bg-[var(--color-primary-dim)]'}`}
        >
          All Catalogues
        </button>
        {uniqueLabels.map((label: any) => (
          <button
            key={label}
            onClick={() => setPriceCatalogueLabel(label)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors \${priceCatalogueLabel === label ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-subtle)] text-[var(--color-text)] hover:bg-[var(--color-primary-dim)]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <select
          className="form-input w-64"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {uniqueCategories.map((cat: any) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search items by name or number..."
          className="form-input flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <DataTable
          data={services || []}
          columns={columns}
        />
      </div>
    </div>
  );
}
