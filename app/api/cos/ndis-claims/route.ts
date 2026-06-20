/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { ndisClaimSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const claimType = searchParams.get('claimType');
    const program = searchParams.get('program') || 'COS';

    const where: any = { program };
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (claimType && claimType !== 'All') where.claimType = claimType;

    const claims = await prisma.ndisClaim.findMany({
      where,
      include: { participant: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = ndisClaimSchema.parse(body);

    const claim = await prisma.ndisClaim.create({
      data: {
        ...validatedData,
        deliveredFrom: new Date(validatedData.deliveredFrom),
        deliveredTo: new Date(validatedData.deliveredTo)
      }
    });

    // Mark case notes as claimed
    if (claim.caseNoteIds && claim.caseNoteIds.length > 0) {
      await prisma.cosCaseNote.updateMany({
        where: { id: { in: claim.caseNoteIds } },
        data: { status: 'Claimed' }
      });
    }

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
