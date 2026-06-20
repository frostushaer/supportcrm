import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workerSettingsSchema } from "@/lib/validations/hrm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const worker = await db.worker.findUnique({
      where: { id: resolvedParams.id },
      include: {
        region: true,
        assignedParticipants: true,
      }
    });

    if (!worker) {
      return new NextResponse("Worker Not Found", { status: 404 });
    }

    return NextResponse.json(worker);
  } catch (error) {
    console.error("[WORKER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Check if it's a simple status update (deactivation)
    if (body.status && Object.keys(body).length === 1) {
      const worker = await db.worker.update({
        where: { id: resolvedParams.id },
        data: { status: body.status },
      });
      return NextResponse.json(worker);
    }

    const validatedData = workerSettingsSchema.parse(body);

    const { assignedParticipantIds, ...workerData } = validatedData;

    const worker = await db.worker.update({
      where: { id: resolvedParams.id },
      data: {
        ...workerData,
        assignedParticipants: {
          set: (assignedParticipantIds || []).map((id) => ({ id })),
        },
        traits: validatedData.traits ? JSON.parse(JSON.stringify(validatedData.traits)) : undefined,
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("[WORKER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
