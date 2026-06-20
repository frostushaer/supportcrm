import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { incidentReviewSchema } from "@/lib/validations/incidents";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await prisma.incidentReview.findUnique({
      where: { incidentId: id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
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
    const validatedData = incidentReviewSchema.parse(body);

    const updatedReview = await prisma.$transaction(async (tx) => {
      // Upsert the review record
      const review = await tx.incidentReview.upsert({
        where: { incidentId: id },
        create: {
          incidentId: id,
          ...validatedData,
        },
        update: {
          ...validatedData,
        },
      });

      // If finalStatus is set, it means the review is completed and the incident is closed
      if (validatedData.finalStatus) {
        await tx.incident.update({
          where: { id },
          data: { 
            status: validatedData.finalStatus, // "ClosedReported" or "ClosedUnreported"
          }
        });
      }

      return review;
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
