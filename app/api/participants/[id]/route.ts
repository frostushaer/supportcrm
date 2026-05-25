import { NextRequest, NextResponse } from 'next/server';
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
        ndisPlans: true,
        documents: true,
        notes: true,
        serviceAgreements: true,
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
  } catch {
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
