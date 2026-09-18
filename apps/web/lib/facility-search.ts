import { FacilitySummary, FeeType, haversineKm, REGION_GROUPS } from "@parkgolf/shared";
import { SEOUL_CITY_HALL } from "./seoul-fallback";

/**
 * Interface parameter configuration for rankFacilities
 * rankFacilities 함수의 파라미터 구성 인터페이스
 */
export interface SearchFilterInput {
  facilities: FacilitySummary[];
  query: string;
  regionGroup: "capital" | "gangwon" | "chungcheong" | "honam" | "yeongnam" | "jeju" | null;
  distanceKm: number;
  currentLocation: { lat: number; lng: number } | null;
  concessionOn: boolean;
  feeFilter: FeeType | null;
}

/**
 * Filter, calculate distance, sort, and rank facilities.
 * 파크골프 시설 리스트를 필터링하고 거리를 계산하여 정렬 및 순위를 매깁니다.
 */
export function rankFacilities(input: SearchFilterInput): FacilitySummary[] {
  const {
    facilities,
    query,
    regionGroup,
    distanceKm,
    currentLocation,
    feeFilter,
  } = input;

  const basePoint = currentLocation || { lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng };

  // 1. Resolve target region keys
  // 1. 대상 권역의 regionKey 집합을 분석합니다.
  let allowedRegionKeys: string[] = [];
  if (regionGroup && REGION_GROUPS[regionGroup]) {
    allowedRegionKeys = REGION_GROUPS[regionGroup] as unknown as string[];
  }

  // 2. Map distances and filter active candidates
  // 2. 거리를 매핑하고 활성 상태 후보군을 필터링합니다.
  const processed = facilities
    .filter((f) => f.status === "active")
    .map((f) => {
      const dist = haversineKm(basePoint, { lat: f.lat, lng: f.lng });
      return {
        ...f,
        distanceKm: Math.round(dist * 10) / 10, // Round to 1 decimal place / 소수점 첫째 자리 반올림
      };
    });

  // 3. Filter by search query, region, fee type, etc.
  // 3. 검색 쿼리, 지역권역, 요금 유형에 맞춰 필터를 적용합니다.
  let filtered = processed.filter((f) => {
    // 3a. Search text match
    // 3a. 검색 텍스트 일치 검사
    if (query) {
      const q = query.toLowerCase();
      const nameMatch = f.name.toLowerCase().includes(q);
      const addrMatch = f.address.toLowerCase().includes(q);
      const optMatch = (f.operatorName || "").toLowerCase().includes(q);
      if (!nameMatch && !addrMatch && !optMatch) return false;
    }

    // 3b. Region key match
    // 3b. 권역 일치 검사
    if (allowedRegionKeys.length > 0) {
      if (!allowedRegionKeys.includes(f.regionKey)) return false;
    }

    // 3c. Fee type match
    // 3c. 요금 조건 검사
    if (feeFilter) {
      // Determine fee category type
      // 요금 카테고리 종류를 유추합니다.
      const feeText = f.baseFeeText.toLowerCase();
      let derivedFeeType: FeeType = "paid";

      if (feeText.includes("무료") || feeText.includes("free")) {
        derivedFeeType = "free";
      } else if (feeText.includes("부분") || feeText.includes("partial")) {
        derivedFeeType = "partial";
      } else if (feeText.includes("문의") || feeText.includes("inquiry")) {
        derivedFeeType = "inquiry";
      }

      if (derivedFeeType !== feeFilter) return false;
    }

    return true;
  });

  // 4. Distance constraint filter
  // 4. 거리 제약 필터 적용
  let inRange = filtered.filter((f) => f.distanceKm! <= distanceKm);

  // 5. Sort by distance, then name
  // 5. 거리 오름차순, 이름 오름차순으로 정렬
  const sortFn = (a: any, b: any) => {
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm! - b.distanceKm!;
    }
    return a.name.localeCompare(b.name, "ko");
  };

  inRange.sort(sortFn);

  // Fallback: If no records are within range, return the nearest 10 sorted
  // 예외 처리: 범위 내에 시설이 없을 시, 가장 가까운 10개 시설을 정렬하여 돌려줍니다.
  if (inRange.length === 0) {
    filtered.sort(sortFn);
    return filtered.slice(0, 10);
  }

  return inRange;
}
