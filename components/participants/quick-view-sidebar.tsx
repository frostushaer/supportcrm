'use client';

import { X, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useParticipant } from '@/hooks/use-participants';

interface QuickViewSidebarProps {
  participantId: string | null;
  onClose: () => void;
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)]">{value ?? '—'}</span>
    </div>
  );
}

export function QuickViewSidebar({ participantId, onClose }: QuickViewSidebarProps) {
  const { data: p, isLoading } = useParticipant(participantId ?? '');

  return (
    <Sheet open={!!participantId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="flex flex-row items-start justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <SheetTitle className="text-base">
              {isLoading ? 'Loading…' : p ? `${p.firstName} ${p.lastName}` : 'Participant'}
            </SheetTitle>
            {p && (
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{p.primaryEmailAddress}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-1">
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
          </div>
        )}

        {p && (
          <div className="mt-4 space-y-5">
            {/* Quick Snapshot */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Quick Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="NDIS Number" value={p.ndisNumber} />
                <InfoItem label="Status" value={p.status} />
                <InfoItem label="DOB" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-AU') : null} />
                <InfoItem label="Gender" value={p.gender} />
                <InfoItem label="Service Support" value={p.serviceSupport} />
                <InfoItem label="Region" value={p.region?.name} />
              </div>

              {/* Contact */}
              <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Phone className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {p.primaryPhoneNumber}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Mail className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {p.primaryEmailAddress}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {p.address}, {p.suburb} {p.state} {p.postcode}
                </div>
              </div>

              {/* NDIS Dates */}
              {(p.serviceStartDate || p.serviceEndDate) && (
                <div className="pt-2 border-t border-[var(--color-border)] grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Service Start</p>
                      <p className="text-xs font-medium text-[var(--color-text)]">
                        {p.serviceStartDate ? new Date(p.serviceStartDate).toLocaleDateString('en-AU') : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Service End</p>
                      <p className="text-xs font-medium text-[var(--color-text)]">
                        {p.serviceEndDate ? new Date(p.serviceEndDate).toLocaleDateString('en-AU') : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {p.emergencyContactName && (
                <div className="pt-2 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Emergency Contact</p>
                  <p className="text-sm text-[var(--color-text)]">{p.emergencyContactName}</p>
                  {p.emergencyContactNumber && (
                    <p className="text-xs text-[var(--color-text-muted)]">{p.emergencyContactNumber}</p>
                  )}
                </div>
              )}

              {/* Audit */}
              <div className="pt-2 border-t border-[var(--color-border)] flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Audit Participation:</span>
                <Badge variant={p.auditParticipation ? 'default' : 'secondary'} className="text-xs">
                  {p.auditParticipation ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Case Notes */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                Case Notes ({p.caseNotes?.length ?? 0})
              </h3>
              {!p.caseNotes?.length ? (
                <p className="text-xs text-[var(--color-text-muted)]">No case notes recorded.</p>
              ) : (
                <div className="space-y-2">
                  {p.caseNotes.slice(0, 3).map((n: { id: string; subject?: string | null; content: string; date: string }) => (
                    <div key={n.id} className="rounded-lg border border-[var(--color-border)] p-3">
                      {n.subject && <p className="text-xs font-medium text-[var(--color-text)] mb-0.5">{n.subject}</p>}
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{n.content}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {new Date(n.date).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  ))}
                  {p.caseNotes.length > 3 && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center">
                      +{p.caseNotes.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
