import React from "react";
import { PageHeader } from "@/components/shared/page-header";

interface ReportLayoutProps {
  title: string;
  filters?: React.ReactNode;
  children: React.ReactNode;
}

export function ReportLayout({ title, filters, children }: ReportLayoutProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
      />
      
      {filters && (
        <div className="w-full">
          {filters}
        </div>
      )}
      
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
