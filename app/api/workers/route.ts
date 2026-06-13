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

    if (!regionId) {
      return new NextResponse("Region ID is required", { status: 400 });
    }

    const where: Prisma.WorkerWhereInput = {
      regionId,
    };

    const workers = await db.worker.findMany({
      where,
      orderBy: {
        firstName: 'asc'
      }
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("[WORKERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
