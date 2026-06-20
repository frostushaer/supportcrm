import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { workerTrainingSchema } from '@/lib/validations/hrm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    const items = await db.workerTrainingRecord.findMany({ where: { workerId: resolvedParams.id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) {
    console.error('[TRAINING_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    const body = await req.json();
    const validatedData = workerTrainingSchema.parse(body);
    const item = await db.workerTrainingRecord.create({ data: { ...validatedData, workerId: resolvedParams.id, createdByUserId: session.user.id } });
    return NextResponse.json(item);
  } catch (error) {
    console.error('[TRAINING_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}