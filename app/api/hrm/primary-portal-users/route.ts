/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { primaryPortalUserSchema } from '@/lib/validations/hrm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');

    const where: any = {};
    if (regionId && regionId !== 'all') {
      where.regions = { some: { id: regionId } };
    }
    if (status && status !== 'All') {
      where.status = status;
    }

    const items = await db.primaryPortalUser.findMany({
      where,
      include: { worker: true, regions: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('[PORTAL_USERS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const validatedData = primaryPortalUserSchema.parse(body);

    const item = await db.primaryPortalUser.create({
      data: {
        workerId: validatedData.workerId,
        email: validatedData.email,
        role: validatedData.role,
        status: validatedData.status,
        regions: { connect: (validatedData.regionIds || []).map(id => ({ id })) }
      },
      include: { worker: true, regions: true }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('[PORTAL_USERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}