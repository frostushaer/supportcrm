/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cosCaseNoteSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const participantId = searchParams.get('participantId');
    const noteContactType = searchParams.get('noteContactType');
    const deliveredFrom = searchParams.get('deliveredFrom');
    const deliveredTo = searchParams.get('deliveredTo');
    const program = searchParams.get('program') || 'COS';

    const where: any = { program };
    if (regionId && regionId !== 'all') where.serviceRegionId = regionId;
    if (participantId && participantId !== 'All') where.participantId = participantId;
    if (noteContactType && noteContactType !== 'All') where.noteContactType = noteContactType;
    if (deliveredFrom && deliveredTo) {
      where.deliveredDate = {
        gte: new Date(deliveredFrom),
        lte: new Date(deliveredTo),
      };
    }

    const caseNotes = await prisma.cosCaseNote.findMany({
      where,
      include: {
        participant: true,
        funding: true,
        serviceRegion: true,
        supportCoordinator: true,
      },
      orderBy: { deliveredDate: 'desc' },
    });

    return NextResponse.json(caseNotes);
  } catch (error) {
    console.error('Error fetching case notes:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = cosCaseNoteSchema.parse(body);

    const dataToCreate: any = {
      participantId: validatedData.participantId,
      serviceRegionId: validatedData.serviceRegionId,
      supportCoordinatorId: validatedData.supportCoordinatorId,
      deliveredDate: new Date(validatedData.deliveredDate),
      durationMinutes: validatedData.durationMinutes,
      kilometres: validatedData.kilometres,
      amount: validatedData.amount,
      noteContactType: validatedData.noteContactType,
      caseNoteText: validatedData.caseNoteText,
      status: validatedData.status,
      program: validatedData.program,
      createdByUserId: validatedData.createdByUserId,
    };
    if (validatedData.fundingId) {
       dataToCreate.fundingId = validatedData.fundingId;
    }

    const note = await prisma.cosCaseNote.create({
      data: dataToCreate
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating case note:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
