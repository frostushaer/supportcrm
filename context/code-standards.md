# Code Standards

Consistency is critical for AI-assisted development. Follow these rules for all code in **SupportCRM**.

---

## File Organisation

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `ParticipantList.tsx`, `AddWorkerSheet.tsx` |
| **Hooks** | camelCase with `use` prefix | `useParticipants.ts`, `useRegionStore.ts` |
| **Utils** | camelCase | `formatDate.ts`, `calculateHours.ts` |
| **API Routes** | kebab-case folders | `app/api/participants/route.ts` |
| **Pages** | kebab-case folders | `app/(dashboard)/participants/page.tsx` |
| **Types** | PascalCase | `ParticipantSchema`, `WorkerFormData` |

### Import Order

```typescript
// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

// 3. UI components (shadcn)
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// 4. Shared components
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';

// 5. Hooks
import { useParticipants } from '@/hooks/use-participants';

// 6. Stores
import { useRegionStore } from '@/store/region-store';

// 7. Utils & types
import { participantSchema } from '@/lib/validations/participants';
import type { Participant } from '@prisma/client';
```

---

## TypeScript Rules

### Type Annotations

```typescript
// ✅ GOOD - Explicit return types for functions
export function calculateTotalHours(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return diff / (1000 * 60 * 60);
}

// ❌ BAD - No return type
export function calculateTotalHours(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

// ✅ GOOD - Type inference for simple variables
const totalHours = 8.5;
const isApproved = true;

// ❌ BAD - Unnecessary type annotation
const totalHours: number = 8.5;
```

### Interface vs Type

- Use **interface** for component props and object shapes.
- Use **type** for unions, intersections, and utility types.

```typescript
// ✅ Interface for props
interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
}

// ✅ Type for unions
type Status = 'active' | 'inactive' | 'on-leave';

// ✅ Type for utility types
type PartialParticipant = Partial<Participant>;
```

### Null vs Undefined

- Use **optional properties** (`?`) for fields that may not exist.
- Use **`null`** for fields that explicitly have no value.

```typescript
interface Worker {
  id: string;
  policeCheckExpiry?: Date;  // May not exist
  approvedBy: string | null; // Explicitly empty
}
```

---

## React Component Patterns

### Server vs Client Components

- **Default to Server Components** (no `'use client'`).
- Use `'use client'` only when you need:
  - State (`useState`, `useReducer`)
  - Effects (`useEffect`, `useLayoutEffect`)
  - Event handlers (`onClick`, `onChange`)
  - Browser APIs (`window`, `localStorage`)

```typescript
// ✅ Server Component (default)
export default async function ParticipantsPage() {
  const participants = await db.participant.findMany();
  return <ParticipantList data={participants} />;
}

// ✅ Client Component (interactive)
'use client';

export function AddParticipantSheet() {
  const [open, setOpen] = useState(false);
  // ... form logic
}
```

### Component Structure

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 1. Types & Interfaces
interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
}

// 2. Component
export function ParticipantCard({ participant, onEdit }: ParticipantCardProps) {
  // 2a. Hooks (state, queries, stores)
  const [isLoading, setIsLoading] = useState(false);

  // 2b. Derived state & calculations
  const fullName = `${participant.firstName} ${participant.lastName}`;

  // 2c. Event handlers
  const handleEdit = () => {
    setIsLoading(true);
    onEdit();
  };

  // 2d. Early returns
  if (!participant) return null;

  // 2e. Main render
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="font-medium text-[var(--color-text)]">{fullName}</h3>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  );
}
```

---

## Styling Rules

### Token Variables (MANDATORY)

**NEVER use raw hex codes or Tailwind colour shortcuts.**

```typescript
// ✅ GOOD - Token variables
<div className="bg-[var(--color-bg)] text-[var(--color-text)]">

// ❌ BAD - Raw hex
<div className="bg-[#f4f6f9] text-[#111827]">

// ❌ BAD - Tailwind shortcuts
<div className="bg-gray-100 text-gray-900">
```

### Responsive Design

```typescript
// ✅ Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Use breakpoints: sm: md: lg: xl: 2xl:
```

### Conditional Classes

```typescript
import { cn } from '@/lib/utils';

// ✅ Use cn() utility
<Button 
  className={cn(
    "rounded-lg",
    isActive && "bg-[var(--color-primary)]",
    isDisabled && "opacity-50"
  )}
>
```

---

## Form Handling

### react-hook-form + Zod

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define Zod schema
const participantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  ndisNumber: z.string().length(9, 'NDIS number must be 9 digits'),
  dateOfBirth: z.date(),
});

type ParticipantFormData = z.infer<typeof participantSchema>;

// 2. Component
export function AddParticipantForm() {
  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      firstName: '',
    },
  });

  const onSubmit = async (data: ParticipantFormData) => {
    // API call
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## API Route Standards

### Route Handler Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';

// GET /api/participants
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');

    const participants = await db.participant.findMany({
      where: {
        regionId: regionId || undefined,
        status: status || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      success: true, 
      data: participants 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

// POST /api/participants
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validated = participantSchema.parse(body);

    const participant = await db.participant.create({
      data: validated,
    });

    return NextResponse.json({ 
      success: true, 
      data: participant 
    }, { status: 201 });
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

---

## TanStack Query Patterns

### Hook Template

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useParticipants(regionId?: string) {
  return useQuery({
    queryKey: ['participants', regionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (regionId) params.set('regionId', regionId);

      const res = await fetch(`/api/participants?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const json = await res.json();
      return json.data;
    },
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

      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
}
```

---

## Error Handling

### Client-Side

```typescript
import { toast } from 'sonner';

const { mutate, isPending } = useCreateParticipant();

const handleSubmit = (data: ParticipantFormData) => {
  mutate(data, {
    onSuccess: () => {
      toast.success('Participant created');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
```

### Server-Side

```typescript
try {
  // Operation
} catch (error) {
  console.error('[API Error]:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Comments & Documentation

### When to Comment

- **Complex business logic** (e.g., NDIS invoice calculations)
- **Workarounds** for library bugs
- **Non-obvious optimizations**

### When NOT to Comment

- Self-explanatory code
- Function/variable names that are already descriptive

```typescript
// ❌ BAD - Obvious comment
// Get participants
const participants = await db.participant.findMany();

// ✅ GOOD - Explains non-obvious logic
// NDIS invoicing requires approved timesheets from last 14 days
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 14);
```

---

## Testing (Future Phase)

Phase 1 focuses on **manual testing**. Automated tests will be added in Phase 2.

---

## Git Commit Messages

```
feat(participants): add participant creation form
fix(rostering): correct timesheet calculation logic
refactor(api): extract validation to middleware
docs(context): update progress tracker
```

---

## Performance Best Practices

1. **Avoid unnecessary re-renders** → use `useMemo`, `useCallback` sparingly.
2. **Optimize images** → use Next.js `<Image>` component.
3. **Lazy load** → use `dynamic()` for heavy components.
4. **Database queries** → use `select` to fetch only required fields.

```typescript
// ✅ GOOD - Select only needed fields
const participants = await db.participant.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    status: true,
  },
});

// ❌ BAD - Fetch all fields
const participants = await db.participant.findMany();
```
