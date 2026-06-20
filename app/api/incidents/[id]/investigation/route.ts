import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { incidentInvestigationSchema } from "@/lib/validations/incidents";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const investigation = await prisma.incidentInvestigation.findUnique({
      where: { incidentId: id },
    });

    if (!investigation) {
      return NextResponse.json(
        { error: "Investigation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(investigation);
  } catch (error) {
    console.error("Error fetching investigation:", error);
    return NextResponse.json(
      { error: "Failed to fetch investigation" },
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
    
    // Validate request body
    const validatedData = incidentInvestigationSchema.parse(body);

    const updatedInvestigation = await prisma.$transaction(async (tx) => {
      // Upsert the investigation record
      const investigation = await tx.incidentInvestigation.upsert({
        where: { incidentId: id },
        create: {
          incidentId: id,
          ...validatedData,
        },
        update: {
          ...validatedData,
        },
      });

      // Update parent incident status to UnderInvestigation if not already, 
      // or keep it UnderInvestigation if it's currently Submitted
      // Only do this if we're actually saving the investigation (even as a draft)
      const incident = await tx.incident.findUnique({ where: { id }});
      if (incident && incident.status === "Submitted") {
        await tx.incident.update({
          where: { id },
          data: { status: "UnderInvestigation" }
        });
      }

      return investigation;
    });

    return NextResponse.json(updatedInvestigation);
  } catch (error) {
    console.error("Error updating investigation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update investigation" },
      { status: 500 }
    );
  }
}
