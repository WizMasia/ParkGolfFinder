import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN !== 'false';

function normalizeString(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, '').toLowerCase();
}

async function main() {
  console.log(`Starting Deduplication Script... (DRY_RUN: ${DRY_RUN})`);

  // Fetch all facilities
  const allFacilities = await prisma.facility.findMany();
  console.log(`Total records in DB: ${allFacilities.length}`);

  // Group by normalized name
  const nameGroups: Record<string, typeof allFacilities> = {};
  for (const f of allFacilities) {
    const normName = normalizeString(f.name);
    if (!nameGroups[normName]) nameGroups[normName] = [];
    nameGroups[normName].push(f);
  }

  const idsToDelete: string[] = [];

  for (const [name, facilities] of Object.entries(nameGroups)) {
    if (facilities.length > 1) {
      // Sort to keep the "best" record.
      // We prefer keeping records that might have more data. But since they are mostly identical clones from kakao,
      // keeping the first one (oldest createdAt or just the first in array) is fine.
      // We will sort by createdAt ascending (keep oldest).
      facilities.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      const keep = facilities[0];
      const duplicates = facilities.slice(1);
      
      for (const dup of duplicates) {
        idsToDelete.push(dup.id);
      }
    }
  }

  console.log(`Found ${idsToDelete.length} duplicate records to delete.`);

  if (DRY_RUN) {
    console.log(`[DRY RUN] Skipping actual deletion. Run with DRY_RUN=false to execute.`);
    console.log(`[DRY RUN] Sample of IDs to delete:`, idsToDelete.slice(0, 10));
  } else {
    console.log(`Executing deletion of ${idsToDelete.length} records...`);
    // Delete in batches to avoid overwhelming the DB
    const BATCH_SIZE = 500;
    for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
      const batchIds = idsToDelete.slice(i, i + BATCH_SIZE);
      const res = await prisma.facility.deleteMany({
        where: { id: { in: batchIds } }
      });
      console.log(`Deleted batch ${i / BATCH_SIZE + 1} (${res.count} records)`);
    }
    console.log(`Successfully deleted duplicates!`);
  }
}

main()
  .catch(e => {
    console.error('Error during deduplication:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
