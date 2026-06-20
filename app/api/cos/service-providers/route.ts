/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { externalServiceProviderSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');
    const program = searchParams.get('program') || 'COS';

    const where: any = { program };
    if (regionId && regionId !== 'all') {
      where.regions = { some: { id: regionId } };
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const providers = await prisma.externalServiceProvider.findMany({
      where,
      include: { regions: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching service providers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = externalServiceProviderSchema.parse(body);
    const { regionIds, ...rest } = validatedData;

    const provider = await prisma.externalServiceProvider.create({
      data: {
        ...rest,
        regions: { connect: (regionIds || []).map(id => ({ id })) },
      },
      include: { regions: true }
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error('Error creating service provider:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
