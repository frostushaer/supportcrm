import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { primaryPortalUserSchema } from '@/lib/validations/hrm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    
    if (body.status && Object.keys(body).length === 1) {
      const item = await db.primaryPortalUser.update({
        where: { id: resolvedParams.id },
        data: { status: body.status },
      });
      return NextResponse.json(item);
    }

    const validatedData = primaryPortalUserSchema.partial().parse(body);

    const item = await db.primaryPortalUser.update({
      where: { id: resolvedParams.id },
      data: {
        workerId: validatedData.workerId,
        email: validatedData.email,
        role: validatedData.role,
        status: validatedData.status,
        regions: validatedData.regionIds ? { set: validatedData.regionIds.map(id => ({ id })) } : undefined,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('[PORTAL_USERS_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    await db.primaryPortalUser.delete({ where: { id: resolvedParams.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PORTAL_USERS_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}