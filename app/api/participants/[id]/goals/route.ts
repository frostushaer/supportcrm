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
