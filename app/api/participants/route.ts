import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const participants = await db.participant.findMany({
      where: {
        ...(regionId ? { regionId } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { ndisNumber: { contains: search } },
              ],
            }
          : {}),
      },
      include: { region: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: participants });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = participantSchema.parse(body);

    const participant = await db.participant.create({
      data: {
        ...validated,
        dateOfBirth: new Date(validated.dateOfBirth),
      },
    });

    return NextResponse.json({ success: true, data: participant }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}
