import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const participant = await db.participant.findUnique({
      where: { id },
      include: {
        region: true,
        ndisPlans: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        caseNotes: { orderBy: { date: 'desc' } },
        medications: { orderBy: { createdAt: 'desc' } },
        shiftNotes: { orderBy: { shiftDate: 'desc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { appointmentDate: 'asc' } },
        goals: { orderBy: { createdAt: 'desc' } },
        likes: { orderBy: { createdAt: 'asc' } },
        dislikes: { orderBy: { createdAt: 'asc' } },
        riskAssessments: { orderBy: { createdAt: 'desc' } },
        formSubmissions: { orderBy: { createdAt: 'desc' } },
        fundingAllocations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: participant });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch participant' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = participantSchema.partial().parse(body);

    const participant = await db.participant.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.dateOfBirth
          ? { dateOfBirth: new Date(validated.dateOfBirth) }
          : {}),
      },
    });

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.participant.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
  }
}
