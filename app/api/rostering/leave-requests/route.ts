/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const regionId = searchParams.get('regionId')

    const where: any = {}
    if (regionId && regionId !== 'all') {
      where.worker = {
        regionId,
      }
    }

    const leaveRequests = await prisma.workerLeave.findMany({
      where,
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
