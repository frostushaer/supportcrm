# Participants Module - Feature Spec

## Goal
Build the complete Participants module with list page, filters, Add New form, and detailed profile view with tabs—following the Vertex360 reference design.

---

## Module Overview

**Routes:**
- `/participants` → List page with DataTable
- `/participants/[id]` → Profile page with tabs

**Database Models:** (from architecture-context.md)
- Participant
- NDISPlan
- Document
- Note
- ServiceAgreement

---

## Part 1: Database Schema

### Update `prisma/schema.prisma`

Add complete Participant models:

```prisma
model Participant {
  id                    String   @id @default(cuid())
  firstName             String
  lastName              String
  gender                String
  dateOfBirth           DateTime
  primaryEmailAddress   String
  primaryPhoneNumber    String
  secondaryPhoneNumber  String?
  ndisNumber            String   @unique
  address               String
  suburb                String
  state                 String
  postcode              String
  status                String   // Active, Inactive
  serviceSupport        String   // Core, Capacity Building, Capital
  auditParticipation    Boolean  @default(false)
  regionId              String
  
  region                Region   @relation(fields: [regionId], references: [id])
  ndisPlans             NDISPlan[]
  documents             Document[]
  notes                 Note[]
  serviceAgreements     ServiceAgreement[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model NDISPlan {
  id              String      @id @default(cuid())
  participantId   String
  planStartDate   DateTime
  planEndDate     DateTime
  managementStyle String      // NDIA Managed, Plan Managed, Self Managed
  totalBudget     Float
  usedBudget      Float       @default(0)
  
  participant     Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Document {
  id              String      @id @default(cuid())
  participantId   String
  fileName        String
  fileUrl         String
  fileType        String
  uploadedBy      String
  
  participant     Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime    @default(now())
}

model Note {
  id              String      @id @default(cuid())
  participantId   String
  content         String      @db.Text
  createdBy       String
  
  participant     Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model ServiceAgreement {
  id              String      @id @default(cuid())
  participantId   String
  agreementType   String
  startDate       DateTime
  endDate         DateTime
  status          String      // Active, Expired, Pending
  
  participant     Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

**Run migration:**
```bash
pnpm prisma migrate dev --name add-participants
pnpm prisma generate
```

---

## Part 2: Validation Schema

**File:** `lib/validations/participants.ts`

```typescript
import { z } from 'zod';

export const participantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  dateOfBirth: z.date(),
  primaryEmailAddress: z.string().email('Invalid email'),
  primaryPhoneNumber: z.string().min(10, 'Invalid phone number'),
  secondaryPhoneNumber: z.string().optional(),
  ndisNumber: z.string().length(9, 'NDIS number must be 9 digits'),
  address: z.string().min(1, 'Address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().length(4, 'Postcode must be 4 digits'),
  status: z.enum(['Active', 'Inactive']),
  serviceSupport: z.enum(['Core', 'Capacity Building', 'Capital']),
  auditParticipation: z.boolean().default(false),
  regionId: z.string().min(1, 'Region is required'),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;
```

---

## Part 3: API Routes

**File:** `app/api/participants/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';
import { auth } from '@/lib/auth';

// GET /api/participants - List with filters
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const participants = await db.participant.findMany({
      where: {
        ...(regionId && { regionId }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { ndisNumber: { contains: search } },
          ],
        }),
      },
      include: {
        region: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

// POST /api/participants - Create new
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = participantSchema.parse(body);

    const participant = await db.participant.create({
      data: validated,
    });

    return NextResponse.json(
      { success: true, data: participant },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/participants/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';
import { auth } from '@/lib/auth';

// GET single participant
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participant = await db.participant.findUnique({
      where: { id: params.id },
      include: {
        region: true,
        ndisPlans: true,
        documents: true,
        notes: true,
        serviceAgreements: true,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participant' },
      { status: 500 }
    );
  }
}

// PATCH update participant
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = participantSchema.partial().parse(body);

    const participant = await db.participant.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

// DELETE participant
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.participant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    );
  }
}
```

---

## Part 4: TanStack Query Hooks

**File:** `hooks/use-participants.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/store/region-store';
import type { ParticipantFormData } from '@/lib/validations/participants';

export function useParticipants(status?: string, search?: string) {
  const { selectedRegionId } = useRegionStore();

  return useQuery({
    queryKey: ['participants', selectedRegionId, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.set('regionId', selectedRegionId);
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/participants?${params}`);
      if (!res.ok) throw new Error('Failed to fetch participants');

      const json = await res.json();
      return json.data;
    },
  });
}

export function useParticipant(id: string) {
  return useQuery({
    queryKey: ['participants', id],
    queryFn: async () => {
      const res = await fetch(`/api/participants/${id}`);
      if (!res.ok) throw new Error('Failed to fetch participant');

      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ParticipantFormData) => {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create participant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}

export function useUpdateParticipant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ParticipantFormData>) => {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update participant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete participant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}
```

---

## Part 5: List Page

**File:** `app/(dashboard)/participants/page.tsx`

Build list page with:
- PageHeader with "Add New Participant" button
- Filter toolbar (Status, Service Support, Search)
- DataTable with columns: Name, NDIS Number, Status, Service Type, Contact, Region, Actions
- Pagination
- Empty state when no data

---

## Part 6: Add Participant Sheet

**File:** `components/participants/add-participant-sheet.tsx`

Multi-step form with sections:
1. Personal Details (name, gender, DOB)
2. Contact (email, phone, address)
3. NDIS Details (number, service support, status)
4. Region Assignment

---

## Part 7: Participant Profile

**File:** `app/(dashboard)/participants/[id]/page.tsx`

Profile with tabs:
- Overview (Quick Snapshot - like Vertex360)
- NDIS Plans
- Documents
- Notes
- Service Agreements

---

## Success Criteria

- [ ] Database models created and migrated
- [ ] API routes handle CRUD operations
- [ ] List page displays participants filtered by region
- [ ] Add New Participant form validates and creates records
- [ ] Profile page displays participant details
- [ ] All operations respect region filter
- [ ] pnpm build passes

---

## Implementation Order

1. Database schema + migration
2. Validation schema
3. API routes
4. TanStack Query hooks
5. List page
6. Add Participant Sheet
7. Profile page with tabs

---

## Notes

- Based on Vertex360 reference screenshots
- Follows existing pattern from Phase 1-2
- Region filter automatically applied to queries
- Full CRUD functionality
