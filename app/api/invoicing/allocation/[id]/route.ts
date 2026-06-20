import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      supportItemCode,
      quantity,
      unitPrice,
      totalAmount,
      fundingSource,
    } = body;

    // Check if everything is filled to mark it as Allocated
    const isAllocated = !!(supportItemCode && quantity !== undefined && unitPrice !== undefined);
    const billingStatus = isAllocated ? "Allocated" : "NotReady";

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        supportItemCode,
        quantity: quantity !== undefined ? parseFloat(quantity) : null,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : null,
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : null,
        fundingSource,
        billingStatus,
      },
    });

    return NextResponse.json(updatedTimesheet);
  } catch (error) {
    console.error("Error updating timesheet allocation:", error);
    return NextResponse.json(
      { error: "Failed to update allocation" },
      { status: 500 }
    );
  }
}
