import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        participant: true,
        invoiceLines: true,
        region: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // Find the invoice and its lines
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { invoiceLines: true },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Revert timesheets back to "Allocated"
      const timesheetIds = invoice.invoiceLines
        .filter((line) => line.timesheetId)
        .map((line) => line.timesheetId as string);

      if (timesheetIds.length > 0) {
        await tx.timesheet.updateMany({
          where: { id: { in: timesheetIds } },
          data: {
            billingStatus: "Allocated",
            invoiceId: null,
          },
        });
      }

      // Delete the invoice (cascade will delete invoice lines)
      const deletedInvoice = await tx.invoice.delete({
        where: { id },
      });

      return deletedInvoice;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
