/* eslint-disable */
const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../app/api/cos');

const routes = [
  {
    path: 'participants/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');
    const managementStyle = searchParams.get('managementStyle');
    const activeStatus = searchParams.get('activeStatus');

    const where: any = {};
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { ndisNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (activeStatus && activeStatus !== 'All') {
      where.status = activeStatus;
    }

    const participants = await prisma.participant.findMany({
      where: {
        ...where,
        cosProfile: { isNot: null },
      },
      include: {
        region: true,
        cosProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (managementStyle && managementStyle !== 'All' && managementStyle !== 'Both') {
      return NextResponse.json(participants.filter(p => p.cosProfile?.managementStyle === managementStyle));
    }

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching cos participants:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
`
  },
  {
    path: 'catalogue-services/route.ts',
    content: `import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const priceCatalogueLabel = searchParams.get('priceCatalogueLabel');

    const where: any = {};
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
`
  },
  {
    path: 'service-providers/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { externalServiceProviderSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    const where: any = {};
    if (regionId && regionId !== 'all') {
      where.regions = { some: { id: regionId } };
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const providers = await prisma.externalServiceProvider.findMany({
      where,
      include: { regions: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching service providers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = externalServiceProviderSchema.parse(body);
    const { regionIds, ...rest } = validatedData;

    const provider = await prisma.externalServiceProvider.create({
      data: {
        ...rest,
        regions: { connect: (regionIds || []).map(id => ({ id })) },
      },
      include: { regions: true }
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error('Error creating service provider:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
`
  },
  {
    path: 'service-providers/[id]/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { externalServiceProviderSchema } from '@/lib/validations/cos';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = externalServiceProviderSchema.partial().parse(body);
    const { regionIds, ...rest } = validatedData;

    const dataToUpdate: any = { ...rest };
    if (regionIds) {
      dataToUpdate.regions = { set: regionIds.map(rId => ({ id: rId })) };
    }

    const provider = await prisma.externalServiceProvider.update({
      where: { id },
      data: dataToUpdate,
      include: { regions: true }
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating service provider:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.externalServiceProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service provider:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
`
  },
  {
    path: 'case-notes/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cosCaseNoteSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const participantId = searchParams.get('participantId');
    const noteContactType = searchParams.get('noteContactType');
    const deliveredFrom = searchParams.get('deliveredFrom');
    const deliveredTo = searchParams.get('deliveredTo');

    const where: any = {};
    if (regionId && regionId !== 'all') where.serviceRegionId = regionId;
    if (participantId && participantId !== 'All') where.participantId = participantId;
    if (noteContactType && noteContactType !== 'All') where.noteContactType = noteContactType;
    if (deliveredFrom && deliveredTo) {
      where.deliveredDate = {
        gte: new Date(deliveredFrom),
        lte: new Date(deliveredTo),
      };
    }

    const caseNotes = await prisma.cosCaseNote.findMany({
      where,
      include: {
        participant: true,
        funding: true,
        serviceRegion: true,
        supportCoordinator: true,
      },
      orderBy: { deliveredDate: 'desc' },
    });

    return NextResponse.json(caseNotes);
  } catch (error) {
    console.error('Error fetching case notes:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = cosCaseNoteSchema.parse(body);

    const dataToCreate: any = {
      participantId: validatedData.participantId,
      serviceRegionId: validatedData.serviceRegionId,
      supportCoordinatorId: validatedData.supportCoordinatorId,
      deliveredDate: new Date(validatedData.deliveredDate),
      durationMinutes: validatedData.durationMinutes,
      kilometres: validatedData.kilometres,
      amount: validatedData.amount,
      noteContactType: validatedData.noteContactType,
      caseNoteText: validatedData.caseNoteText,
      status: validatedData.status,
      createdByUserId: validatedData.createdByUserId,
    };
    if (validatedData.fundingId) {
       dataToCreate.fundingId = validatedData.fundingId;
    }

    const note = await prisma.cosCaseNote.create({
      data: dataToCreate
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating case note:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
`
  },
  {
    path: 'ndis-claims/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { ndisClaimSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const claimType = searchParams.get('claimType');

    const where: any = {};
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (claimType && claimType !== 'All') where.claimType = claimType;

    const claims = await prisma.ndisClaim.findMany({
      where,
      include: { participant: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = ndisClaimSchema.parse(body);

    const claim = await prisma.ndisClaim.create({
      data: {
        ...validatedData,
        deliveredFrom: new Date(validatedData.deliveredFrom),
        deliveredTo: new Date(validatedData.deliveredTo)
      }
    });

    // Mark case notes as claimed
    if (claim.caseNoteIds && claim.caseNoteIds.length > 0) {
      await prisma.cosCaseNote.updateMany({
        where: { id: { in: claim.caseNoteIds } },
        data: { status: 'Claimed' }
      });
    }

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
`
  },
  {
    path: 'ndis-claims/[id]/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { ndisClaimSchema } from '@/lib/validations/cos';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = ndisClaimSchema.partial().parse(body);

    const dataToUpdate: any = { ...validatedData };
    if (validatedData.deliveredFrom) dataToUpdate.deliveredFrom = new Date(validatedData.deliveredFrom);
    if (validatedData.deliveredTo) dataToUpdate.deliveredTo = new Date(validatedData.deliveredTo);

    const claim = await prisma.ndisClaim.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}
`
  },
  {
    path: 'invoices/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cosInvoiceSchema } from '@/lib/validations/cos';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const invoiceType = searchParams.get('invoiceType');
    const participantId = searchParams.get('participantId');

    const where: any = {};
    if (regionId && regionId !== 'all') where.regionId = regionId;
    if (invoiceType && invoiceType !== 'All') where.invoiceType = invoiceType;
    if (participantId && participantId !== 'All') where.participantId = participantId;

    const invoices = await prisma.cosInvoice.findMany({
      where,
      include: { participant: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = cosInvoiceSchema.parse(body);

    const invoice = await prisma.cosInvoice.create({
      data: {
        ...validatedData,
        serviceDeliveredFrom: new Date(validatedData.serviceDeliveredFrom),
        serviceDeliveredTo: new Date(validatedData.serviceDeliveredTo)
      }
    });

    // Mark case notes as invoiced
    if (invoice.caseNoteIds && invoice.caseNoteIds.length > 0) {
      await prisma.cosCaseNote.updateMany({
        where: { id: { in: invoice.caseNoteIds } },
        data: { status: 'Invoiced' }
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 });
  }
}
`
  },
  {
    path: 'invoices/[id]/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cosInvoiceSchema } from '@/lib/validations/cos';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = cosInvoiceSchema.partial().parse(body);

    const dataToUpdate: any = { ...validatedData };
    if (validatedData.serviceDeliveredFrom) dataToUpdate.serviceDeliveredFrom = new Date(validatedData.serviceDeliveredFrom);
    if (validatedData.serviceDeliveredTo) dataToUpdate.serviceDeliveredTo = new Date(validatedData.serviceDeliveredTo);

    const invoice = await prisma.cosInvoice.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}
`
  },
  {
    path: 'funding/route.ts',
    content: `/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    const participantId = searchParams.get('participantId');
    const coordinatorId = searchParams.get('coordinatorId');

    const where: any = {};
    if (participantId && participantId !== 'All') where.participantId = participantId;
    if (coordinatorId && coordinatorId !== 'All') where.cosCoordinatorWorkerId = coordinatorId;
    
    // Filter region indirectly via participant's cosProfile
    if (regionId && regionId !== 'all') {
       where.participant = {
         cosProfile: {
           serviceRegionId: regionId
         }
       };
    }

    const fundings = await prisma.cosFunding.findMany({
      where,
      include: {
        participant: {
          include: { cosProfile: true }
        },
        coordinator: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(fundings);
  } catch (error) {
    console.error('Error fetching funding:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
`
  }
];

routes.forEach(route => {
  const fullPath = path.join(basePath, route.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, route.content.trim() + '\\n');
});

console.log('Created COS API routes successfully.');
