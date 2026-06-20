import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { timesheetIds, createdById, createdByName } = await request.json();

    if (!timesheetIds || timesheetIds.length === 0) {
      return NextResponse.json({ error: "No timesheets selected" }, { status: 400 });
    }

    const timesheets = await prisma.timesheet.findMany({
      where: { id: { in: timesheetIds } },
      include: {
        shift: {
          include: { participant: true, worker: true },
        },
      },
    });

    if (timesheets.length === 0) {
      return NextResponse.json({ error: "Timesheets not found" }, { status: 404 });
    }

    // Group timesheets by participant and region
    // Assuming we want to generate one invoice per participant
    const participantGroups: Record<string, typeof timesheets> = {};

    for (const ts of timesheets) {
      const pId = ts.shift.participantId;
      if (!pId) continue; // Skip if no participant
      if (!participantGroups[pId]) {
        participantGroups[pId] = [];
      }
      participantGroups[pId].push(ts);
    }

    const generatedInvoices = [];

    // Create an invoice for each participant group
    for (const [participantId, participantTimesheets] of Object.entries(participantGroups)) {
      const participant = participantTimesheets[0].shift.participant;
      const regionId = participantTimesheets[0].shift.regionId;

      const totalValue = participantTimesheets.reduce((acc, ts) => acc + (ts.totalAmount || 0), 0);
      const numDelivered = participantTimesheets.length;
      
      const dates = participantTimesheets.map(ts => ts.shift.startDateTime.getTime());
      const serviceDeliveredFrom = new Date(Math.min(...dates));
      const serviceDeliveredTo = new Date(Math.max(...dates));

      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${participant?.firstName?.slice(0, 2).toUpperCase() || 'UNK'}`;

      // In a transaction, create Invoice, InvoiceLines, and update Timesheets
      const result = await prisma.$transaction(async (tx) => {
        const newInvoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            participantId,
            participantName: `${participant?.firstName || ''} ${participant?.lastName || ''}`.trim() || 'Unknown',
            createdById,
            createdByName,
            serviceDeliveredFrom,
            serviceDeliveredTo,
            status: "Draft",
            numDelivered,
            totalValue,
            regionId,
          },
        });

        // Create InvoiceLines and update Timesheets
        for (const ts of participantTimesheets) {
          await tx.invoiceLine.create({
            data: {
              invoiceId: newInvoice.id,
              timesheetId: ts.id,
              workerId: ts.shift.workerId,
              workerName: `${ts.shift.worker.firstName} ${ts.shift.worker.lastName}`,
              participantId,
              participantName: `${participant?.firstName || ''} ${participant?.lastName || ''}`.trim() || 'Unknown',
              deliveredDate: ts.shift.startDateTime,
              typeOfService: ts.shift.supportItem,
              supportItemCode: ts.supportItemCode,
              quantity: ts.quantity || 0,
              unitPrice: ts.unitPrice || 0,
              totalAmount: ts.totalAmount || 0,
              fundingSource: ts.fundingSource,
            },
          });

          await tx.timesheet.update({
            where: { id: ts.id },
            data: {
              billingStatus: "Invoiced",
              invoiceId: newInvoice.id,
            },
          });
        }

        return newInvoice;
      });

      generatedInvoices.push(result);
    }

    return NextResponse.json({ success: true, invoices: generatedInvoices });
  } catch (error) {
    console.error("Error generating invoices:", error);
    return NextResponse.json(
      { error: "Failed to generate invoices" },
      { status: 500 }
    );
  }
}
