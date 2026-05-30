import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const assessment = await db.initialAssessment.findUnique({
    where: { participantId: id },
  });
  return NextResponse.json(assessment ?? {});
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await req.json();

  const assessment = await db.initialAssessment.upsert({
    where: { participantId: id },
    create: { participantId: id, ...body },
    update: { ...body },
  });
  return NextResponse.json(assessment);
}
