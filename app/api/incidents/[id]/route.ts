import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { incidentSchema } from "@/lib/validations/incidents";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        participants: true,
        reportedBy: true,
        workerInvolved: true,
        witnesses: true,
        attachments: true,
        investigation: true,
        review: true,
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error("Error fetching incident:", error);
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    // Validate request body
    const validatedData = incidentSchema.parse(body);

    const { participantIds, witnesses, attachments, ...incidentData } = validatedData;

    // We only update the core fields for now. 
    // Managing related entities (witnesses/attachments) in an update 
    // requires a more complex sync or delete-and-recreate approach.
    // For simplicity, we'll delete and recreate witnesses if provided.
    
    // Begin Transaction for atomic updates
    const updatedIncident = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields and participants
      const incident = await tx.incident.update({
        where: { id },
        data: {
          ...incidentData,
          participants: {
            set: participantIds.map(pid => ({ id: pid }))
          }
        }
      });

      // 2. Sync witnesses if provided in the payload
      if (witnesses !== undefined) {
        await tx.incidentWitness.deleteMany({
          where: { incidentId: id }
        });
        if (witnesses.length > 0) {
          await tx.incidentWitness.createMany({
            data: witnesses.map(w => ({
              incidentId: id,
              firstName: w.firstName,
              lastName: w.lastName,
              dateOfBirth: w.dateOfBirth,
              gender: w.gender,
              address: w.address,
            }))
          });
        }
      }

      // 3. Sync attachments if provided
      if (attachments !== undefined) {
        await tx.incidentAttachment.deleteMany({
          where: { incidentId: id }
        });
        if (attachments.length > 0) {
          await tx.incidentAttachment.createMany({
            data: attachments.map(a => ({
              incidentId: id,
              fileName: a.fileName,
              fileUrl: a.fileUrl,
              fileSize: a.fileSize,
            }))
          });
        }
      }

      return incident;
    });

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error("Error updating incident:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    if (incident.status !== "Draft") {
      return NextResponse.json(
        { error: "Only Draft incidents can be deleted" },
        { status: 400 }
      );
    }

    await prisma.incident.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting incident:", error);
    return NextResponse.json(
      { error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}
