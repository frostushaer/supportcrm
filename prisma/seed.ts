import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const regions = [
    { id: 'region_1', name: 'Melbourne', state: 'VIC' },
    { id: 'region_2', name: 'Sydney', state: 'NSW' },
    { id: 'region_3', name: 'Brisbane', state: 'QLD' },
    { id: 'region_4', name: 'Perth', state: 'WA' },
    { id: 'region_5', name: 'Adelaide', state: 'SA' },
  ];

  for (const region of regions) {
    await db.region.upsert({
      where: { id: region.id },
      update: {},
      create: region,
    });
  }

  console.log('✅ Seeded regions');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
