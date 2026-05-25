import { Card } from '@/components/ui/card';

type KPICardVariant = 'default' | 'purple' | 'teal' | 'blue' | 'red' | 'orange';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
  variant?: KPICardVariant;
}

const gradientStyles: Record<KPICardVariant, React.CSSProperties> = {
  default: {},
  purple: { background: 'linear-gradient(to bottom right, var(--gradient-purple-from), var(--gradient-purple-to))' },
  teal:   { background: 'linear-gradient(to bottom right, var(--gradient-teal-from),   var(--gradient-teal-to))' },
  blue:   { background: 'linear-gradient(to bottom right, var(--gradient-blue-from),   var(--gradient-blue-to))' },
  red:    { background: 'linear-gradient(to bottom right, var(--gradient-red-from),    var(--gradient-red-to))' },
  orange: { background: 'linear-gradient(to bottom right, var(--gradient-orange-from), var(--gradient-orange-to))' },
};

export function KPICard({ title, value, trend, icon, variant = 'default' }: KPICardProps) {
  const isGradient = variant !== 'default';

  return (
    <Card
      className={`border-[var(--color-border)] shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        isGradient ? 'border-transparent' : 'bg-[var(--color-surface)]'
      }`}
      style={gradientStyles[variant]}
    >
      <div className="flex items-start justify-between px-6 py-6">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isGradient ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-semibold ${isGradient ? 'text-white' : 'text-[var(--color-text)]'}`}>
            {value}
          </p>
          {trend && (
            <p className={`mt-2 text-sm ${
              isGradient
                ? 'text-white/70'
                : trend.positive
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-error)]'
            }`}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isGradient
              ? 'bg-white/20 text-white'
              : 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]'
          }`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
