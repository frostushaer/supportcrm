import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { workerDocumentFolderSchema } from '@/lib/validations/hrm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    const items = await db.workerDocumentFolder.findMany({ where: { workerId: resolvedParams.id }, include: { documents: true } });
    return NextResponse.json(items);
  } catch (error) {
    console.error('[FOLDERS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    const body = await req.json();
    const validatedData = workerDocumentFolderSchema.parse(body);
    const item = await db.workerDocumentFolder.create({ data: { ...validatedData, workerId: resolvedParams.id } });
    return NextResponse.json(item);
  } catch (error) {
    console.error('[FOLDERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}