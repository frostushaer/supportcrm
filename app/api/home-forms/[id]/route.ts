import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formTemplateSchema } from '@/lib/validations/forms-home-mgt';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    const template = await db.formTemplate.findUnique({
      where: { id: resolvedParams.id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            subSections: {
              orderBy: { order: 'asc' },
              include: {
                fields: {
                  orderBy: { order: 'asc' },
                },
              },
            },
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error('Failed to fetch home form:', error);
    return NextResponse.json({ error: 'Failed to fetch home form' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const json = await request.json();
    const body = formTemplateSchema.parse(json);

    await db.$transaction(async (tx) => {
      // Delete existing sections to easily recreate entire nested structure
      await tx.formSection.deleteMany({
        where: { formTemplateId: resolvedParams.id },
      });

      await tx.formTemplate.update({
        where: { id: resolvedParams.id },
        data: {
          title: body.title,
          category: body.category,
          description: body.description || null,
          status: body.status || 'Draft',
          regionId: body.regionId || null,
        },
      });

      if (body.sections && body.sections.length > 0) {
        for (let sIdx = 0; sIdx < body.sections.length; sIdx++) {
          const sec = body.sections[sIdx];
          
          const createdSection = await tx.formSection.create({
            data: {
              formTemplateId: resolvedParams.id,
              title: sec.title,
              order: sIdx,
            },
          });

          if (sec.fields && sec.fields.length > 0) {
            for (let fIdx = 0; fIdx < sec.fields.length; fIdx++) {
              const f = sec.fields[fIdx];
              await tx.formField.create({
                data: {
                  formSectionId: createdSection.id,
                  label: f.label,
                  type: f.type,
                  required: f.required || false,
                  fullWidth: f.fullWidth || false,
                  addedInSupportPlan: f.addedInSupportPlan || false,
                  dependentOnFieldId: f.dependentOnFieldId || null,
                  hint: f.hint || null,
                  legalReference: f.legalReference || null,
                  order: fIdx,
                },
              });
            }
          }

          if (sec.subSections && sec.subSections.length > 0) {
            for (let subIdx = 0; subIdx < sec.subSections.length; subIdx++) {
              const sub = sec.subSections[subIdx];
              const createdSubSection = await tx.formSubSection.create({
                data: {
                  formSectionId: createdSection.id,
                  title: sub.title,
                  order: subIdx,
                  addOther: sub.addOther || false,
                },
              });

              if (sub.fields && sub.fields.length > 0) {
                for (let sfIdx = 0; sfIdx < sub.fields.length; sfIdx++) {
                  const sf = sub.fields[sfIdx];
                  await tx.formField.create({
                    data: {
                      formSubSectionId: createdSubSection.id,
                      label: sf.label,
                      type: sf.type,
                      required: sf.required || false,
                      fullWidth: sf.fullWidth || false,
                      addedInSupportPlan: sf.addedInSupportPlan || false,
                      dependentOnFieldId: sf.dependentOnFieldId || null,
                      hint: sf.hint || null,
                      legalReference: sf.legalReference || null,
                      order: sfIdx,
                    },
                  });
                }
              }
            }
          }
        }
      }
    });

    const updatedTemplate = await db.formTemplate.findUnique({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ data: updatedTemplate });
  } catch (error) {
    console.error('Failed to update home form:', error);
    return NextResponse.json({ error: 'Failed to update home form' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    await db.formTemplate.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete home form:', error);
    return NextResponse.json({ error: 'Failed to delete home form' }, { status: 500 });
  }
}
