/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { shiftSchema } from '@/lib/validations/rostering'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const shift = await prisma.shift.findUnique({
      where: { id: id },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true },
        },
        participant: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error fetching shift:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updatedByUserId = 'system' // Placeholder

    const body = await req.json()
    // Using partial schema since it's a PATCH update
    const parsedData = shiftSchema.partial().parse(body)

    const existingShift = await prisma.shift.findUnique({
      where: { id: id },
    })

    if (!existingShift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const dataToUpdate: any = {
      ...parsedData,
      updatedByUserId,
    }

    // Handle JSON conversions
    if (parsedData.tasks !== undefined) {
      dataToUpdate.tasks = parsedData.tasks ? JSON.parse(JSON.stringify(parsedData.tasks)) : null
    }
    if (parsedData.recurrenceDaysOfWeek !== undefined) {
      dataToUpdate.recurrenceDaysOfWeek = parsedData.recurrenceDaysOfWeek ? JSON.parse(JSON.stringify(parsedData.recurrenceDaysOfWeek)) : null
    }
    if (parsedData.shiftDate) {
      dataToUpdate.shiftDate = new Date(parsedData.shiftDate)
    }
    if (parsedData.startDateTime) {
      dataToUpdate.startDateTime = new Date(parsedData.startDateTime)
    }
    if (parsedData.endDateTime) {
      dataToUpdate.endDateTime = new Date(parsedData.endDateTime)
    }
    if (parsedData.recurrenceEndDate) {
      dataToUpdate.recurrenceEndDate = new Date(parsedData.recurrenceEndDate)
    }

    const updatedShift = await prisma.shift.update({
      where: { id: id },
      data: dataToUpdate,
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error('Error updating shift:', error)
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const shift = await prisma.shift.findUnique({
      where: { id: id },
    })

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    await prisma.shift.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Shift deleted successfully' })
  } catch (error) {
    console.error('Error deleting shift:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
