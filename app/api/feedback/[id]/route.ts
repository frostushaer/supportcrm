import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { feedbackSchema } from '@/lib/validations/feedback';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// GET single feedback
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const feedback = await db.feedback.findUnique({
      where: { id },
      include: {
        region: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// PATCH - Update feedback
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validating partial updates
    const validated = feedbackSchema.partial().parse(body);

    // Check ownership before update
    const existingFeedback = await db.feedback.findUnique({ where: { id } });
    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Only allow the submitter or admin to update
    const isOwner = existingFeedback.submittedBy === session.user?.name;
    const isAdmin = session.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feedback = await db.feedback.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', issues: error.issues },
        { status: 400 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    console.error('[PATCH feedback]', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership before delete
    const existingFeedback = await db.feedback.findUnique({ where: { id } });
    if (!existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Only allow the submitter or admin to delete
    const isOwner = existingFeedback.submittedBy === session.user?.name;
    const isAdmin = session.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.feedback.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    console.error('[DELETE feedback]', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
