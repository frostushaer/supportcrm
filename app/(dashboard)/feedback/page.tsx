'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Pencil } from 'lucide-react';
import { AddFeedbackDialog } from '@/components/feedback/add-feedback-dialog';
import { FeedbackInfoDialog } from '@/components/feedback/feedback-info-dialog';
import { EditFeedbackDialog } from '@/components/feedback/edit-feedback-dialog';
import { useFeedbacks } from '@/hooks/use-feedback';
import { useRegionStore } from '@/store/region-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  
  const { selectedRegionId, setSelectedRegionId } = useRegionStore();
  const { data: feedbacks, isLoading } = useFeedbacks(search, statusFilter);

  const columns = [
    {
      label: 'Category',
      key: 'category',
    },
    {
      label: 'Subject',
      key: 'subject',
    },
    {
      label: 'Submitted By',
      key: 'name',
    },
    {
      label: 'Status',
      key: 'status',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (row: any) => {
        let colorClass = 'text-[var(--color-text-muted)] bg-[var(--color-subtle)]';
        if (row.status === 'New') colorClass = 'text-[var(--color-warning)] bg-[var(--color-warning-dim)]';
        else if (row.status === 'In Progress') colorClass = 'text-[var(--color-primary)] bg-[var(--color-primary-dim)]';
        else if (row.status === 'Resolved' || row.status === 'Closed') colorClass = 'text-[var(--color-success)] bg-[var(--color-success-dim)]';
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      label: 'Date',
      key: 'createdAt',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (row: any) => new Date(row.createdAt).toLocaleDateString('en-AU'),
    },
    {
      label: 'Action',
      key: 'action',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewFeedbackId(row.id)}
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditFeedbackId(row.id)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Feedback"
          description="Manage and track participant and staff feedback"
          action={
            <div className="flex items-center gap-4">
              <Select
                value={selectedRegionId || 'all'}
                onValueChange={(value) =>
                  setSelectedRegionId(value === 'all' ? '' : value)
                }
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
                + Add Feedback
              </Button>
            </div>
          }
        />

        <div className="flex items-center justify-between bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
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
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search feedback..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">Loading feedback...</div>
        ) : feedbacks && feedbacks.length > 0 ? (
          <DataTable
            columns={columns}
            data={feedbacks}
          />
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-subtle)] mb-4">
              <Search className="h-6 w-6 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No feedback found</h3>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
              There is no feedback matching your current filters. Try adjusting your search criteria or add new feedback.
            </p>
          </div>
        )}
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
    </>
  );
}
