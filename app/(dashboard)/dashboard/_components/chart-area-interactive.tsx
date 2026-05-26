'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';

const chartData = [
  { date: '2025-03-01', shifts: 18, participants: 12 },
  { date: '2025-03-07', shifts: 24, participants: 15 },
  { date: '2025-03-14', shifts: 31, participants: 18 },
  { date: '2025-03-21', shifts: 28, participants: 16 },
  { date: '2025-03-28', shifts: 35, participants: 21 },
  { date: '2025-04-04', shifts: 42, participants: 25 },
  { date: '2025-04-11', shifts: 38, participants: 22 },
  { date: '2025-04-18', shifts: 51, participants: 29 },
  { date: '2025-04-25', shifts: 46, participants: 27 },
  { date: '2025-05-02', shifts: 55, participants: 33 },
  { date: '2025-05-09', shifts: 60, participants: 38 },
  { date: '2025-05-16', shifts: 58, participants: 36 },
  { date: '2025-05-23', shifts: 65, participants: 42 },
  { date: '2025-05-25', shifts: 70, participants: 45 },
];

const chartConfig = {
  shifts: { label: 'Shifts', color: 'var(--chart-1)' },
  participants: { label: 'Active Participants', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');

  React.useEffect(() => {
    if (isMobile) setTimeRange('30d');
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const ref = new Date('2025-05-25');
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 90;
    const start = new Date(ref);
    start.setDate(start.getDate() - days);
    return date >= start;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Operational Activity</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Shifts & active participants over time</span>
          <span className="@[540px]/card:hidden">Last period</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden *:data-[slot=toggle-group-item]:px-4!"
          >
            <ToggleGroupItem value="90d">3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                <SelectItem value="90d" className="rounded-lg">3 months</SelectItem>
                <SelectItem value="30d" className="rounded-lg">30 days</SelectItem>
                <SelectItem value="7d" className="rounded-lg">7 days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillShifts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-shifts)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-shifts)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillParticipants" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-participants)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-participants)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 4}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                  indicator="dot"
                />
              }
            />
            <Area dataKey="participants" type="natural" fill="url(#fillParticipants)" stroke="var(--color-participants)" stackId="a" />
            <Area dataKey="shifts" type="natural" fill="url(#fillShifts)" stroke="var(--color-shifts)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
