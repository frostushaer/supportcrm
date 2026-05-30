import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { goalSchema } from '@/lib/validations/participants';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const goals = await db.goal.findMany({
      where: { participantId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: goals });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
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
    const validated = goalSchema.parse(body);
    const goal = await db.goal.create({
      data: { ...validated, participantId: id },
    });
    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
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
    const { goalId, ...fields } = body;
    if (!goalId) return NextResponse.json({ error: 'goalId required' }, { status: 400 });
    const validated = goalSchema.partial().parse(fields);
    const goal = await db.goal.update({ where: { id: goalId }, data: validated });
    return NextResponse.json({ success: true, data: goal });
  } catch (err) {
    console.error('[PATCH goals]', err);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
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
    const { goalId } = await req.json();
    if (!goalId) return NextResponse.json({ error: 'goalId required' }, { status: 400 });
    await db.goal.delete({ where: { id: goalId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE goals]', err);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
