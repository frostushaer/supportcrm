/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { applicantSchema } from '@/lib/validations/hrm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (status && status !== 'All') where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const applicants = await prisma.applicant.findMany({
      where,
      orderBy: { appliedOn: 'desc' },
      include: { region: true },
    });

    return NextResponse.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = applicantSchema.parse(body);

    const applicant = await prisma.applicant.create({
      data: validatedData,
    });

    return NextResponse.json(applicant, { status: 201 });
  } catch (error) {
    console.error('Error creating applicant:', error);
    return NextResponse.json({ error: 'Failed to create applicant' }, { status: 400 });
  }
}
