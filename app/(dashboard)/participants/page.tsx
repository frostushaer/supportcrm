'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { AddParticipantSheet } from '@/components/participants/add-participant-sheet';
import { QuickViewSidebar } from '@/components/participants/quick-view-sidebar';
import { ImportParticipantDialog } from '@/components/participants/import-participant-dialog';
import { useParticipants } from '@/hooks/use-participants';

type ParticipantRow = {
  id: string;
  firstName: string;
  lastName: string;
  ndisNumber: string;
  status: string;
  serviceSupport: string;
  primaryEmailAddress: string;
  primaryPhoneNumber: string;
  auditParticipation: boolean;
  region: { name: string } | null;
  createdAt: string;
};

export default function ParticipantsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const { data: participants, isLoading, isError } = useParticipants(
    statusFilter !== 'all' ? statusFilter : undefined,
    search || undefined
  );

  const filtered = (participants as ParticipantRow[] | undefined)?.filter((p) => {
    if (serviceFilter !== 'all' && p.serviceSupport !== serviceFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Participants</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Manage NDIS participants and their support plans.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import List
          </Button>
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        </div>
      </div>

      <div>
        <div className="space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input
                type="search"
                placeholder="Search by name or NDIS number..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Service Support" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Capacity Building">Capacity Building</SelectItem>
                <SelectItem value="Capital">Capital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-text-muted)]">Loading participants...</p>
              </div>
            ) : isError ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-error)]">Failed to load participants.</p>
              </div>
            ) : !filtered?.length ? (
              <EmptyState
                icon={<Plus className="h-6 w-6" />}
                title="No participants found"
                description="Get started by adding your first participant to the system."
                action={<Button onClick={() => setSheetOpen(true)}>Add Participant</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Contact</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Service Type</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Assigned Workers</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Created</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link href={`/participants/${p.id}`} className="flex items-center gap-3 group">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-dim)] text-xs font-semibold text-[var(--color-primary)]">
                              {(p.firstName?.[0] ?? '?')}{(p.lastName?.[0] ?? '?')}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] group-hover:underline transition-colors">
                                {p.firstName} {p.lastName}
                              </p>
                              <p className="text-xs font-mono text-[var(--color-text-muted)]">{p.ndisNumber}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-secondary)]">{p.primaryPhoneNumber}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{p.primaryEmailAddress}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status.toLowerCase() as 'active' | 'inactive'} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs">{p.serviceSupport}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                          —
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                          {new Date(p.createdAt).toLocaleDateString('en-AU')}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setQuickViewId(p.id)}
                            title="Quick View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddParticipantSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <ImportParticipantDialog open={importOpen} onOpenChange={setImportOpen} />
      <QuickViewSidebar participantId={quickViewId} onClose={() => setQuickViewId(null)} />
    </div>
  );
}
