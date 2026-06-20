/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("regionId");

    const whereClause: any = {
      billingStatus: "Allocated",
      status: "Approved",
    };

    if (regionId) {
      whereClause.shift = { regionId };
    }

    const readyTimesheets = await prisma.timesheet.findMany({
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

    return NextResponse.json(readyTimesheets);
  } catch (error) {
    console.error("Error fetching ready-for-invoice timesheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch timesheets" },
      { status: 500 }
    );
  }
}
