'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegionStore } from '@/store/region-store';
import { useHrmForms, useDeleteHrmForm } from '@/hooks/use-hrm-forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Pencil, Eye, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function FormsHRMPage() {
  const { selectedRegionId } = useRegionStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  const { data, isLoading } = useHrmForms(selectedRegionId || undefined, status, search);
  const forms = data?.data || [];

  const deleteForm = useDeleteHrmForm();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteForm.mutateAsync(id);
        toast.success('Form deleted successfully');
      } catch {
        toast.error('Failed to delete form');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">HRM Forms</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Manage HR specific Forms</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/forms-hrm/new">
            <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 gap-2">
              <Plus className="h-4 w-4" />
              Create HRM Forms
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-[200px]">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-[var(--color-bg-primary)]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <Input 
            placeholder="Search" 
            className="pl-9 bg-[var(--color-bg-primary)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[var(--color-bg-primary)] rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-[var(--color-text-secondary)]">
                  No Data Found !
                </TableCell>
              </TableRow>
            ) : (
              forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium text-[var(--color-text)]">
                    {form.title}
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">
                    {form.category}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      form.status === 'Published' 
                        ? 'bg-green-100 text-green-700' 
                        : form.status === 'Draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {form.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/forms-hrm/${form.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/forms-hrm/${form.id}/view`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(form.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
