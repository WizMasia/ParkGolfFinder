import { haversineKm } from "./distance";

/**
 * Data source types
 * 데이터 소스 종류
 */
export type SourceKind = "official" | "mcst" | "parkgolf24" | "kakao" | "other";

/**
 * Park golf eligibility verdict
 * 파크골프장 해당 여부 판정 결과
 */
export type ParkGolfVerdict = "confirmed" | "candidate" | "hidden";

/**
 * Duplicate status level
 * 중복 판정 수준
 */
export type DuplicateStatus = "exact" | "probable" | "ambiguous";

/**
 * Manual review decision type
 * 수동 검토 결정 종류
 */
export type ReviewDecision = "confirmed" | "candidate" | "hidden";

/**
 * Normalized facility candidate information
 * 정규화된 시설 후보 정보
 */
export interface NormalizedFacilityCandidate {
  contentHash: string;
  sourceName: string;
  sourceUrl: string;
  name: string;
  address: string;
  province: string | null;
  district: string | null;
  regionKey: string | null;
  operatorName: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  rawText: string;
  normalizedName: string;
  normalizedAddress: string;
  normalizedOperatorName: string | null;
  sourceKind: SourceKind;
}

/**
 * Duplicate cluster of facility candidates
 * 시설 후보군의 중복 클러스터
 */
export interface DuplicateCluster {
  duplicateStatus: DuplicateStatus;
  canonicalKey: string;
  memberKeys: string[];
  reason: string;
}

/**
 * Result of review verdict
 * 검토 판정 결과
 */
export interface ReviewVerdict {
  parkGolfVerdict: ParkGolfVerdict;
  decision: ReviewDecision;
  reason: string;
}

/**
 * Helper to get the weight of a candidate based on source authority.
 * 데이터 신뢰도(가중치)에 따라 소스 권위 점수를 반환합니다.
 */
export function getSourceWeight(candidate: NormalizedFacilityCandidate): number {
  if (candidate.sourceKind === "official" || candidate.sourceName === "official") {
    return 3;
  }
  if (candidate.sourceName === "eshare-portal" || candidate.sourceKind === "mcst") {
    return 2;
  }
  if (candidate.sourceKind === "kakao") {
    return 1;
  }
  return 0;
}

/**
 * Checks if the venue is a park golf venue based on search terms.
 * 검색어 기반으로 해당 시설이 파크골프장인지 검증합니다.
 */
export function isParkGolfVenue(input: {
  name: string;
  rawText: string;
  sourceName: string;
  sourceUrl: string;
}): boolean {
  const name = input.name;
  const rawText = input.rawText;

  // Screen park golf (indoor) should be allowed while generic screen golf is excluded.
  // 일반 스크린골프는 제외하지만, 실내/스크린 파크골프는 수집을 허용합니다.
  const isScreenParkGolf =
    name.includes("스크린파크") || rawText.includes("스크린파크") ||
    name.includes("스크린 파크") || rawText.includes("스크린 파크") ||
    name.includes("실내파크") || rawText.includes("실내파크") ||
    name.includes("실내 파크") || rawText.includes("실내 파크");

  // Screening out screen golf, practice ranges, and other normal golf clubs
  // 스크린 골프, 연습장, 아카데미 및 일반 골프장은 파크골프장에서 제외합니다. (스크린 파크골프는 예외)
  const hasExclusion =
    (!isScreenParkGolf && (name.includes("스크린") || rawText.includes("스크린"))) ||
    name.includes("연습장") ||
    name.includes("인도어") ||
    name.includes("아카데미");

  if (hasExclusion) {
    return false;
  }

  // Must have explicit keywords for park golf
  // 파크골프를 나타내는 명시적인 키워드가 반드시 포함되어야 합니다.
  const hasKeyword =
    name.includes("파크골프") ||
    rawText.includes("파크골프") ||
    name.toLowerCase().includes("park golf") ||
    name.toLowerCase().includes("parkgolf") ||
    rawText.toLowerCase().includes("park golf") ||
    rawText.toLowerCase().includes("parkgolf");

  if (!hasKeyword) {
    return false;
  }

  return true;
}

/**
 * Groups duplicate candidates based on naming, address similarity, and proximity.
 * 이름, 주소 유사도 및 위경도 인접도를 기준으로 중복되는 후보들을 그룹화합니다.
 */
export function clusterDuplicates(inputs: NormalizedFacilityCandidate[]): DuplicateCluster[] {
  const clusters: DuplicateCluster[] = [];
  const visited = new Set<string>();

  // Helper mapping to easily lookup candidates by hash
  // 해시로 후보를 빠르게 찾기 위한 매핑 사전
  const candidateMap = new Map<string, NormalizedFacilityCandidate>();
  for (const c of inputs) {
    candidateMap.set(c.contentHash, c);
  }

  for (let i = 0; i < inputs.length; i++) {
    const primary = inputs[i];
    const primaryKey = primary.contentHash;

    if (visited.has(primaryKey)) continue;

    const members: string[] = [primaryKey];
    visited.add(primaryKey);

    let status: DuplicateStatus = "exact";
    let reason = "Exact match by content hash / 콘텐츠 해시 완전 일치";

    for (let j = i + 1; j < inputs.length; j++) {
      const target = inputs[j];
      const targetKey = target.contentHash;

      if (visited.has(targetKey)) continue;

      let isDuplicate = false;

      // 1. Exact match
      // 1. 완전 일치 판정 (해시 또는 원본 링크 일치)
      if (
        primary.contentHash === target.contentHash ||
        (primary.sourceUrl && primary.sourceUrl === target.sourceUrl)
      ) {
        isDuplicate = true;
        status = "exact";
        reason = "Exact match by content hash or URL / 콘텐츠 해시 또는 URL 완전 일치";
      }
      // 2. Probable match by name and address
      // 2. 이름 및 주소 유사 일치 판정
      else if (
        primary.normalizedName === target.normalizedName &&
        primary.normalizedAddress === target.normalizedAddress
      ) {
        isDuplicate = true;
        status = "probable";
        reason = "Probable match by normalized name and address / 정규화된 이름 및 주소 유사 일치";
      }
      // 3. Proximity and name similarity (Within 100m)
      // 3. 위경도 인접도(100m 이내) 및 이름 유사도 판정
      else if (
        primary.lat !== null && primary.lng !== null &&
        target.lat !== null && target.lng !== null
      ) {
        const dist = haversineKm(
          { lat: primary.lat, lng: primary.lng },
          { lat: target.lat, lng: target.lng }
        );

        if (dist <= 0.1) { // 100m
          // Check if names are similar (one contains another, or exact match)
          const nameMatch =
            primary.normalizedName === target.normalizedName ||
            primary.normalizedName.includes(target.normalizedName) ||
            target.normalizedName.includes(primary.normalizedName);

          if (nameMatch) {
            isDuplicate = true;
            status = "probable";
            reason = "Probable match by coordinates proximity (under 100m) and naming similarity / 100m 이내 인접 및 명칭 유사 일치";
          }
        }
      }

      if (isDuplicate) {
        members.push(targetKey);
        visited.add(targetKey);
      }
    }

    if (members.length > 1) {
      // Find the best canonical candidate based on source authority and completeness
      // 소스 신뢰도 가중치 및 필드 충실도 기준으로 가장 적절한 대표(Canonical) 레코드를 선정합니다.
      const sortedMembers = [...members].sort((aId, bId) => {
        const a = candidateMap.get(aId)!;
        const b = candidateMap.get(bId)!;

        const weightA = getSourceWeight(a);
        const weightB = getSourceWeight(b);

        if (weightA !== weightB) {
          return weightB - weightA; // Higher weight first
        }

        // Tie breaker 1: has phone
        const hasPhoneA = a.phone ? 1 : 0;
        const hasPhoneB = b.phone ? 1 : 0;
        if (hasPhoneA !== hasPhoneB) {
          return hasPhoneB - hasPhoneA;
        }

        // Tie breaker 2: has coordinates
        const hasCoordsA = (a.lat !== null && a.lng !== null) ? 1 : 0;
        const hasCoordsB = (b.lat !== null && b.lng !== null) ? 1 : 0;
        if (hasCoordsA !== hasCoordsB) {
          return hasCoordsB - hasCoordsA;
        }

        return aId.localeCompare(bId);
      });

      clusters.push({
        duplicateStatus: status,
        canonicalKey: sortedMembers[0],
        memberKeys: members,
        reason,
      });
    }
  }

  return clusters;
}
