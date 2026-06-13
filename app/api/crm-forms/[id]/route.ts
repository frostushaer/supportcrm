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

    const { id } = await params;

    const template = await db.formTemplate.findUnique({
      where: { id, kind: 'CRM' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            subSections: {
              orderBy: { order: 'asc' },
              include: { fields: { orderBy: { order: 'asc' } } },
            },
            fields: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ data: template });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
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

    const { id } = await params;
    const json = await request.json();
    const result = formTemplateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;

    await db.$transaction(async (tx) => {
      await tx.formTemplate.update({
        where: { id, kind: 'CRM' },
        data: {
          title: data.title,
          category: data.category,
          description: data.description,
          status: data.status,
          kind: 'CRM', 
        },
      });

      if (data.sections) {
        await tx.formSection.deleteMany({ where: { formTemplateId: id } });

        for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
          const sec = data.sections[sIdx];
          const createdSec = await tx.formSection.create({
            data: {
              formTemplateId: id,
              title: sec.title,
              order: sIdx,
            },
          });

          if (sec.fields) {
            for (let fIdx = 0; fIdx < sec.fields.length; fIdx++) {
              const f = sec.fields[fIdx];
              await tx.formField.create({
                data: {
                  formSectionId: createdSec.id,
                  label: f.label,
                  type: f.type,
                  required: f.required || false,
                  fullWidth: f.fullWidth || false,
                  addedInSupportPlan: f.addedInSupportPlan || false,
                  dependentOnFieldId: f.dependentOnFieldId,
                  hint: f.hint,
                  legalReference: f.legalReference,
                  order: fIdx,
                },
              });
            }
          }

          if (sec.subSections) {
            for (let subIdx = 0; subIdx < sec.subSections.length; subIdx++) {
              const sub = sec.subSections[subIdx];
              const createdSub = await tx.formSubSection.create({
                data: {
                  formSectionId: createdSec.id,
                  title: sub.title,
                  order: subIdx,
                  addOther: sub.addOther || false,
                },
              });

              if (sub.fields) {
                for (let sfIdx = 0; sfIdx < sub.fields.length; sfIdx++) {
                  const sf = sub.fields[sfIdx];
                  await tx.formField.create({
                    data: {
                      formSubSectionId: createdSub.id,
                      label: sf.label,
                      type: sf.type,
                      required: sf.required || false,
                      fullWidth: sf.fullWidth || false,
                      addedInSupportPlan: sf.addedInSupportPlan || false,
                      dependentOnFieldId: sf.dependentOnFieldId,
                      hint: sf.hint,
                      legalReference: sf.legalReference,
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

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
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

    const { id } = await params;

    await db.formTemplate.delete({
      where: { id, kind: 'CRM' },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
