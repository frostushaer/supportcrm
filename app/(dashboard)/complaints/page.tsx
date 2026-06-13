'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Plus } from 'lucide-react';
import { AddComplaintDialog } from '@/components/complaints/add-complaint-dialog';
import { ComplaintInfoDialog } from '@/components/complaints/complaint-info-dialog';
import { useComplaints } from '@/hooks/use-complaints';
import { useRegionStore } from '@/store/region-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Complaint {
  id: string;
  name: string;
  date: string;
  subject: string;
  details: string;
  userRole: string | null;
  submittedBy: string;
  createdAt: string;
}

export default function ComplaintsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { selectedRegionId, setSelectedRegionId } = useRegionStore();
  const { data: complaints, isLoading, isError } = useComplaints(selectedRegionId, search);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Complaints</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Directory of all complaints.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedRegionId || 'all'}
            onValueChange={(value) => setSelectedRegionId(value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="region_1">Brisbane</SelectItem>
              <SelectItem value="region_2">Sydney</SelectItem>
              <SelectItem value="region_3">Melbourne</SelectItem>
              <SelectItem value="region_4">Perth</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Complaint
          </Button>
        </div>
      </div>

      <div>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-text-muted)]">Loading complaints...</p>
              </div>
            ) : isError ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-error)]">Failed to load complaints.</p>
              </div>
            ) : !complaints?.length ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-error)]">No data found !</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Subject</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Submitted By</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">User Role</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Details</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(complaints as Complaint[]).map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text)]">{c.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-muted)]">{formatDate(c.date)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--color-text)]">{c.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-secondary)]">{c.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-muted)]">{c.userRole || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-[200px]">
                            {c.details}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[var(--color-warning)] hover:text-[var(--color-warning)]"
                            onClick={() => setSelectedComplaintId(c.id)}
                            title="View Details"
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

          {/* Pagination placeholder */}
          <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
            <span>Showing 1 to {complaints?.length || 0} of {complaints?.length || 0} results</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddComplaintDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {selectedComplaintId && (
        <ComplaintInfoDialog
          complaintId={selectedComplaintId}
          open={!!selectedComplaintId}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedComplaintId(null);
          }}
        />
      )}
    </div>
  );
}
