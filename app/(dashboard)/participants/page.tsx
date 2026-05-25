'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { AddParticipantSheet } from '@/components/participants/add-participant-sheet';
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
  region: { name: string } | null;
};

export default function ParticipantsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: participants, isLoading, isError } = useParticipants(
    statusFilter || undefined,
    search || undefined
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Participants"
        description="Manage NDIS participants and their support plans."
        action={
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">

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
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(String(v))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
            ) : !participants?.length ? (
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
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">NDIS Number</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Service Type</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Contact</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Region</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(participants as ParticipantRow[]).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-dim)] text-xs font-semibold text-[var(--color-primary)]">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">
                                {p.firstName} {p.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">{p.ndisNumber}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status.toLowerCase() as 'active' | 'inactive'} />
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.serviceSupport}</td>
                        <td className="px-4 py-3">
                          <p className="text-[var(--color-text-secondary)]">{p.primaryEmailAddress}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{p.primaryPhoneNumber}</p>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.region?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Link href={`/participants/${p.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
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
    </div>
  );
}
