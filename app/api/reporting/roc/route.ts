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
    const overtime = searchParams.get("overtime");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    if (!regionId) {
      return new NextResponse("Region ID is required", { status: 400 });
    }

    const where: Prisma.ShiftWhereInput = {
      regionId,
    };

    if (participantId) {
      where.participantId = participantId;
    }

    if (workerId) {
      where.workerId = workerId;
    }

    if (status) {
      where.status = status;
    }

    if (overtime) {
      where.overtime = overtime;
    }

    if (startDate && endDate) {
      where.startDateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startDateTime = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.endDateTime = {
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.participant = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const shifts = await db.shift.findMany({
      where,
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
      },
      orderBy: {
        startDateTime: 'desc'
      }
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error("[REPORTING_ROC_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
