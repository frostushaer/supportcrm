'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Plus, MessageCircle, HelpCircle } from 'lucide-react';
import { AskQuestionDialog } from '@/components/ask-a-question/ask-question-dialog';
import { QuestionInfoDialog } from '@/components/ask-a-question/question-info-dialog';
import { useQuestions } from '@/hooks/use-questions';
import { EmptyState } from '@/components/shared/empty-state';
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

const CATEGORIES = [
  'Accounting',
  'Compliance',
  'IT',
  'Legal Query',
  'Marketing',
  'Plan Review',
  'Operations',
  'HR',
  'Finance',
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Accounting': 'bg-blue-50 text-blue-700 border-blue-200',
    'Compliance': 'bg-green-50 text-green-700 border-green-200',
    'IT': 'bg-purple-50 text-purple-700 border-purple-200',
    'Legal Query': 'bg-red-50 text-red-700 border-red-200',
    'Marketing': 'bg-pink-50 text-pink-700 border-pink-200',
    'Plan Review': 'bg-orange-50 text-orange-700 border-orange-200',
    'Operations': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'HR': 'bg-teal-50 text-teal-700 border-teal-200',
    'Finance': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getCategoryInitials = (category: string) => {
  return category.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export default function AskQuestionPage() {
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: questions, isLoading, isError } = useQuestions(search);

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
                {CATEGORIES.map((cat) => (
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
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getCategoryColor(q.category)}`}>
                              {getCategoryInitials(q.category)}
                            </div>
                            <Badge variant="secondary" className={`text-xs ${getCategoryColor(q.category)}`}>
                              {q.category}
                            </Badge>
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
