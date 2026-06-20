/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { ndisClaimSchema } from '@/lib/validations/cos';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = ndisClaimSchema.partial().parse(body);

    const dataToUpdate: any = { ...validatedData };
    if (validatedData.deliveredFrom) dataToUpdate.deliveredFrom = new Date(validatedData.deliveredFrom);
    if (validatedData.deliveredTo) dataToUpdate.deliveredTo = new Date(validatedData.deliveredTo);

    const claim = await prisma.ndisClaim.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}
