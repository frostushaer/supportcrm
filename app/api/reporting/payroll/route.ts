/* eslint-disable @typescript-eslint/no-explicit-any */
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
    // "employeeType" not strictly tied to db yet, skipping unless needed
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    if (!regionId) {
      return new NextResponse("Region ID is required", { status: 400 });
    }
    
    if (!startDate || !endDate) {
      return new NextResponse("Start and End dates are required for Payroll", { status: 400 });
    }

    const shiftWhere: Prisma.ShiftWhereInput = {
      regionId,
    };

    if (workerId) {
      shiftWhere.workerId = workerId;
    }

    if (search) {
      shiftWhere.worker = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const timesheets = await db.timesheet.findMany({
      where: {
        shift: shiftWhere,
        actualStartTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      },
      include: {
        shift: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });

    const aggregated: Record<string, any> = {};

    timesheets.forEach(ts => {
      const worker = ts.shift.worker;
      if (!aggregated[worker.id]) {
        aggregated[worker.id] = {
          workerName: `${worker.firstName} ${worker.lastName}`,
          totalHours: 0,
          day: 0,
          evening: 0,
          night: 0,
          saturday: 0,
          sunday: 0,
          publicHoliday: 0,
          sleepover: 0,
          ot1_5: 0,
          ot2_0: 0,
          wklyOt1_5: 0,
          wklyOt2_0: 0,
          kms: 0
        };
      }

      const row = aggregated[worker.id];
      row.totalHours += ts.totalHours;
      row.kms += ts.kms;

      // Extremely simplified bucketing logic for demonstration
      const start = new Date(ts.actualStartTime);
      const dayOfWeek = start.getDay();
      
      // Basic allocation
      if (dayOfWeek === 0) {
        row.sunday += ts.totalHours;
      } else if (dayOfWeek === 6) {
        row.saturday += ts.totalHours;
      } else {
        const hour = start.getHours();
        if (hour >= 6 && hour < 18) {
          row.day += ts.totalHours;
        } else if (hour >= 18 && hour < 22) {
          row.evening += ts.totalHours;
        } else {
          row.night += ts.totalHours;
        }
      }
      
      // Overtime assignment
      if (ts.shift.overtime === '1.5x') {
        row.ot1_5 += ts.totalHours;
      } else if (ts.shift.overtime === '2.0x') {
        row.ot2_0 += ts.totalHours;
      }
    });

    const result = Object.values(aggregated).map(item => {
      // Fix floating point precision
      const cleanItem: any = {};
      for (const [key, val] of Object.entries(item)) {
        cleanItem[key] = typeof val === 'number' ? Number(val.toFixed(2)) : val;
      }
      return cleanItem;
    });

    result.sort((a, b) => a.workerName.localeCompare(b.workerName));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[REPORTING_PAYROLL_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
