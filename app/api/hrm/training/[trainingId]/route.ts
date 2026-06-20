import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { workerTrainingSchema } from '@/lib/validations/hrm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    const body = await req.json();
    const validatedData = workerTrainingSchema.partial().parse(body);
    const item = await db.workerTrainingRecord.update({ where: { id: resolvedParams.trainingId }, data: { ...validatedData, lastUpdatedByUserId: session.user.id, lastUpdatedAt: new Date() } });
    return NextResponse.json(item);
  } catch (error) {
    console.error('[TRAINING_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ trainingId: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    await db.workerTrainingRecord.delete({ where: { id: resolvedParams.trainingId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TRAINING_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}