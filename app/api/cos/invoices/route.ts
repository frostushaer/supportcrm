/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cosInvoiceSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const invoiceType = searchParams.get('invoiceType');
    const participantId = searchParams.get('participantId');
    const program = searchParams.get('program') || 'COS';

    const where: any = { program };
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (invoiceType && invoiceType !== 'All') where.invoiceType = invoiceType;
    if (participantId && participantId !== 'All') where.participantId = participantId;

    const invoices = await prisma.cosInvoice.findMany({
      where,
      include: { participant: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = cosInvoiceSchema.parse(body);

    const invoice = await prisma.cosInvoice.create({
      data: {
        ...validatedData,
        serviceDeliveredFrom: new Date(validatedData.serviceDeliveredFrom),
        serviceDeliveredTo: new Date(validatedData.serviceDeliveredTo)
      }
    });

    // Mark case notes as invoiced
    if (invoice.caseNoteIds && invoice.caseNoteIds.length > 0) {
      await prisma.cosCaseNote.updateMany({
        where: { id: { in: invoice.caseNoteIds } },
        data: { status: 'Invoiced' }
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
