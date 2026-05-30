'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Plus, HelpCircle } from 'lucide-react';
import { AskQuestionDialog } from '@/components/ask-a-question/ask-question-dialog';
import { QuestionInfoDialog } from '@/components/ask-a-question/question-info-dialog';
import { useQuestions } from '@/hooks/use-questions';
import { EmptyState } from '@/components/shared/empty-state';
import { useRegionStore } from '@/store/region-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Question {
  id: string;
  category: string;
  subject: string;
  name: string;
  userRole: string | null;
  details: string;
  createdAt: string;
}

import { QUESTION_CATEGORIES } from '@/lib/validations/questions';

const getCategoryStyle = (category: string) => {
  // Use inline styles with HSL colors to avoid Tailwind class limitations
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    'Accounting': { bg: 'hsl(210 100% 96%)', text: 'hsl(210 80% 45%)', border: 'hsl(210 60% 85%)' },
    'Compliance': { bg: 'hsl(140 60% 95%)', text: 'hsl(140 60% 35%)', border: 'hsl(140 40% 80%)' },
    'IT': { bg: 'hsl(270 60% 96%)', text: 'hsl(270 60% 45%)', border: 'hsl(270 40% 85%)' },
    'Legal Query': { bg: 'hsl(0 70% 96%)', text: 'hsl(0 70% 45%)', border: 'hsl(0 50% 85%)' },
    'Marketing': { bg: 'hsl(320 70% 96%)', text: 'hsl(320 70% 45%)', border: 'hsl(320 50% 85%)' },
    'Plan Review': { bg: 'hsl(25 90% 96%)', text: 'hsl(25 90% 40%)', border: 'hsl(25 70% 85%)' },
    'Operations': { bg: 'hsl(180 60% 95%)', text: 'hsl(180 60% 35%)', border: 'hsl(180 40% 80%)' },
    'HR': { bg: 'hsl(160 60% 95%)', text: 'hsl(160 60% 35%)', border: 'hsl(160 40% 80%)' },
    'Finance': { bg: 'hsl(240 60% 96%)', text: 'hsl(240 60% 45%)', border: 'hsl(240 40% 85%)' },
  };
  return styles[category] || { bg: 'var(--color-subtle)', text: 'var(--color-text-secondary)', border: 'var(--color-border)' };
};

const getCategoryInitials = (category: string) => {
  return category.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export default function AskQuestionPage() {
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { selectedRegionId } = useRegionStore();
  const { data: questions, isLoading, isError } = useQuestions(selectedRegionId, search);

  const filtered = (questions as Question[] | undefined)?.filter((q) => {
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header - Same as Participants */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Asked Questions</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Directory of all questions submitted to SupportCRM.</p>
        </div>
        <Button onClick={() => setIsAskDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ask A Question
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
                placeholder="Search by subject or submitter..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {QUESTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table - Same structure as Participants */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-text-muted)]">Loading questions...</p>
              </div>
            ) : isError ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[var(--color-error)]">Failed to load questions.</p>
              </div>
            ) : !filtered?.length ? (
              <EmptyState
                icon={<HelpCircle className="h-6 w-6" />}
                title="No questions found"
                description="Get started by asking your first question to the SupportCRM team."
                action={<Button onClick={() => setIsAskDialogOpen(true)}>Ask A Question</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-subtle)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Subject</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Submitted By</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Details</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Submitted</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q) => (
                      <tr
                        key={q.id}
                        className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-subtle)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const style = getCategoryStyle(q.category);
                              return (
                                <>
                                  <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                    style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                                  >
                                    {getCategoryInitials(q.category)}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                    style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                                  >
                                    {q.category}
                                  </Badge>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--color-text)]">{q.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-secondary)]">{q.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-muted)]">{q.userRole || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-[200px]">
                            {q.details}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-AU') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedQuestionId(q.id)}
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
        </div>
      </div>

      <AskQuestionDialog
        open={isAskDialogOpen}
        onOpenChange={setIsAskDialogOpen}
      />

      {selectedQuestionId && (
        <QuestionInfoDialog
          questionId={selectedQuestionId}
          open={!!selectedQuestionId}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedQuestionId(null);
          }}
        />
      )}
    </div>
  );
}
