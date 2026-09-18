import { prisma } from "@parkgolf/db";
import { isOutdoorParkGolf } from "@parkgolf/shared";

/**
 * Promotes confirmed staging records into the production tables.
 * 검증(review) 완료된 스테이징 레코드들을 프로덕션 DB로 승급(반영)시킵니다.
 */
export async function runPromotePipeline(runId: string): Promise<void> {
  console.log(`Starting promotion pipeline for run ID: ${runId} / 실행 ID ${runId}에 대한 승급 파이프라인 시작`);

  // 1. Fetch confirmed decisions in this run
  // 1. 이번 실행에서 승인(confirmed) 판정을 받은 결정을 조회합니다.
  const decisions = await prisma.stagingDecision.findMany({
    where: {
      runId,
      decision: "confirmed",
    },
    include: {
      // Include staging facility record and its reservation methods
      // 스테이징 시설 레코드 및 예약 수단 후보들을 포함하여 가져옵니다.
      facilityRecord: {
        include: {
          reservations: true,
        },
      },
    },
  });

  for (const item of decisions) {
    const record = item.facilityRecord;
    if (!record) continue;

    try {
      // Strict check: only promote verified outdoor park golf facilities.
      // 스크린골프, 실내시설, 골프존, CC 등 비실외 파크골프장은 승급에서 원천 배제합니다.
      if (!isOutdoorParkGolf(record.name, record.rawText)) {
        console.log(`Skipping non-outdoor park golf promotion: ${record.name} / 비실외 파크골프 시설 승급 제외: ${record.name}`);
        continue;
      }

      const facilityType = "outdoor";

      // 2. Upsert to production Facility
      // 2. 프로덕션 Facility 테이블에 upsert를 수행합니다.
      // Before upserting facility, check if an existing facility with same name and province (or matching name and district) already exists
      // 다중 실행 멱등성을 위해 동일한 이름 및 시도/시군구를 가진 기존 시설이 있는지 확인합니다.
      const orConditions: Array<{ name: string; province?: string; district?: string; address?: string }> = [];
      if (record.name && record.province) {
        orConditions.push({ name: record.name, province: record.province });
      }
      if (record.name && record.district) {
        orConditions.push({ name: record.name, district: record.district });
      }
      if (orConditions.length === 0) {
        orConditions.push({ name: record.name, address: record.address });
      }

      let existingFacility: any = null;
      try {
        if (prisma.facility?.findFirst) {
          existingFacility = await prisma.facility.findFirst({
            where: {
              OR: orConditions,
            },
          });
        }
      } catch {
        existingFacility = null;
      }

      const targetFacilityId = existingFacility ? existingFacility.id : record.id;

      const facility = await prisma.facility.upsert({
        where: {
          // Identify uniquely by name and address
          // 이름과 주소를 기준으로 유일성을 식별합니다.
          id: targetFacilityId,
        },
        update: {
          name: record.name,
          address: record.address,
          province: record.province,
          district: record.district,
          regionKey: record.regionKey || "capital",
          facilityType,
          operatorName: record.operatorName || "기타",
          phone: record.phone,
          lat: record.lat || 37.5,
          lng: record.lng || 126.9,
          kakaoPlaceId: record.kakaoPlaceId,
          naverPlaceId: record.naverPlaceId,
          mapSearchQuery: record.mapSearchQuery,
          sourceName: "bot",
          sourceUrl: record.sourceUrl,
          lastCheckedAt: new Date(),
        },
        create: {
          id: targetFacilityId,
          name: record.name,
          address: record.address,
          province: record.province,
          district: record.district,
          regionKey: record.regionKey || "capital",
          facilityType,
          status: "active",
          ownership: "public",
          operatorName: record.operatorName || "기타",
          phone: record.phone,
          lat: record.lat || 37.5,
          lng: record.lng || 126.9,
          kakaoPlaceId: record.kakaoPlaceId,
          naverPlaceId: record.naverPlaceId,
          mapSearchQuery: record.mapSearchQuery,
          sourceName: "bot",
          sourceUrl: record.sourceUrl,
          lastCheckedAt: new Date(),
        },
      });

      // 3. Upsert Facility pricing details
      // 3. 시설 요금 상세 정보를 upsert합니다.
      await prisma.facilityPricing.upsert({
        where: { facilityId: facility.id },
        update: {
          baseFeeText: "무료 (추정) / Free (Est.)",
          feeType: "free",
        },
        create: {
          facilityId: facility.id,
          baseFeeText: "무료 (추정) / Free (Est.)",
          feeType: "free",
        },
      });

      // 4. Update reservation methods summary
      // 4. 예약 방식 요약 정보를 가공합니다.
      const summaryText = record.reservations.length > 0
        ? record.reservations.map((r) => r.methodText).join(" · ")
        : "예약 정보 확인 필요 / Reservation Check Required";

      const reservationInfo = await prisma.reservationInfo.upsert({
        where: { facilityId: facility.id },
        update: {
          summary: summaryText,
        },
        create: {
          facilityId: facility.id,
          summary: summaryText,
        },
      });

      // Clean old methods and add new ones
      // 기존 예약 수단을 삭제하고 새로 추가합니다.
      await prisma.reservationMethod.deleteMany({
        where: { reservationInfoId: reservationInfo.id },
      });

      for (const res of record.reservations) {
        await prisma.reservationMethod.create({
          data: {
            reservationInfoId: reservationInfo.id,
            methodType: res.methodType,
            methodText: res.methodText,
            priority: res.priority,
            ruleText: res.ruleText,
            url: res.url,
            notes: res.notes,
          },
        });
      }

      // 5. Store snapshot history
      // 5. 수집 이력 스냅샷을 저장합니다.
      await prisma.facilitySnapshot.create({
        data: {
          facilityId: facility.id,
          rawPayload: record.rawText,
        },
      });

    } catch (error) {
      console.error(`Failed to promote record ${record.name} / ${record.name} 승급 실패:`, error);
    }
  }

  console.log(`Successfully completed promotion for run ID: ${runId} / 실행 ID ${runId} 승급 완료`);
}
