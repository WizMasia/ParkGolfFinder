import { PrismaClient } from '@prisma/client';
import { REGIONAL_RESERVATION_MAP, resolveRegionalReservationUrl } from '@parkgolf/shared';

const prisma = new PrismaClient();

function isRealHomepageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  const blacklistedDomains = [
    "parkgolflist.com",
    "djpkgolf.kr",
    "api.odcloud.kr",
    "data.go.kr",
    "openapi.gg.go.kr",
    "eshare.go.kr",
    "local_upload"
  ];
  return !blacklistedDomains.some(domain => lowercaseUrl.includes(domain));
}

function matchPartial(val: string | null | undefined, ruleVal: string): boolean {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  const r = ruleVal.toLowerCase().trim();
  return v.includes(r) || r.includes(v);
}

async function main() {
  console.log("=== [Starting Public Reservation Deep-link Mapping Migration] ===");
  
  const facilities = await prisma.facility.findMany({
    include: {
      reservation: {
        include: {
          methods: true
        }
      }
    }
  });
  
  let mappedCount = 0;
  
  for (const f of facilities) {
    const bookingUrl = f.reservation?.methods?.find((m: any) => m.url)?.url;
    const currentBest = bookingUrl || f.sourceUrl;
    
    if (currentBest && isRealHomepageUrl(currentBest)) {
      continue;
    }
    
    const matchedUrl = resolveRegionalReservationUrl({
      province: f.province,
      district: f.district,
      name: f.name,
    });
    
    if (matchedUrl) {
      await prisma.facility.update({
        where: { id: f.id },
        data: { sourceUrl: matchedUrl }
      });
      mappedCount++;
      console.log(`Mapped: "${f.name}" (${f.province || ""} ${f.district || ""}) -> ${matchedUrl}`);
    }
  }
  
  console.log("\n=== [Deep-link Mapping Migration Completed] ===");
  console.log(`- Total Facilities Scanned: ${facilities.length}`);
  console.log(`- Successfully Remapped to Public Portals: ${mappedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
