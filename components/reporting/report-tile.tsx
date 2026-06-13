import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ReportTileProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  accentColor?: string;
}

export function ReportTile({ title, description, icon: Icon, href, accentColor = "var(--color-primary)" }: ReportTileProps) {
  return (
    <Link href={href} className="block transition-transform hover:scale-[1.02]">
      <div className="flex h-full flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[var(--color-text)]">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-light)]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
