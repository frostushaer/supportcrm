import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { caseNoteSchema } from '@/lib/validations/participants';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const notes = await db.caseNote.findMany({
      where: { participantId: id },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: notes });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch case notes' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const validated = caseNoteSchema.parse(body);
    const note = await db.caseNote.create({
      data: {
        ...validated,
        participantId: id,
        createdBy: session.user?.name ?? 'Unknown',
        date: validated.date ? new Date(validated.date) : new Date(),
      },
    });
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create case note' }, { status: 500 });
  }
}
