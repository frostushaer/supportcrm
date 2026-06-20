/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cosInvoiceSchema } from '@/lib/validations/cos';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = cosInvoiceSchema.partial().parse(body);

    const dataToUpdate: any = { ...validatedData };
    if (validatedData.serviceDeliveredFrom) dataToUpdate.serviceDeliveredFrom = new Date(validatedData.serviceDeliveredFrom);
    if (validatedData.serviceDeliveredTo) dataToUpdate.serviceDeliveredTo = new Date(validatedData.serviceDeliveredTo);

    const invoice = await prisma.cosInvoice.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}
