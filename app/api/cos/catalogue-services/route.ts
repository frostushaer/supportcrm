/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const priceCatalogueLabel = searchParams.get('priceCatalogueLabel');
    const program = searchParams.get('program') || 'COS';

    const where: any = { program };
    if (category && category !== 'All') where.supportCategoryName = category;
    if (priceCatalogueLabel && priceCatalogueLabel !== 'All') where.priceCatalogueLabel = priceCatalogueLabel;
    if (search) {
      where.OR = [
        { supportItemName: { contains: search, mode: 'insensitive' } },
        { supportItemNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const services = await prisma.cosSupportCatalogueItem.findMany({
      where,
      orderBy: { supportItemName: 'asc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching catalogue services:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
