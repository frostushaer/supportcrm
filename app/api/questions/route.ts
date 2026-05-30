import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questionSchema } from '@/lib/validations/questions';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/questions - List with search
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    const questions = await db.question.findMany({
      where: {
        ...(regionId && { regionId }),
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

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create new question
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = questionSchema.parse(body);

    const question = await db.question.create({
      data: {
        ...validated,
        submittedBy: session.user.id,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(
      { success: true, data: question },
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
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
