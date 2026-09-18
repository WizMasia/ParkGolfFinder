/**
 * Regional mapping grouping lookup table for UI tabs.
 * UI 탭 노출을 위한 광역자치단체별 6대 권역 그룹핑 매핑 테이블입니다.
 */
export const REGION_GROUPS = {
  capital: ["capital", "서울", "경기", "인천", "seoul", "gyeonggi", "incheon"],
  gangwon: ["gangwon", "강원"],
  chungcheong: ["chungcheong", "충북", "충남", "대전", "세종", "chungbuk", "chungnam", "daejeon", "sejong"],
  honam: ["honam", "광주", "전북", "전남", "gwangju", "jeonbuk", "jeonnam"],
  yeongnam: ["yeongnam", "부산", "대구", "울산", "경북", "경남", "busan", "daegu", "ulsan", "gyeongbuk", "gyeongnam"],
  jeju: ["jeju", "제주"],
} as const;

export type RegionKey = keyof typeof REGION_GROUPS;

/**
 * Classifies province/district into one of the 6 canonical regions.
 * 광역자치단체(province) 및 시군구(district)를 6대 표준 권역 키로 분류합니다.
 */
export function classifyRegion(province: string, _district?: string): RegionKey {
  if (!province) return "capital";
  const p = province.trim().toLowerCase();

  // Capital: 서울, 경기, 인천
  if (p.includes("서울") || p.includes("경기") || p.includes("인천") || p.includes("seoul") || p.includes("gyeonggi") || p.includes("incheon")) {
    return "capital";
  }
  // Gangwon: 강원
  if (p.includes("강원") || p.includes("gangwon")) {
    return "gangwon";
  }
  // Chungcheong: 충북, 충남, 충청, 대전, 세종
  if (
    p.includes("충북") ||
    p.includes("충남") ||
    p.includes("충청") ||
    p.includes("대전") ||
    p.includes("세종") ||
    p.includes("chung") ||
    p.includes("daejeon") ||
    p.includes("sejong")
  ) {
    return "chungcheong";
  }
  // Honam: 광주, 전북, 전남, 전라
  if (
    p.includes("광주") ||
    p.includes("전북") ||
    p.includes("전남") ||
    p.includes("전라") ||
    p.includes("gwangju") ||
    p.includes("jeon")
  ) {
    return "honam";
  }
  // Yeongnam: 부산, 대구, 울산, 경북, 경남, 경상
  if (
    p.includes("부산") ||
    p.includes("대구") ||
    p.includes("울산") ||
    p.includes("경북") ||
    p.includes("경남") ||
    p.includes("경상") ||
    p.includes("busan") ||
    p.includes("daegu") ||
    p.includes("ulsan") ||
    p.includes("gyeongbuk") ||
    p.includes("gyeongnam")
  ) {
    return "yeongnam";
  }
  // Jeju: 제주
  if (p.includes("제주") || p.includes("jeju")) {
    return "jeju";
  }

  return "capital";
}
