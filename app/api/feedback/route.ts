import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feedbackSchema } from '@/lib/validations/feedback';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/feedback - List with search
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

    const feedbacks = await db.feedback.findMany({
      where: {
        ...(regionId && { regionId }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { details: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        region: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST /api/feedback - Create new feedback
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = feedbackSchema.parse(body);

    const feedback = await db.feedback.create({
      data: {
        ...validated,
        submittedBy: session.user.id,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(
      { success: true, data: feedback },
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
      { success: false, error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}
