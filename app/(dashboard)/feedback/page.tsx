'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Pencil, Plus, MessageSquare } from 'lucide-react';
import { AddFeedbackDialog } from '@/components/feedback/add-feedback-dialog';
import { FeedbackInfoDialog } from '@/components/feedback/feedback-info-dialog';
import { EditFeedbackDialog } from '@/components/feedback/edit-feedback-dialog';
import { useFeedbacks } from '@/hooks/use-feedback';
import { useRegionStore } from '@/store/region-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';

interface Feedback {
  id: string;
  category: string;
  subject: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewFeedbackId, setViewFeedbackId] = useState<string | null>(null);
  const [editFeedbackId, setEditFeedbackId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { selectedRegionId } = useRegionStore();
  const { data: feedbacks, isLoading, isError } = useFeedbacks(search, statusFilter);

  return (
    <div className="space-y-6">
      {/* Header - Same as Participants */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Feedback</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Manage and track participant and staff feedback</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Feedback
        </Button>
      </div>

      <div>
        <div className="space-y-4">
          {/* Filters - Same layout as Participants */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input
                type="search"
                placeholder="Search feedback..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table - Same structure as Participants */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-text-muted)]">Loading feedback...</p>
              </div>
            ) : isError ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-error)]">Failed to load feedback.</p>
              </div>
            ) : !feedbacks?.length ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="No feedback found"
                description="There is no feedback matching your current filters. Try adjusting your search criteria or add new feedback."
                action={<Button onClick={() => setIsAddDialogOpen(true)}>Add Feedback</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Subject</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Submitted By</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(feedbacks as Feedback[]).map((row) => {
                      let colorClass = 'text-[var(--color-text-muted)] bg-[var(--color-subtle)]';
                      if (row.status === 'New') colorClass = 'text-[var(--color-warning)] bg-[var(--color-warning-dim)]';
                      else if (row.status === 'In Progress') colorClass = 'text-[var(--color-primary)] bg-[var(--color-primary-dim)]';
                      else if (row.status === 'Resolved' || row.status === 'Closed') colorClass = 'text-[var(--color-success)] bg-[var(--color-success-dim)]';
                      
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {row.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[var(--color-text)]">{row.subject}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[var(--color-text-secondary)]">{row.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                            {new Date(row.createdAt).toLocaleDateString('en-AU')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-primary-dim)]"
                                onClick={() => setViewFeedbackId(row.id)}
                                title="View Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                onClick={() => setEditFeedbackId(row.id)}
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddFeedbackDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {viewFeedbackId && (
        <FeedbackInfoDialog
          feedbackId={viewFeedbackId}
          open={!!viewFeedbackId}
          onOpenChange={(open) => {
            if (!open) setViewFeedbackId(null);
          }}
        />
      )}

      {editFeedbackId && (
        <EditFeedbackDialog
          feedbackId={editFeedbackId}
          open={!!editFeedbackId}
          onOpenChange={(open) => {
            if (!open) setEditFeedbackId(null);
          }}
        />
      )}
    </div>
  );
}
