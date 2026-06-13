import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { complaintSchema } from '@/lib/validations/complaints';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/complaints - List with search
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    const complaints = await db.complaint.findMany({
      where: {
        ...(regionId && { regionId }),
        ...(search && {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { details: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        region: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST /api/complaints - Create new complaint
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = complaintSchema.parse(body);

    // Convert date string to DateTime
    const dateValue = new Date(validated.date);

    const complaint = await db.complaint.create({
      data: {
        name: validated.name,
        date: dateValue,
        subject: validated.subject,
        details: validated.details,
        submittedBy: session.user.id,
        userRole: session.user.role,
        regionId: validated.regionId || null,
      },
    });

    return NextResponse.json(
      { success: true, data: complaint },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}
