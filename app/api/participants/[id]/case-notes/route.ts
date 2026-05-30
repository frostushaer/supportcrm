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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { date: _date, nonDirectSupport: _nds, ...rest } = validated;
    const note = await db.caseNote.create({
      data: {
        ...rest,
        participantId: id,
        createdBy: session.user?.name ?? 'Unknown',
        date: validated.date ? new Date(validated.date) : new Date(),
      },
    });
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (err) {
    console.error('[POST case-notes]', err);
    return NextResponse.json({ error: 'Failed to create case note', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await params;
    const body = await req.json();
    const { noteId, ...fields } = body;
    if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 });
    const validated = caseNoteSchema.partial().parse(fields);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { date: _date, nonDirectSupport: _nds, ...rest } = validated;
    const note = await db.caseNote.update({
      where: { id: noteId },
      data: {
        ...rest,
        ...(validated.date ? { date: new Date(validated.date) } : {}),
      },
    });
    return NextResponse.json({ success: true, data: note });
  } catch (err) {
    console.error('[PATCH case-notes]', err);
    return NextResponse.json({ error: 'Failed to update case note', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await params;
    const { noteId } = await req.json();
    if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 });
    await db.caseNote.delete({ where: { id: noteId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE case-notes]', err);
    return NextResponse.json({ error: 'Failed to delete case note', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
