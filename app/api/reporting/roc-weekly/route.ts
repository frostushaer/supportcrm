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
      where.worker = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const shifts = await db.shift.findMany({
      where,
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Aggregate by worker
    const aggregatedData: Record<string, { workerName: string, weeklyHours: number, overTime: number }> = {};

    shifts.forEach(shift => {
      const workerKey = shift.workerId;
      if (!aggregatedData[workerKey]) {
        aggregatedData[workerKey] = {
          workerName: `${shift.worker.firstName} ${shift.worker.lastName}`,
          weeklyHours: 0,
          overTime: 0,
        };
      }

      const diffInMs = new Date(shift.endDateTime).getTime() - new Date(shift.startDateTime).getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      aggregatedData[workerKey].weeklyHours += diffInHours;
      
      // Basic overtime check: if overtime is marked, add to overtime total
      // Or based on Shift 'overtime' field (e.g., '1.5x', '2.0x')
      if (shift.overtime && shift.overtime !== 'None') {
        aggregatedData[workerKey].overTime += diffInHours;
      }
    });

    const result = Object.values(aggregatedData).map(item => ({
      ...item,
      weeklyHours: Number(item.weeklyHours.toFixed(2)),
      overTime: Number(item.overTime.toFixed(2))
    }));

    // Sort by workerName
    result.sort((a, b) => a.workerName.localeCompare(b.workerName));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[REPORTING_ROC_WEEKLY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
