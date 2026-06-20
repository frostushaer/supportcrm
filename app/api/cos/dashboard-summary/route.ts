/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const program = searchParams.get('program') || 'COS';

    const participantWhere: any = { cosProfile: { program } };
    const caseNotesWhere: any = { program };
    if (regionId && regionId !== 'all') {
      participantWhere.cosProfile = { ...participantWhere.cosProfile, serviceRegionId: regionId };
      caseNotesWhere.serviceRegionId = regionId;
    }

    const totalClients = await prisma.participant.count({
      where: participantWhere
    });

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const caseNotesThisWeek = await prisma.cosCaseNote.findMany({
      where: {
        ...caseNotesWhere,
        deliveredDate: { gte: lastWeek }
      },
      include: {
        supportCoordinator: true
      }
    });

    const totalBillableMinutes = caseNotesThisWeek.reduce((sum, note) => sum + note.durationMinutes, 0);
    const billableHours = (totalBillableMinutes / 60).toFixed(1);

    // Leaderboard logic
    const coordinatorStats: Record<string, { name: string; email: string; participants: Set<string>; minutes: number }> = {};
    
    caseNotesThisWeek.forEach(note => {
      const coordId = note.supportCoordinatorId;
      if (!coordinatorStats[coordId]) {
         coordinatorStats[coordId] = {
           name: note.supportCoordinator?.firstName + ' ' + note.supportCoordinator?.lastName,
           email: note.supportCoordinator?.email || '',
           participants: new Set(),
           minutes: 0
         };
      }
      coordinatorStats[coordId].participants.add(note.participantId);
      coordinatorStats[coordId].minutes += note.durationMinutes;
    });

    const leaderboard = Object.values(coordinatorStats).map(stat => ({
      name: stat.name,
      email: stat.email,
      activeParticipants: stat.participants.size,
      billableHours: (stat.minutes / 60).toFixed(1)
    })).sort((a, b) => parseFloat(b.billableHours) - parseFloat(a.billableHours));

    return NextResponse.json({
      totalClients,
      billableHours,
      leaderboard,
      caseNotesThisWeek
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
