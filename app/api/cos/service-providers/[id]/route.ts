/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { externalServiceProviderSchema } from '@/lib/validations/cos';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = externalServiceProviderSchema.partial().parse(body);
    const { regionIds, ...rest } = validatedData;

    const dataToUpdate: any = { ...rest };
    if (regionIds) {
      dataToUpdate.regions = { set: regionIds.map(rId => ({ id: rId })) };
    }

    const provider = await prisma.externalServiceProvider.update({
      where: { id },
      data: dataToUpdate,
      include: { regions: true }
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating service provider:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.externalServiceProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service provider:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
