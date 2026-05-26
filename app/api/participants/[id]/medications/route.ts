import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { medicationSchema } from '@/lib/validations/participants';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const meds = await db.medication.findMany({
      where: { participantId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: meds });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
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
    const validated = medicationSchema.parse(body);
    const med = await db.medication.create({
      data: {
        ...validated,
        participantId: id,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    });
    return NextResponse.json({ success: true, data: med }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}
