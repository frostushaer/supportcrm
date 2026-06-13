import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get("regionId");
    // const status = searchParams.get("status"); // Not in model yet, wait for phase 2
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    if (!regionId) {
      return new NextResponse("Region ID is required", { status: 400 });
    }

    const where: Prisma.ComplaintWhereInput = {
      regionId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const complaints = await db.complaint.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("[REPORTING_COMPLAINTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
