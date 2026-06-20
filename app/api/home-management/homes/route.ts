/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { homeCreateSchema, homeFiltersSchema } from '@/lib/validations/home-management'

export const dynamic = 'force-dynamic'

function calculateVacancyStatus(current: number, max: number) {
  if (current >= max) return 'Full'
  if (current > 0) return 'Partial'
  return 'Available'
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = homeFiltersSchema.parse(Object.fromEntries(searchParams))

    const where: any = {}

    if (filters.regionId && filters.regionId !== 'all') {
      where.regionId = filters.regionId
    }

    if (filters.status && filters.status !== 'All') {
      where.status = filters.status
    }

    if (filters.search) {
      where.OR = [
        { streetAddress: { contains: filters.search, mode: 'insensitive' } },
        { suburb: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const homes = await prisma.homeProperty.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        region: true,
        participants: true,
      },
    })

    // Compute derived properties
    const homesWithDerived = homes.map((home) => {
      const currentOccupancy = home.participants.filter((p) => !p.moveOutDate || new Date(p.moveOutDate) > new Date()).length
      const vacancyStatus = calculateVacancyStatus(currentOccupancy, home.maxCapacity)
      
      return {
        ...home,
        currentOccupancy,
        vacancyStatus,
      }
    })

    return NextResponse.json(homesWithDerived)
  } catch (error: any) {
    console.error('[HOMES_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsedData = homeCreateSchema.parse(body)

    const vacancyStatus = calculateVacancyStatus(0, parsedData.maxCapacity)

    const home = await prisma.homeProperty.create({
      data: {
        ...parsedData,
        status: parsedData.status || 'Active',
        hasFrontYard: parsedData.hasFrontYard ?? false,
        hasBackyard: parsedData.hasBackyard ?? false,
        hasSwimmingPool: parsedData.hasSwimmingPool ?? false,
        currentOccupancy: 0,
        vacancyStatus,
      },
    })

    return NextResponse.json(home)
  } catch (error: any) {
    console.error('[HOMES_POST]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
