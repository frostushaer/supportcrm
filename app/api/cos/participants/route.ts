/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');
    const managementStyle = searchParams.get('managementStyle');
    const activeStatus = searchParams.get('activeStatus');
    const program = searchParams.get('program') || 'COS';

    const where: any = {};
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { ndisNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (activeStatus && activeStatus !== 'All') {
      where.status = activeStatus;
    }

    const participants = await prisma.participant.findMany({
      where: {
        ...where,
        cosProfile: { program },
      },
      include: {
        region: true,
        cosProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (managementStyle && managementStyle !== 'All' && managementStyle !== 'Both') {
      return NextResponse.json(participants.filter(p => p.cosProfile?.managementStyle === managementStyle));
    }

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching cos participants:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
