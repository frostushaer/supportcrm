import { Card } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
}

export function KPICard({ title, value, trend, icon }: KPICardProps) {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-start justify-between px-6 py-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-2 text-sm ${
                trend.positive
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-error)]'
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-dim)] text-[var(--color-primary)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
