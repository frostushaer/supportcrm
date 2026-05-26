import Link from 'next/link';
import { siX } from 'simple-icons';
import { SimpleIcon } from '@/components/simple-icon';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Need help?</CardTitle>
        <CardDescription>
          Contact your system administrator or reach out on&nbsp;
          <Link
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Reach out on X"
            className="inline-flex items-center text-foreground"
          >
            <SimpleIcon icon={siX} aria-hidden className="size-3 fill-current" />
          </Link>
          .
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
