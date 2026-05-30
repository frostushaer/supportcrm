# Ask a Question Module - Feature Spec
## Based on Vertex360 Reference

---

## Goal
Build a simple internal Q&A system where staff can ask questions categorized by topic and view all submitted questions in a searchable table.

---

## Routes

- `/ask-a-question` → Main page with question list + "Ask A Question" button

---

## Database Schema

### Add to `prisma/schema.prisma`:

```prisma
model Question {
  id              String    @id @default(cuid())
  name            String    // Submitter name
  subject         String    // Subject of inquiry
  category        String    // Accounting, Compliance, IT, Legal Query, Marketing, Plan Review, etc.
  details         String    @db.Text
  userRole        String?   // Role of submitter (e.g., "SP Admin")
  submittedBy     String    // User ID who submitted
  regionId        String?   // Optional region filter
  
  region          Region?   @relation(fields: [regionId], references: [id])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## UI Components

### 1. Main Page Layout

**File:** `app/(dashboard)/ask-a-question/page.tsx`

**Structure:**
PageHeader
- Title: "Asked Questions"
- Description: "Directory of all questions"
- Action Button: "+ Ask A Question" (opens dialog)
- Region Selector dropdown

Filters Row:
- Search input (right-aligned)

Data Table:
- Columns: Category, Subject, Submitted By, User Role, Details, Action
- Action column: Eye icon (opens Question Information dialog)
- Sortable by Category (↕ icon)

Empty State:
- Message: "Ask Vertex360 SME your first question!"
- Red text, centered

Pagination:
- "Showing X to Y of Z results"
- Page numbers with arrows


---

### 2. Ask A Question Dialog

**File:** `components/ask-a-question/ask-question-dialog.tsx`

**Trigger:** Click "+ Ask A Question" button

**Dialog Structure:**

Header: "Ask a Question" (blue background)
Close button (X)

Form Fields:
1. Enter your Name * (text input)
- Pre-filled with current user's name

2. Subject of Inquiry * (text input)

3. Relevant Category * (dropdown)
Options:
- Accounting
- Compliance
- IT
- Legal Query
- Marketing
- Plan Review
- [Add more as needed]

4. Details of Inquiry (textarea)
- Multi-line text area
- No character limit shown

Submit button (blue, bottom-right)
Header: "Question Information" (blue background)
Close button (X)

Title: "Detailed question from [Name]"

Read-only fields (label-value pairs):
- Name: [Submitter name]
- Subject of Inquiry: [Subject]
- Category: [Category]
- Detail of Inquiry: [Details text]

Close button (red/pink, bottom-right)

---

## Implementation Steps

### Step 1: Database Schema
```bash
# Add Question model to prisma/schema.prisma
# Run migration
pnpm prisma migrate dev --name add-questions
pnpm prisma generate
```

---

### Step 2: Validation Schema

**File:** `lib/validations/questions.ts`

```typescript
import { z } from 'zod';

export const questionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  details: z.string().min(1, 'Details are required'),
  userRole: z.string().optional(),
  regionId: z.string().optional(),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
```

---

### Step 3: API Routes

**File:** `app/api/questions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questionSchema } from '@/lib/validations/questions';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/questions - List with search
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    const questions = await db.question.findMany({
      where: {
        ...(regionId && { regionId }),
        ...(search && {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { details: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        region: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create new question
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = questionSchema.parse(body);

    const question = await db.question.create({
      data: {
        ...validated,
        submittedBy: session.user.id,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(
      { success: true, data: question },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/questions/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET single question
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const question = await db.question.findUnique({
      where: { id },
      include: {
        region: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}
```

---

### Step 4: TanStack Query Hooks

**File:** `hooks/use-questions.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/store/region-store';
import type { QuestionFormData } from '@/lib/validations/questions';

export function useQuestions(search?: string) {
  const { selectedRegionId } = useRegionStore();

  return useQuery({
    queryKey: ['questions', selectedRegionId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedRegionId) params.set('regionId', selectedRegionId);
      if (search) params.set('search', search);

      const res = await fetch(`/api/questions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch questions');

      const json = await res.json();
      return json.data;
    },
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const res = await fetch(`/api/questions/${id}`);
      if (!res.ok) throw new Error('Failed to fetch question');

      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
```

---

### Step 5: Main Page

**File:** `app/(dashboard)/ask-a-question/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { AskQuestionDialog } from '@/components/ask-a-question/ask-question-dialog';
import { QuestionInfoDialog } from '@/components/ask-a-question/question-info-dialog';
import { useQuestions } from '@/hooks/use-questions';
import { useRegionStore } from '@/store/region-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AskQuestionPage() {
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const { selectedRegionId, setSelectedRegionId } = useRegionStore();
  const { data: questions, isLoading } = useQuestions(search);

  const columns = [
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
    },
    {
      header: 'Submitted By',
      accessorKey: 'name',
    },
    {
      header: 'User Role',
      accessorKey: 'userRole',
      cell: (row: any) => row.userRole || '-',
    },
    {
      header: 'Details',
      accessorKey: 'details',
      cell: (row: any) => (
        <span className="truncate max-w-[300px] block">
          {row.details}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (row: any) => (
        <button
          onClick={() => setSelectedQuestionId(row.id)}
          className="text-[var(--color-warning)] hover:text-[var(--color-warning-hover)]"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Asked Questions"
          description="Directory of all questions"
          action={
            <div className="flex items-center gap-4">
              <Select
                value={selectedRegionId || 'all'}
                onValueChange={(value) =>
                  setSelectedRegionId(value === 'all' ? null : value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="region-1">Brisbane</SelectItem>
                  <SelectItem value="region-2">Sydney</SelectItem>
                  <SelectItem value="region-3">Melbourne</SelectItem>
                  <SelectItem value="region-4">Perth</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setIsAskDialogOpen(true)}>
                + Ask A Question
              </Button>
            </div>
          }
        />

        <div className="flex items-center justify-end">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : questions && questions.length > 0 ? (
          <DataTable
            columns={columns}
            data={questions}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--color-error)] text-lg">
              Ask Vertex360 SME your first question!
            </p>
          </div>
        )}
      </div>

      <AskQuestionDialog
        open={isAskDialogOpen}
        onOpenChange={setIsAskDialogOpen}
      />

      {selectedQuestionId && (
        <QuestionInfoDialog
          questionId={selectedQuestionId}
          open={!!selectedQuestionId}
          onOpenChange={(open) => {
            if (!open) setSelectedQuestionId(null);
          }}
        />
      )}
    </>
  );
}
```

---

### Step 6: Ask Question Dialog Component

**File:** `components/ask-a-question/ask-question-dialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, type QuestionFormData } from '@/lib/validations/questions';
import { useCreateQuestion } from '@/hooks/use-questions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Accounting',
  'Compliance',
  'IT',
  'Legal Query',
  'Marketing',
  'Plan Review',
  'Operations',
  'HR',
  'Finance',
];

interface AskQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskQuestionDialog({ open, onOpenChange }: AskQuestionDialogProps) {
  const { data: session } = useSession();
  const createQuestion = useCreateQuestion();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      await createQuestion.mutateAsync(data);
      toast.success('Question submitted successfully!');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit question');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Please ask your question here
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter your Name <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="Rishi kumar"
              />
              {errors.name && (
                <p className="text-sm text-[var(--color-error)] mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subject of Inquiry <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                {...register('subject')}
                placeholder="test"
              />
              {errors.subject && (
                <p className="text-sm text-[var(--color-error)] mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Relevant Category <span className="text-[var(--color-error)]">*</span>
            </label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Please select the category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Details of Inquiry
            </label>
            <Textarea
              {...register('details')}
              placeholder="test"
              rows={6}
            />
            {errors.details && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.details.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Step 7: Question Info Dialog Component

**File:** `components/ask-a-question/question-info-dialog.tsx`

```typescript
'use client';

import { useQuestion } from '@/hooks/use-questions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QuestionInfoDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionInfoDialog({
  questionId,
  open,
  onOpenChange,
}: QuestionInfoDialogProps) {
  const { data: question, isLoading } = useQuestion(questionId);

  if (isLoading || !question) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Question Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Detailed question from {question.name}
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Name</span>
              <span className="col-span-2 text-sm">{question.name}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Subject of Inquiry</span>
              <span className="col-span-2 text-sm">{question.subject}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Category</span>
              <span className="col-span-2 text-sm">{question.category}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-sm font-medium">Detail of Inquiry</span>
              <span className="col-span-2 text-sm whitespace-pre-wrap">
                {question.details}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Success Criteria

- [ ] Question model added to database
- [ ] Migration runs successfully
- [ ] Ask A Question dialog opens and validates
- [ ] Questions can be submitted successfully
- [ ] Questions list displays all submitted questions
- [ ] Search filters questions correctly
- [ ] Region filter works
- [ ] Eye icon opens Question Information dialog
- [ ] Question details display correctly
- [ ] Empty state shows when no questions exist
- [ ] pnpm build passes with 0 errors

---

## Notes

- Simple module with read-only question viewing
- No reply/answer functionality (can be added in Phase 2)
- Region filter is optional (questions can be global or regional)
- User role auto-populated from session
- Categories are hardcoded (can be made configurable later)