import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download } from 'lucide-react';

const participants = [
  { name: 'Jane Smith', ndisNumber: 'NDIS-2024-001', region: 'Melbourne', plan: 'Core Supports', status: 'active', expires: '15 Jun 2025' },
  { name: 'Mark Johnson', ndisNumber: 'NDIS-2024-002', region: 'Sydney', plan: 'Capacity Building', status: 'pending', expires: '3 Jul 2025' },
  { name: 'Sarah Lee', ndisNumber: 'NDIS-2024-003', region: 'Brisbane', plan: 'Support Coordination', status: 'inactive', expires: '28 May 2025' },
  { name: 'Tom Harris', ndisNumber: 'NDIS-2024-004', region: 'Melbourne', plan: 'Core Supports', status: 'active', expires: '20 Aug 2025' },
  { name: 'Nina Patel', ndisNumber: 'NDIS-2024-005', region: 'Adelaide', plan: 'Capacity Building', status: 'active', expires: '10 Sep 2025' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'secondary',
  inactive: 'outline',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  inactive: 'Inactive',
};

export function RecentParticipantsTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent Participants</CardTitle>
          <CardDescription>Current participant records with plan, region, and status.</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>NDIS Number</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Plan Type</TableHead>
              <TableHead>Plan Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.ndisNumber}>
                <TableCell className="pl-6 font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.ndisNumber}</TableCell>
                <TableCell>{p.region}</TableCell>
                <TableCell>{p.plan}</TableCell>
                <TableCell className="text-muted-foreground">{p.expires}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
