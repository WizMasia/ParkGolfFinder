/**
 * Regional mapping grouping lookup table for UI tabs.
 * UI 탭 노출을 위한 광역자치단체별 6대 권역 그룹핑 매핑 테이블입니다.
 */
export const REGION_GROUPS = {
  capital: ["서울", "경기", "인천", "seoul", "gyeonggi", "incheon"],
  gangwon: ["강원", "gangwon"],
  chungcheong: ["충북", "충남", "대전", "세종", "chungbuk", "chungnam", "daejeon", "sejong"],
  honam: ["광주", "전북", "전남", "gwangju", "jeonbuk", "jeonnam"],
  yeongnam: ["부산", "대구", "울산", "경북", "경남", "busan", "daegu", "ulsan", "gyeongbuk", "gyeongnam"],
  jeju: ["제주", "jeju"],
} as const;
