import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formTemplateSchema } from '@/lib/validations/forms-home-mgt';

import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Prisma.FormTemplateWhereInput = { kind: 'HomeMgt' };

    if (regionId) {
      where.regionId = regionId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const templates = await db.formTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        region: true,
      },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('Failed to fetch home forms:', error);
    return NextResponse.json({ error: 'Failed to fetch home forms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body = formTemplateSchema.parse(json);

    const template = await db.formTemplate.create({
      data: {
        title: body.title,
        category: body.category,
        description: body.description || null,
        status: body.status || 'Draft',
        kind: 'HomeMgt',
        regionId: body.regionId || null,
        createdBy: session.user.id,
        createdByName: session.user.name,
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error('Failed to create home form:', error);
    return NextResponse.json({ error: 'Failed to create home form' }, { status: 500 });
  }
}
