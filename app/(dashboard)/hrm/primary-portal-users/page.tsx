/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Search, Eye, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortalUsers } from '@/hooks/use-hrm';
import { useRegionStore } from '@/store/region-store';

export default function PrimaryPortalUsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { selectedRegionId, setSelectedRegionId } = useRegionStore();

  const { data: portalUsers, isLoading } = usePortalUsers(selectedRegionId, statusFilter);

  // Filter local search
  const filteredUsers = portalUsers?.filter((u: any) => 
    search === '' || 
    u.worker?.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    u.worker?.lastName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { label: 'Name', key: 'name', render: (row: any) => `\${row.worker?.firstName} \${row.worker?.lastName}` },
    { label: 'Email', key: 'email' },
    { label: 'Role', key: 'role' },
    { 
      label: 'Regions', 
      key: 'regions',
      render: (row: any) => row.regions?.map((r: any) => r.name).join(', ') || 'None'
    },
    {
      label: 'Status',
      key: 'status',
      render: (row: any) => {
        let colorClass = 'text-[var(--color-text-muted)] bg-[var(--color-subtle)]';
        if (row.status === 'Active') colorClass = 'text-[var(--color-success)] bg-[var(--color-success-dim)]';
        if (row.status === 'Inactive') colorClass = 'text-[var(--color-danger)] bg-[var(--color-danger-dim)]';
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold \${colorClass}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      label: 'Action',
      key: 'action',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-primary)]">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Primary Portal Users"
        description="All primary portal users in one place"
        action={
          <div className="flex items-center gap-4">
            <Select value={selectedRegionId || 'all'} onValueChange={(val) => setSelectedRegionId(val === 'all' ? '' : val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="region_1">Brisbane</SelectItem>
                <SelectItem value="region_2">Sydney</SelectItem>
              </SelectContent>
            </Select>
            <Button>+ Add Primary Portal User</Button>
          </div>
        }
      />

      <div className="flex items-center justify-between bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">Loading users...</div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <DataTable columns={columns} data={filteredUsers} />
      ) : (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">No portal users found</h3>
          <p className="text-[var(--color-text-muted)] mt-1">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
