/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const participantId = searchParams.get('participantId');
    const coordinatorId = searchParams.get('coordinatorId');
    const program = searchParams.get('program') || 'COS';

    const where: any = { program };
    if (participantId && participantId !== 'All') where.participantId = participantId;
    if (coordinatorId && coordinatorId !== 'All') where.cosCoordinatorWorkerId = coordinatorId;
    
    // Filter region indirectly via participant's cosProfile
    if (regionId && regionId !== 'all') {
       where.participant = {
         cosProfile: {
           serviceRegionId: regionId
         }
       };
    }

    const fundings = await prisma.cosFunding.findMany({
      where,
      include: {
        participant: {
          include: { cosProfile: true }
        },
        coordinator: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(fundings);
  } catch (error) {
    console.error('Error fetching funding:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
