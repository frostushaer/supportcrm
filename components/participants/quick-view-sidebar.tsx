'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Calendar, CreditCard,
  User, Shield, AlertCircle, Users, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useParticipant } from '@/hooks/use-participants';

interface QuickViewSidebarProps {
  participantId: string | null;
  onClose: () => void;
}

function SnapshotCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-[var(--color-primary)]" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
      </div>
      {value ? (
        <span className="text-xs font-semibold text-[var(--color-text)] leading-snug">{value}</span>
      ) : (
        <span className="text-[10px] text-[var(--color-primary)] font-medium">Add information ↗</span>
      )}
    </div>
  );
}

export function QuickViewSidebar({ participantId, onClose }: QuickViewSidebarProps) {
  const { data: p, isLoading } = useParticipant(participantId ?? '');

  const initials = p
    ? `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`
    : '??';

  return (
    <Sheet open={!!participantId} onOpenChange={(o) => !o && onClose()}>
      {/* Hide the built-in SheetContent close button — we use the sheet's own X only */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-[400px] overflow-y-auto p-0 gap-0 [&>button:first-child]:hidden"
      >
        <SheetTitle className="sr-only">Quick View</SheetTitle>

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
              {isLoading ? '…' : initials}
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                {isLoading ? 'Loading…' : p ? `${p.firstName} ${p.lastName}` : '—'}
              </h2>
              {p && (
                <p className="text-xs text-[var(--color-text-muted)]">{p.primaryEmailAddress}</p>
              )}
            </div>
          </div>
          {/* Single X button */}
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Action buttons ── */}
        {p && (
          <div className="flex gap-2 px-5 py-3 border-b border-[var(--color-border)]">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
              Add Case Notes
            </Button>
            <Link href={`/participants/${p.id}`} onClick={onClose} className="flex-1">
              <Button size="sm" className="w-full text-xs h-8">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Profile
              </Button>
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
          </div>
        )}

        {p && (
          <div className="p-4 space-y-4">

            {/* ── Quick Snapshot ── */}
            <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
              {/* Dark header */}
              <div className="flex items-center justify-between bg-[var(--color-primary)] px-4 py-2.5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Quick Snapshot</h3>
                  <p className="text-[11px] text-white/60">Essential participant information</p>
                </div>
              </div>
              {/* White grid */}
              <div className="bg-[var(--color-surface)] grid grid-cols-3 gap-1.5 p-2">
                <SnapshotCell icon={CreditCard} label="NDIS No." value={p.ndisNumber} />
                <SnapshotCell icon={Shield} label="Status" value={p.status} />
                <SnapshotCell icon={User} label="Gender" value={p.gender} />
                <SnapshotCell icon={Calendar} label="Date of Birth" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-AU') : null} />
                <SnapshotCell icon={Users} label="Service Type" value={p.serviceSupport} />
                <SnapshotCell icon={MapPin} label="Region" value={p.region?.name} />
                <SnapshotCell icon={Calendar} label="Service Start" value={p.serviceStartDate ? new Date(p.serviceStartDate).toLocaleDateString('en-AU') : null} />
                <SnapshotCell icon={Calendar} label="Service End" value={p.serviceEndDate ? new Date(p.serviceEndDate).toLocaleDateString('en-AU') : null} />
                <SnapshotCell icon={AlertCircle} label="Emergency Contact" value={p.emergencyContactName} />
                <SnapshotCell icon={User} label="Plan Nominee" value={p.planNominee} />
                <SnapshotCell icon={Users} label="Ext. Coordinator" value={p.externalCoordinatorName} />
                <SnapshotCell icon={Phone} label="Ext. Coord. Phone" value={p.externalCoordinatorPhone} />
              </div>
            </div>

            {/* ── Contact Details ── */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
              {p.primaryPhoneNumber && (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">{p.primaryPhoneNumber}</span>
                </div>
              )}
              {p.primaryEmailAddress && (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-secondary)] break-all">{p.primaryEmailAddress}</span>
                </div>
              )}
              {p.address && (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {[p.address, p.suburb, p.state, p.postcode].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <Shield className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Audit Participation:</span>
                <span className={`text-xs font-semibold ${p.auditParticipation ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}>
                  {p.auditParticipation ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* ── Case Notes ── */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2.5">Case Notes</h3>
              {!p.caseNotes?.length ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 text-center">
                  <p className="text-xs text-[var(--color-text-muted)]">No case notes available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {p.caseNotes.slice(0, 3).map((n: { id: string; subject?: string | null; content: string; date: string }) => (
                    <div key={n.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                      {n.subject && <p className="text-xs font-medium text-[var(--color-text)] mb-0.5">{n.subject}</p>}
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{n.content}</p>
                      <p className="mt-1.5 text-[10px] text-[var(--color-text-muted)]">{new Date(n.date).toLocaleDateString('en-AU')}</p>
                    </div>
                  ))}
                  {p.caseNotes.length > 3 && (
                    <p className="text-xs text-center text-[var(--color-text-muted)]">+{p.caseNotes.length - 3} more</p>
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
