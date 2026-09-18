import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up exact duplicates in Facility table...");
  const facilities = await prisma.facility.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const seen = new Set<string>();
  const idsToDelete: string[] = [];

  for (const f of facilities) {
    // Unique key: normalized name + address
    const normName = f.name.replace(/\s+/g, '').toLowerCase();
    
    // Instead of strict address, let's just do Name + Province + District for safety
    // Or just exact Name + Province + District
    const key = `${normName}_${f.province}_${f.district}`;

    if (seen.has(key)) {
      idsToDelete.push(f.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${idsToDelete.length} duplicates to delete.`);
  
  if (idsToDelete.length > 0) {
    // Delete related first
    await prisma.reservationMethod.deleteMany({
      where: { reservationInfo: { facilityId: { in: idsToDelete } } }
    });
    await prisma.reservationInfo.deleteMany({
      where: { facilityId: { in: idsToDelete } }
    });
    await prisma.facilityPricing.deleteMany({
      where: { facilityId: { in: idsToDelete } }
    });
    await prisma.facilitySnapshot.deleteMany({
      where: { facilityId: { in: idsToDelete } }
    });
    
    // Delete facilities
    const res = await prisma.facility.deleteMany({
      where: { id: { in: idsToDelete } }
    });
    console.log(`Deleted ${res.count} facilities.`);
  }

  console.log("Cleanup complete!");
}

cleanup().finally(() => prisma.$disconnect());
