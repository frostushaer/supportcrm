import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Global singleton mock store — survives Next.js hot reloads
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = global as typeof global & { __mockParticipants?: any[] };
if (!g.__mockParticipants) {
  g.__mockParticipants = [
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      ndisNumber: 'NDIS-2024-001',
      status: 'Active',
      serviceSupport: 'Core',
      primaryEmailAddress: 'jane.smith@example.com',
      primaryPhoneNumber: '0412345678',
      secondaryPhoneNumber: null,
      gender: 'Female',
      dateOfBirth: '1990-05-15',
      address: '123 Main St',
      suburb: 'Melbourne',
      state: 'Victoria',
      postcode: '3000',
      auditParticipation: true,
      regionId: 'region_1',
      region: { id: 'region_1', name: 'Melbourne' },
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: '2',
      firstName: 'Mark',
      lastName: 'Johnson',
      ndisNumber: 'NDIS-2024-002',
      status: 'Pending',
      serviceSupport: 'Capacity Building',
      primaryEmailAddress: 'mark.j@example.com',
      primaryPhoneNumber: '0423456789',
      secondaryPhoneNumber: null,
      gender: 'Male',
      dateOfBirth: '1985-08-20',
      address: '456 High St',
      suburb: 'Sydney',
      state: 'New South Wales',
      postcode: '2000',
      auditParticipation: false,
      regionId: 'region_2',
      region: { id: 'region_2', name: 'Sydney' },
      createdAt: new Date('2024-02-20').toISOString(),
    },
  ];
}
const mockParticipants = g.__mockParticipants;

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

    let participants;
    try {
      participants = await db.participant.findMany({
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
    } catch (dbError) {
      // Return mock data if database is not available
      participants = mockParticipants;
    }

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

    let participant;
    try {
      participant = await db.participant.create({
        data: {
          ...validated,
          dateOfBirth: new Date(validated.dateOfBirth),
        },
      });
    } catch (dbError) {
      // Add to mock data if database is not available
      participant = {
        id: `mock-${Date.now()}`,
        ...validated,
        region: { id: validated.regionId, name: 'Melbourne' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockParticipants.unshift(participant as typeof mockParticipants[0]);
    }

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
