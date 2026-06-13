'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Plus, Download, Trash2, FileIcon } from 'lucide-react';
import { useRegionStore } from '@/store/region-store';
import { usePolicies, type PolicyWithRegion } from '@/hooks/use-policies';


// Dialogs
import { AddPolicyDialog } from '@/components/policies/add-policy-dialog';
import { PolicyInfoDialog } from '@/components/policies/policy-info-dialog';
import { DeletePolicyDialog } from '@/components/policies/delete-policy-dialog';

export default function PoliciesPage() {
  const selectedRegionId = useRegionStore((state) => state.selectedRegionId);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewPolicy, setViewPolicy] = useState<PolicyWithRegion | null>(null);
  const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);
  const [deletePolicyName, setDeletePolicyName] = useState<string>('');

  // Fetch Policies
  const { data: policiesData, isLoading } = usePolicies(
    searchQuery,
    selectedRegionId || undefined
  );

  const policies = policiesData?.data || [];

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">Policies</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Directory of all policies</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden sm:flex">
            Policy Categories
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Policy
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* Filters Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Optional secondary filters can go here */}
            </div>
            
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-[var(--color-surface)]"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-subtle)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Policies</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                        Loading policies...
                      </td>
                    </tr>
                  ) : policies.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-red-500 font-medium">
                        No Data Found !
                      </td>
                    </tr>
                  ) : (
                    policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-[var(--color-subtle)] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                              <FileIcon className="w-4 h-4 text-[var(--color-primary)]" />
                            </div>
                            <span className="font-medium text-[var(--color-text)]">{policy.fileName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[var(--color-text-muted)]">{policy.category}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                              onClick={() => setViewPolicy(policy)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                              onClick={() => window.open(policy.fileUrl, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                              onClick={() => {
                                setDeletePolicyId(policy.id);
                                setDeletePolicyName(policy.fileName);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Stub */}
            {!isLoading && policies.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Showing 1 to {policies.length} of {policies.length} results
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Dialogs */}
      <AddPolicyDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
      />
      
      <PolicyInfoDialog 
        policy={viewPolicy} 
        open={!!viewPolicy} 
        onOpenChange={(open) => !open && setViewPolicy(null)} 
      />
      
      <DeletePolicyDialog 
        policyId={deletePolicyId} 
        policyName={deletePolicyName}
        open={!!deletePolicyId} 
        onOpenChange={(open) => !open && setDeletePolicyId(null)} 
      />
    </div>
  );
}
