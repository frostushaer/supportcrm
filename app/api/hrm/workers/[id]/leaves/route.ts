import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workerLeaveSchema } from "@/lib/validations/hrm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const leaves = await db.workerLeave.findMany({
      where: { workerId: resolvedParams.id },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("[WORKER_LEAVES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const validatedData = workerLeaveSchema.parse(body);

    const leave = await db.workerLeave.create({
      data: {
        ...validatedData,
        workerId: resolvedParams.id,
        updatedByUserId: session.user.id,
      },
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error("[WORKER_LEAVES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
