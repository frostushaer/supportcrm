import { Badge } from '@/components/ui/badge';

type Status =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'draft'
  | 'resolved'
  | 'submitted';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { label: string; color: string; dotColor: string }
> = {
  active: {
    label: 'Active',
    color: 'text-[var(--color-success)]',
    dotColor: 'bg-[var(--color-success)]',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-[var(--color-error)]',
    dotColor: 'bg-[var(--color-error)]',
  },
  pending: {
    label: 'Pending',
    color: 'text-[var(--color-warning)]',
    dotColor: 'bg-[var(--color-warning)]',
  },
  approved: {
    label: 'Approved',
    color: 'text-[var(--color-primary)]',
    dotColor: 'bg-[var(--color-primary)]',
  },
  draft: {
    label: 'Draft',
    color: 'text-[var(--color-text-muted)]',
    dotColor: 'bg-[var(--color-text-muted)]',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-[var(--color-success)]',
    dotColor: 'bg-[var(--color-success)]',
  },
  submitted: {
    label: 'Submitted',
    color: 'text-[var(--color-info)]',
    dotColor: 'bg-[var(--color-info)]',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 border-current ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  );
}
