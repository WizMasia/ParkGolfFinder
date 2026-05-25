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

  // Screening out screen golf or ordinary golf clubs
  // 스크린 골프 및 일반 골프장은 파크골프장에서 제외합니다.
  if (name.includes("스크린골프") || rawText.includes("스크린골프")) {
    return false;
  }

  // Must have explicit keywords for park golf
  // 파크골프를 나타내는 명시적인 키워드가 반드시 포함되어야 합니다.
  const hasKeyword =
    name.includes("파크골프") ||
    rawText.includes("파크골프") ||
    name.toLowerCase().includes("park golf") ||
    rawText.toLowerCase().includes("park golf");

  if (!hasKeyword) {
    return false;
  }

  return true;
}

/**
 * Groups duplicate candidates based on naming and address similarity.
 * 이름 및 주소 유사도를 기준으로 중복되는 후보들을 그룹화합니다.
 */
export function clusterDuplicates(inputs: NormalizedFacilityCandidate[]): DuplicateCluster[] {
  const clusters: DuplicateCluster[] = [];
  const visited = new Set<string>();

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

      // Exact match
      // 완전 일치 판정
      if (
        primary.contentHash === target.contentHash ||
        (primary.sourceUrl && primary.sourceUrl === target.sourceUrl)
      ) {
        members.push(targetKey);
        visited.add(targetKey);
      }
      // Probable match by name and address
      // 이름 및 주소 유사 일치 판정
      else if (
        primary.normalizedName === target.normalizedName &&
        primary.normalizedAddress === target.normalizedAddress
      ) {
        members.push(targetKey);
        visited.add(targetKey);
        status = "probable";
        reason = "Probable match by normalized name and address / 정규화된 이름 및 주소 유사 일치";
      }
    }

    if (members.length > 1) {
      clusters.push({
        duplicateStatus: status,
        canonicalKey: primaryKey,
        memberKeys: members,
        reason,
      });
    }
  }

  return clusters;
}
