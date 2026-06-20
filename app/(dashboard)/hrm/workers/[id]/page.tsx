/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { useWorker } from '@/hooks/use-hrm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { use } from 'react';

export default function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: worker, isLoading } = useWorker(resolvedParams.id);
  const [activeTab, setActiveTab] = useState('Profile');

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!worker) {
    return <div className="p-8 text-center">Worker not found.</div>;
  }

  const tabs = ['Profile', 'Documents', 'Settings', 'Forms', 'Training and Development'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`\${worker.firstName} \${worker.lastName}`}
        description={worker.role || 'Support Worker'}
        action={
          <Button variant="outline">Back to Team</Button>
        }
      />

      <div className="flex gap-4 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 \${
              activeTab === tab
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
        {activeTab === 'Profile' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Quick Snapshot</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-[var(--color-text-muted)]">Email:</span> {worker.email}</div>
              <div><span className="text-[var(--color-text-muted)]">Phone:</span> {worker.phoneNumber}</div>
              <div><span className="text-[var(--color-text-muted)]">Status:</span> {worker.status}</div>
              <div><span className="text-[var(--color-text-muted)]">Employment:</span> {worker.employmentType || 'N/A'}</div>
            </div>
            {/* Extended profile details like leaves and availability would go here */}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Worker Documents</h3>
            <p className="text-[var(--color-text-muted)]">Document management interface goes here.</p>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">HR Settings</h3>
            <p className="text-[var(--color-text-muted)]">Edit worker details, payroll, and traits here.</p>
          </div>
        )}

        {activeTab === 'Forms' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Forms</h3>
            <p className="text-[var(--color-text-muted)]">Assigned form templates and submissions.</p>
          </div>
        )}

        {activeTab === 'Training and Development' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Training Records</h3>
            <p className="text-[var(--color-text-muted)]">Track completed and pending training courses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
