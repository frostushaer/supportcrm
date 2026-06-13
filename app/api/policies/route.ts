import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { policySchema } from '@/lib/validations/policies';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/policies - List with search
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    const policies = await db.policy.findMany({
      where: {
        ...(regionId && { regionId }),
        ...(search && {
          OR: [
            { fileName: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        region: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

// POST /api/policies - Create new policy
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = policySchema.parse(body);

    const policy = await db.policy.create({
      data: {
        ...validated,
        uploadedBy: session.user.id,
        uploadedByName: session.user.name,
      },
    });

    return NextResponse.json(
      { success: true, data: policy },
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
      { success: false, error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
