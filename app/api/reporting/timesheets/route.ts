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
    const participantId = searchParams.get("participantId");
    const workerId = searchParams.get("workerId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    if (!regionId) {
      return new NextResponse("Region ID is required", { status: 400 });
    }

    const shiftWhere: Prisma.ShiftWhereInput = {
      regionId,
    };

    if (participantId) {
      shiftWhere.participantId = participantId;
    }

    if (workerId) {
      shiftWhere.workerId = workerId;
    }

    if (search) {
      shiftWhere.participant = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const where: Prisma.TimesheetWhereInput = {
      shift: shiftWhere
    };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.actualStartTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.actualStartTime = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.actualEndTime = {
        lte: new Date(endDate),
      };
    }

    const timesheets = await db.timesheet.findMany({
      where,
      include: {
        shift: {
          include: {
            participant: {
              select: {
                firstName: true,
                lastName: true,
              }
            },
            worker: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
      orderBy: {
        actualStartTime: 'desc'
      }
    });

    return NextResponse.json(timesheets);
  } catch (error) {
    console.error("[REPORTING_TIMESHEETS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
