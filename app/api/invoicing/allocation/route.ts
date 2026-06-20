/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("regionId");
    const participantId = searchParams.get("participantId");
    const workerId = searchParams.get("workerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // We want timesheets that are Approved and NOT Invoiced
    const whereClause: any = {
      status: "Approved",
      billingStatus: { not: "Invoiced" },
    };

    if (regionId) {
      whereClause.shift = { ...whereClause.shift, regionId };
    }
    
    if (participantId) {
      whereClause.shift = { ...whereClause.shift, participantId };
    }

    if (workerId) {
      whereClause.shift = { ...whereClause.shift, workerId };
    }

    if (from || to) {
      whereClause.shift = { ...whereClause.shift, startDateTime: {} };
      if (from) whereClause.shift.startDateTime.gte = new Date(from);
      if (to) whereClause.shift.startDateTime.lte = new Date(to);
    }

    const allocations = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        shift: {
          include: {
            participant: true,
            worker: true,
          },
        },
      },
      orderBy: {
        shift: {
          startDateTime: 'desc'
        }
      }
    });

    return NextResponse.json(allocations);
  } catch (error) {
    console.error("Error fetching allocation timesheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch allocation timesheets" },
      { status: 500 }
    );
  }
}
