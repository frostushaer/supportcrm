/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { homeUpdateSchema } from '@/lib/validations/home-management'

export const dynamic = 'force-dynamic'

function calculateVacancyStatus(current: number, max: number) {
  if (current >= max) return 'Full'
  if (current > 0) return 'Partial'
  return 'Available'
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const home = await prisma.homeProperty.findUnique({
      where: { id },
      include: {
        region: true,
        participants: true,
      },
    })

    if (!home) {
      return NextResponse.json({ error: 'Home not found' }, { status: 404 })
    }

    const currentOccupancy = home.participants.filter((p) => !p.moveOutDate || new Date(p.moveOutDate) > new Date()).length
    const vacancyStatus = calculateVacancyStatus(currentOccupancy, home.maxCapacity)

    return NextResponse.json({
      ...home,
      currentOccupancy,
      vacancyStatus,
    })
  } catch (error: any) {
    console.error('[HOME_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsedData = homeUpdateSchema.parse(body)

    const existingHome = await prisma.homeProperty.findUnique({
      where: { id },
      include: { participants: true },
    })

    if (!existingHome) {
      return NextResponse.json({ error: 'Home not found' }, { status: 404 })
    }

    let vacancyStatus = existingHome.vacancyStatus

    if (parsedData.maxCapacity !== undefined) {
      const currentOccupancy = existingHome.participants.filter((p) => !p.moveOutDate || new Date(p.moveOutDate) > new Date()).length
      vacancyStatus = calculateVacancyStatus(currentOccupancy, parsedData.maxCapacity)
    }

    const home = await prisma.homeProperty.update({
      where: { id },
      data: {
        ...parsedData,
        ...(parsedData.maxCapacity !== undefined && { vacancyStatus }),
      },
    })

    return NextResponse.json(home)
  } catch (error: any) {
    console.error('[HOME_PATCH]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const home = await prisma.homeProperty.delete({
      where: { id },
    })

    return NextResponse.json(home)
  } catch (error: any) {
    console.error('[HOME_DELETE]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
