import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeString(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, '').toLowerCase();
}

async function main() {
  const allFacilities = await prisma.facility.findMany({
    select: { id: true, name: true, address: true, sourceName: true, facilityType: true }
  });
  
  console.log(`Total records: ${allFacilities.length}`);
  
  const nameCount: Record<string, any[]> = {};
  for (const f of allFacilities) {
    const normName = normalizeString(f.name);
    if (!nameCount[normName]) nameCount[normName] = [];
    nameCount[normName].push(f);
  }
  
  let duplicateGroups = 0;
  let totalDuplicates = 0;
  let kakaoVsOthers = 0;

  for (const [name, facilities] of Object.entries(nameCount)) {
    if (facilities.length > 1) {
      duplicateGroups++;
      totalDuplicates += facilities.length;
      
      const hasKakao = facilities.some(f => f.sourceName === 'kakao');
      const hasOther = facilities.some(f => f.sourceName !== 'kakao');
      if (hasKakao && hasOther) kakaoVsOthers++;

      console.log(`\nDuplicate Name Group: ${name} (${facilities.length})`);
      facilities.forEach(f => {
        console.log(`  - ID: ${f.id} | Name: ${f.name} | Source: ${f.sourceName} | Type: ${f.facilityType} | Address: ${f.address}`);
      });
    }
  }
  
  console.log(`\nFound ${duplicateGroups} groups with duplicate names (Total duplicate records involved: ${totalDuplicates})`);
  console.log(`Groups combining Kakao and other sources: ${kakaoVsOthers}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
