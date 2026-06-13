import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formTemplateSchema } from '@/lib/validations/forms-home-mgt';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Prisma.FormTemplateWhereInput = { kind: 'CRM' };

    if (regionId) {
      where.regionId = regionId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const templates = await db.formTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: templates });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const result = formTemplateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;

    const template = await db.formTemplate.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        status: data.status || 'Draft',
        kind: 'CRM',
        regionId: data.regionId || session.user.regionId,
        createdBy: session.user.id,
        createdByName: session.user.name,
        sections: {
          create: data.sections?.map((sec, sIdx) => ({
            title: sec.title,
            order: sIdx,
            fields: {
              create: sec.fields?.map((f, fIdx) => ({
                label: f.label,
                type: f.type,
                required: f.required || false,
                fullWidth: f.fullWidth || false,
                addedInSupportPlan: f.addedInSupportPlan || false,
                dependentOnFieldId: f.dependentOnFieldId,
                hint: f.hint,
                legalReference: f.legalReference,
                order: fIdx,
              })) || [],
            },
            subSections: {
              create: sec.subSections?.map((sub, subIdx) => ({
                title: sub.title,
                order: subIdx,
                addOther: sub.addOther || false,
                fields: {
                  create: sub.fields?.map((sf, sfIdx) => ({
                    label: sf.label,
                    type: sf.type,
                    required: sf.required || false,
                    fullWidth: sf.fullWidth || false,
                    addedInSupportPlan: sf.addedInSupportPlan || false,
                    dependentOnFieldId: sf.dependentOnFieldId,
                    hint: sf.hint,
                    legalReference: sf.legalReference,
                    order: sfIdx,
                  })) || [],
                },
              })) || [],
            },
          })) || [],
        },
      },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
  }
}
