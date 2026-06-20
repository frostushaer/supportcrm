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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.WorkerWhereInput = {};
    
    if (regionId && regionId !== "all") {
      where.regionId = regionId;
    }
    
    if (status && status !== "All") {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    const workers = await db.worker.findMany({
      where,
      orderBy: {
        firstName: 'asc'
      },
      include: {
        region: true,
      }
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("[WORKERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
