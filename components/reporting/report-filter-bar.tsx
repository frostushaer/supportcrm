import React from "react";
import { Search, X, Download } from "lucide-react";

interface ReportFilterBarProps {
  children: React.ReactNode;
  onSearch?: () => void;
  onClear?: () => void;
  onExport?: () => void;
}

export function ReportFilterBar({
  children,
  onSearch,
  onClear,
  onExport,
}: ReportFilterBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {children}
      </div>
      
      <div className="flex items-center gap-2">
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-light)] hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Clear Filter
          </button>
        )}
        {onSearch && (
          <button
            onClick={onSearch}
            className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
}
