import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-subtle)] text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-[var(--color-text-muted)]">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
