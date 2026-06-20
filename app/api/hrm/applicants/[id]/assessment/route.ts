import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { applicantAssessmentSchema } from '@/lib/validations/hrm';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const validatedData = applicantAssessmentSchema.parse(body);

    const applicant = await prisma.applicant.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    // Update Applicant with assessment notes and status
    const updatedApplicant = await prisma.applicant.update({
      where: { id: resolvedParams.id },
      data: {
        status: validatedData.status,
        interviewNotes: validatedData.interviewNotes,
        notes: validatedData.notes,
      },
    });

    // If Hired, create a Worker
    if (validatedData.status === 'Hired') {
      const worker = await prisma.worker.create({
        data: {
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
          phoneNumber: applicant.phoneNumber,
          regionId: applicant.regionId || '', // Depending on data it might be null, but Worker requires a regionId
          status: 'Active',
          role: validatedData.role || 'Support Worker',
          employmentType: validatedData.employmentType,
          salarySlab: validatedData.salarySlab,
          hourlyRate: validatedData.hourlyRate,
        },
      });

      // Optionally create a PrimaryPortalUser if checked
      if (validatedData.createPortalUser) {
        await prisma.primaryPortalUser.create({
          data: {
            workerId: worker.id,
            email: applicant.email,
            role: validatedData.role || 'Support Worker',
            status: 'Active',
            regions: applicant.regionId ? { connect: { id: applicant.regionId } } : undefined,
          },
        });
        
        // Note: Creation of the actual Auth User via NextAuth/auth provider 
        // would go here if we were provisioning external logins (e.g. Supabase, Firebase, Auth0).
      }
    }

    return NextResponse.json(updatedApplicant);
  } catch (error) {
    console.error('Error assessing applicant:', error);
    return NextResponse.json({ error: 'Failed to process assessment' }, { status: 400 });
  }
}
