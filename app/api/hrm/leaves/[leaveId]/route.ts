import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { workerLeaveSchema } from '@/lib/validations/hrm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ leaveId: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    const body = await req.json();
    const validatedData = workerLeaveSchema.partial().parse(body);
    const leave = await db.workerLeave.update({ where: { id: resolvedParams.leaveId }, data: { ...validatedData, updatedByUserId: session.user.id } });
    return NextResponse.json(leave);
  } catch (error) {
    console.error('[LEAVE_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ leaveId: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    await db.workerLeave.delete({ where: { id: resolvedParams.leaveId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[LEAVE_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}