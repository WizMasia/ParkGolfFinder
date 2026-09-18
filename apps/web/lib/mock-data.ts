import { CURATED_SEED_FACILITIES } from "@parkgolf/db";

/**
 * Mock facilities dataset for local development and production demo fallback.
 * 로컬 개발 및 프로덕션 데모 폴백을 위한 파크골프 시설 모의 데이터셋입니다.
 * 7대 권역(서울, 경기, 강원, 충청, 호남, 영남, 제주)의 검증된 야외 공공 시설들이 포함됩니다.
 */
export const MOCK_FACILITIES = CURATED_SEED_FACILITIES.map((fac) => ({
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
  phone: fac.phone || null,
  lat: fac.lat,
  lng: fac.lng,
  sourceName: fac.sourceName,
  sourceUrl: fac.sourceUrl || null,
  lastCheckedAt: new Date("2026-05-25T00:00:00.000Z"),
  createdAt: new Date("2026-05-25T00:00:00.000Z"),
  updatedAt: new Date("2026-05-25T00:00:00.000Z"),
  pricing: {
    id: `price-${fac.id}`,
    facilityId: fac.id,
    baseFeeText: fac.pricing.baseFeeText,
    concessionFeeText: fac.pricing.concessionFeeText || null,
    feeType: fac.pricing.feeType,
  },
  reservation: {
    id: `res-${fac.id}`,
    facilityId: fac.id,
    summary: fac.reservation.summary,
    methods: fac.reservation.methods.map((m, idx) => ({
      id: `m-${fac.id}-${idx + 1}`,
      reservationInfoId: `res-${fac.id}`,
      methodType: m.methodType,
      methodText: m.methodText,
      priority: m.priority,
      ruleText: m.ruleText || null,
      url: m.url || null,
      notes: m.notes || null,
    })),
  },
}));
