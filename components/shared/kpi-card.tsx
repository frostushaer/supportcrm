import { Card, CardContent } from '@/components/ui/card';

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
      className={`shadow-md transition-all duration-300 hover:shadow-lg ${
        isGradient ? 'ring-0 border-transparent' : ''
      }`}
      style={gradientStyles[variant]}
    >
      <CardContent className="flex items-start justify-between py-2">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isGradient ? 'text-white/80' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${isGradient ? 'text-white' : 'text-foreground'}`}>
            {value}
          </p>
          {trend && (
            <p className={`mt-1.5 text-xs ${
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
              : 'bg-muted text-muted-foreground'
          }`}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
