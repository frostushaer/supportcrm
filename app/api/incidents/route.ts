import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { incidentSchema } from "@/lib/validations/incidents";
import { z } from "zod";

import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionId = searchParams.get("regionId");
    const status = searchParams.get("status");
    const outcomeType = searchParams.get("outcomeType");
    const participantId = searchParams.get("participantId");
    const workerId = searchParams.get("workerId");
    const search = searchParams.get("search");

    const where: Prisma.IncidentWhereInput = {};

    if (regionId && regionId !== "all") {
      where.regionId = regionId;
    }
    if (status) {
      where.status = status;
    }
    if (outcomeType) {
      where.outcomeType = outcomeType;
    }
    if (participantId) {
      where.participants = {
        some: { id: participantId },
      };
    }
    if (workerId) {
      where.workerId = workerId;
    }
    if (search) {
      where.OR = [
        { incidentNumber: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        participants: true,
        reportedBy: true,
        workerInvolved: true,
        investigation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse the basic fields
    const validatedData = incidentSchema.parse(body);

    // Extract relation arrays that aren't mapped directly
    const { participantIds, witnesses, attachments, ...incidentData } = validatedData;

    // Generate Incident Number: IN- + 6 random digits
    const incidentNumber = `IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newIncident = await prisma.incident.create({
      data: {
        ...incidentData,
        incidentNumber,
        reportedAt: incidentData.reportedAt || new Date(),
        participants: {
          connect: participantIds.map(id => ({ id }))
        },
        witnesses: witnesses && witnesses.length > 0 ? {
          create: witnesses.map(w => ({
            firstName: w.firstName,
            lastName: w.lastName,
            dateOfBirth: w.dateOfBirth,
            gender: w.gender,
            address: w.address,
          }))
        } : undefined,
        attachments: attachments && attachments.length > 0 ? {
          create: attachments.map(a => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileSize: a.fileSize,
          }))
        } : undefined,
      },
      include: {
        participants: true,
        witnesses: true,
        attachments: true,
      }
    });

    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
