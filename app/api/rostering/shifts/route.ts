/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { shiftSchema } from '@/lib/validations/rostering'
import { z } from 'zod'
import { addDays, parseISO, isBefore, isSameDay } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const regionId = searchParams.get('regionId')
    const workerId = searchParams.get('workerId')
    const participantId = searchParams.get('participantId')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    if (!regionId) {
      return NextResponse.json(
        { error: 'Region ID is required' },
        { status: 400 }
      )
    }

    const where: any = {
      regionId,
    }

    if (workerId) {
      where.workerId = workerId
    }

    if (participantId) {
      where.participantId = participantId
    }

    if (fromDate || toDate) {
      where.shiftDate = {}
      if (fromDate) {
        where.shiftDate.gte = new Date(fromDate)
      }
      if (toDate) {
        where.shiftDate.lte = new Date(toDate)
      }
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        participant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // In a real app, you would get the user ID from the session
    const createdByUserId = 'system' // Placeholder for auth user

    const body = await req.json()
    const parsedData = shiftSchema.parse(body)

    const shiftsToCreate = []

    const baseShift = {
      workerId: parsedData.workerId,
      participantId: parsedData.participantId || null,
      regionId: parsedData.regionId,
      serviceCategory: parsedData.serviceCategory,
      supportItem: parsedData.supportItem,
      ratioWorkerCount: parsedData.ratioWorkerCount,
      ratioParticipantCount: parsedData.ratioParticipantCount,
      tasks: parsedData.tasks ? JSON.parse(JSON.stringify(parsedData.tasks)) : null,
      status: parsedData.status,
      overtime: parsedData.overtime,

      workerTrackingEnabled: parsedData.workerTrackingEnabled,
      isGroupShift: parsedData.isGroupShift,
      isOpenShift: parsedData.isOpenShift,
      requireParticipantSignature: parsedData.requireParticipantSignature,
      enforceDistanceRestriction: parsedData.enforceDistanceRestriction,
      allowShiftOverlapping: parsedData.allowShiftOverlapping,
      isSleepoverShift: parsedData.isSleepoverShift,

      recurring: parsedData.recurring,
      recurrencePattern: parsedData.recurrencePattern,
      recurrenceEndDate: parsedData.recurrenceEndDate ? new Date(parsedData.recurrenceEndDate) : null,
      recurrenceDaysOfWeek: parsedData.recurrenceDaysOfWeek ? JSON.parse(JSON.stringify(parsedData.recurrenceDaysOfWeek)) : null,

      createdByUserId,
    }

    const initialShiftDate = new Date(parsedData.shiftDate)
    const initialStart = new Date(parsedData.startDateTime)
    const initialEnd = new Date(parsedData.endDateTime)

    shiftsToCreate.push({
      ...baseShift,
      shiftDate: initialShiftDate,
      startDateTime: initialStart,
      endDateTime: initialEnd,
    })

    if (parsedData.recurring && parsedData.recurrenceEndDate && parsedData.recurrencePattern) {
      const endDate = new Date(parsedData.recurrenceEndDate)
      let currentDate = initialShiftDate
      let currentStart = initialStart
      let currentEnd = initialEnd

      let daysToAdd = 0
      if (parsedData.recurrencePattern === 'Daily') daysToAdd = 1
      else if (parsedData.recurrencePattern === 'Weekly') daysToAdd = 7
      else if (parsedData.recurrencePattern === 'Fortnightly') daysToAdd = 14

      if (daysToAdd > 0) {
        currentDate = addDays(currentDate, daysToAdd)
        currentStart = addDays(currentStart, daysToAdd)
        currentEnd = addDays(currentEnd, daysToAdd)

        // Generate up to 50 occurrences to prevent infinite loops / overload in v1
        let count = 0
        while ((isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) && count < 50) {
          shiftsToCreate.push({
            ...baseShift,
            shiftDate: currentDate,
            startDateTime: currentStart,
            endDateTime: currentEnd,
          })

          currentDate = addDays(currentDate, daysToAdd)
          currentStart = addDays(currentStart, daysToAdd)
          currentEnd = addDays(currentEnd, daysToAdd)
          count++
        }
      }
    }

    const createdShifts = await prisma.$transaction(
      shiftsToCreate.map((shift) => prisma.shift.create({ data: shift }))
    )

    return NextResponse.json(createdShifts, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
