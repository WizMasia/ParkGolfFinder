import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeString(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, '').toLowerCase();
}

async function main() {
  const allStaging = await prisma.stagingFacilityRecord.findMany({
    select: { name: true, address: true }
  });
  
  const nameGroups: Record<string, Set<string>> = {};
  for (const f of allStaging) {
    const normName = normalizeString(f.name);
    if (!nameGroups[normName]) nameGroups[normName] = new Set();
    if (f.address) {
       // Only keep first part of address to ignore small differences
       const simplifiedAddr = f.address.split(' ').slice(0, 2).join(' ');
       nameGroups[normName].add(simplifiedAddr);
    }
  }
  
  let falsePositives = 0;
  for (const [name, addresses] of Object.entries(nameGroups)) {
    if (addresses.size > 1) {
      console.log(`Potential False Positive (Same name, different regions): ${name}`);
      console.log(Array.from(addresses));
      falsePositives++;
    }
  }
  console.log(`Total false positive groups: ${falsePositives}`);
}

main().finally(() => prisma.$disconnect());
