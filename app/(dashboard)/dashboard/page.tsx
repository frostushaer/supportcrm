import type { Metadata } from 'next';
import { SectionCards } from './_components/section-cards';
import { ChartAreaInteractive } from './_components/chart-area-interactive';
import { RecentParticipantsTable } from './_components/recent-participants-table';

export const metadata: Metadata = {
  title: 'Dashboard - SupportCRM',
  description: 'NDIS operations overview and key metrics',
};

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
      <RecentParticipantsTable />
    </div>
  );
}

