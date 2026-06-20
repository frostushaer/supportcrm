import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { applicantSchema } from '@/lib/validations/hrm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const applicant = await prisma.applicant.findUnique({
      where: { id: resolvedParams.id },
      include: { region: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return NextResponse.json({ error: 'Failed to fetch applicant' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const validatedData = applicantSchema.partial().parse(body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = { ...validatedData };

    // If there's a status update included here (e.g. from the quick dropdown)
    if (body.status) {
      dataToUpdate.status = body.status;
    }

    const applicant = await prisma.applicant.update({
      where: { id: resolvedParams.id },
      data: dataToUpdate,
    });

    return NextResponse.json(applicant);
  } catch (error) {
    console.error('Error updating applicant:', error);
    return NextResponse.json({ error: 'Failed to update applicant' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.applicant.delete({
      where: { id: resolvedParams.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    return NextResponse.json({ error: 'Failed to delete applicant' }, { status: 500 });
  }
}
