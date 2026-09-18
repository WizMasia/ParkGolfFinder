import { PrismaClient } from '@prisma/client';
import { runReviewPipeline } from './apps/bot/src/pipeline/review.js';
import { runPromotePipeline } from './apps/bot/src/pipeline/promote.js';

const prisma = new PrismaClient();

async function fixAll() {
  console.log("1. Re-running Review Pipeline to fix duplicate decisions...");
  await runReviewPipeline('cmplicon70000uccknds2wg65');

  console.log("2. Re-running Promote Pipeline to insert rich Kakao records...");
  await runPromotePipeline('cmplicon70000uccknds2wg65');

  console.log("3. Running smart cross-run cleanup in Facility table...");
  const facilities = await prisma.facility.findMany();
  
  const groups = new Map<string, any[]>();

  for (const f of facilities) {
    const normName = f.name.replace(/\s+/g, '').toLowerCase();
    const key = `${normName}_${f.province}_${f.district}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(f);
  }

  const idsToDelete: string[] = [];

  for (const [key, group] of groups.entries()) {
    if (group.length > 1) {
      // Sort to find the best candidate
      group.sort((a, b) => {
        // Rule 1: Prefer ones with coordinates (not matching default Seoul City Hall)
        const aHasGoodCoords = a.lat !== null && a.lng !== null && Math.abs(a.lat - 37.5663) > 0.01;
        const bHasGoodCoords = b.lat !== null && b.lng !== null && Math.abs(b.lat - 37.5663) > 0.01;
        if (aHasGoodCoords !== bHasGoodCoords) return aHasGoodCoords ? -1 : 1;
        
        // Rule 2: Prefer longer address
        if (a.address.length !== b.address.length) return b.address.length - a.address.length;
        
        // Rule 3: Prefer later createdAt (Kakao over CSV)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      // Keep the first one (best), delete the rest
      for (let i = 1; i < group.length; i++) {
        idsToDelete.push(group[i].id);
      }
    }
  }

  console.log(`Found ${idsToDelete.length} inferior duplicates to delete.`);
  
  if (idsToDelete.length > 0) {
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
    
    const res = await prisma.facility.deleteMany({
      where: { id: { in: idsToDelete } }
    });
    console.log(`Deleted ${res.count} facilities.`);
  }

  console.log("Fix completed successfully!");
}

fixAll().finally(() => prisma.$disconnect());
