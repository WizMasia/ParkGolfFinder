import { PrismaClient } from "@prisma/client";
import { CURATED_SEED_FACILITIES } from "../src/seed-data.js";

const prisma = new PrismaClient();

/**
 * Seed verified public outdoor park golf facilities across all 7 regions:
 * Seoul, Gyeonggi, Gangwon, Chungcheong, Honam, Yeongnam, Jeju.
 * 전국 7대 권역(서울, 경기, 강원, 충청, 호남, 영남, 제주)의 검증된 야외 공공 파크골프장 데이터를 데이터베이스에 시딩합니다.
 */
async function main() {
  console.log(`Starting database seeding for ${CURATED_SEED_FACILITIES.length} facilities across 7 regions...`);

  for (const fac of CURATED_SEED_FACILITIES) {
    console.log(`Seeding [${fac.regionKey}] ${fac.name}...`);

    await prisma.facility.upsert({
      where: { id: fac.id },
      update: {
        name: fac.name,
        address: fac.address,
        province: fac.province,
        district: fac.district,
        regionKey: fac.regionKey,
        facilityType: fac.facilityType,
        status: fac.status,
        ownership: fac.ownership,
        operatorName: fac.operatorName,
        phone: fac.phone,
        lat: fac.lat,
        lng: fac.lng,
        sourceName: fac.sourceName,
        sourceUrl: fac.sourceUrl,
      },
      create: {
        id: fac.id,
        name: fac.name,
        address: fac.address,
        province: fac.province,
        district: fac.district,
        regionKey: fac.regionKey,
        facilityType: fac.facilityType,
        status: fac.status,
        ownership: fac.ownership,
        operatorName: fac.operatorName,
        phone: fac.phone,
        lat: fac.lat,
        lng: fac.lng,
        sourceName: fac.sourceName,
        sourceUrl: fac.sourceUrl,
      },
    });

    await prisma.facilityPricing.upsert({
      where: { facilityId: fac.id },
      update: {
        baseFeeText: fac.pricing.baseFeeText,
        concessionFeeText: fac.pricing.concessionFeeText,
        feeType: fac.pricing.feeType,
      },
      create: {
        facilityId: fac.id,
        baseFeeText: fac.pricing.baseFeeText,
        concessionFeeText: fac.pricing.concessionFeeText,
        feeType: fac.pricing.feeType,
      },
    });

    const resInfo = await prisma.reservationInfo.upsert({
      where: { facilityId: fac.id },
      update: {
        summary: fac.reservation.summary,
      },
      create: {
        facilityId: fac.id,
        summary: fac.reservation.summary,
      },
    });

    await prisma.reservationMethod.deleteMany({
      where: { reservationInfoId: resInfo.id },
    });

    if (fac.reservation.methods.length > 0) {
      await prisma.reservationMethod.createMany({
        data: fac.reservation.methods.map((m) => ({
          reservationInfoId: resInfo.id,
          methodType: m.methodType,
          methodText: m.methodText,
          priority: m.priority,
          ruleText: m.ruleText ?? null,
          url: m.url ?? null,
          notes: m.notes ?? null,
        })),
      });
    }
  }

  console.log("Database seeding completed successfully! / 7대 권역 데이터베이스 시딩 완료!");
}

main()
  .catch((e) => {
    console.error("Error seeding database: / 시딩 중 에러 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
