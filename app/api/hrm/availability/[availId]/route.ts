import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ availId: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    await db.workerAvailability.delete({ where: { id: resolvedParams.availId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[AVAILABILITY_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}