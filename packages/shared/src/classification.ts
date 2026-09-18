/**
 * Clean outdoor park golf classifier and noise filtering logic.
 * 실외 정규 파크골프장 분류 및 스크린/실내/일반골프장 노이즈 필터링 로직.
 */

// Exclusion patterns: screen golf, driving ranges, country clubs, indoor facilities, golfzon brands
const EXCLUSION_PATTERNS: RegExp[] = [
  /골프존/i,
  /golfzon/i,
  /프렌즈스크린/i,
  /friends\s*screen/i,
  /sg\s*골프/i,
  /스크린/i,
  /screen/i,
  /실내/i,
  /indoor/i,
  /연습장/i,
  /driving\s*range/i,
  /드라이빙\s*레인지/i,
  /인도어/i,
  /아카데미/i,
  /academy/i,
  /컨트리클럽/i,
  /country\s*club/i,
  /골프클럽/i,
  /golf\s*club/i,
  /\bc\.?c\.?\b/i,
  /\bcc\b/i,
];

// Mandatory positive park golf keywords
const POSITIVE_PARK_GOLF_PATTERNS: RegExp[] = [
  /파크골프/,
  /파크\s*골프/,
  /park\s*golf/i,
  /parkgolf/i,
];

/**
 * Verifies whether the given venue name and optional description indicate a valid outdoor park golf course.
 * 스크린골프, 골프존, 골프연습장, 컨트리클럽(CC), 실내시설 등 노이즈를 엄격히 걸러내고,
 * 실외 정규 파크골프장 여부를 판별합니다.
 *
 * @param name Facility name / 시설 명칭
 * @param desc Optional description or details / 추가 설명 또는 상세 텍스트
 * @returns boolean True if verified outdoor park golf, false otherwise
 */
export function isOutdoorParkGolf(name: string, desc?: string): boolean {
  if (!name || name.trim() === "") {
    return false;
  }

  const combinedText = `${name} ${desc || ""}`;

  // 1. Check positive indicator: must have park golf keyword in name or description
  const hasPositiveKeyword = POSITIVE_PARK_GOLF_PATTERNS.some((pattern) =>
    pattern.test(combinedText)
  );
  if (!hasPositiveKeyword) {
    return false;
  }

  // 2. Strict noise filter: reject screen golf, indoor facilities, CC, driving ranges
  const hasExclusion = EXCLUSION_PATTERNS.some((pattern) =>
    pattern.test(combinedText)
  );
  if (hasExclusion) {
    return false;
  }

  return true;
}
