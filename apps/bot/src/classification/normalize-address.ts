/**
 * Normalizes address by removing whitespace and mapping provinces to standard short keys.
 * 공백을 제거하고 광역자치단체를 표준 키로 매핑하여 주소를 정규화합니다.
 */
export function normalizeAddress(address: string): string {
  if (!address) return "";
  return address.trim().toLowerCase().replace(/[\s\-_,\.]/g, "");
}

/**
 * Extracts province and district from a raw Korean address.
 * 한국어 원시 주소로부터 광역권역(province) 및 시군구(district)를 추출합니다.
 */
export function parseAddressRegion(address: string): {
  province: string | null;
  district: string | null;
  regionKey: string | null;
} {
  if (!address) {
    return { province: null, district: null, regionKey: null };
  }

  const parts = address.trim().split(/\s+/);
  if (parts.length === 0) {
    return { province: null, district: null, regionKey: null };
  }

  let province: string | null = parts[0];
  let district: string | null = parts[1] || null;

  // Standardize province names
  // 광역 자치단체명을 표준화합니다.
  if (province.startsWith("서울")) {
    province = "서울";
  } else if (province.startsWith("경기")) {
    province = "경기";
  } else if (province.startsWith("인천")) {
    province = "인천";
  } else if (province.startsWith("강원")) {
    province = "강원";
  } else if (province.startsWith("충청북") || province.startsWith("충북")) {
    province = "충북";
  } else if (province.startsWith("충청남") || province.startsWith("충남")) {
    province = "충남";
  } else if (province.startsWith("대전")) {
    province = "대전";
  } else if (province.startsWith("세종")) {
    province = "세종";
  } else if (province.startsWith("전라북") || province.startsWith("전북")) {
    province = "전북";
  } else if (province.startsWith("전라남") || province.startsWith("전남")) {
    province = "전남";
  } else if (province.startsWith("경상북") || province.startsWith("경북")) {
    province = "경북";
  } else if (province.startsWith("경상남") || province.startsWith("경남")) {
    province = "경남";
  } else if (province.startsWith("대구")) {
    province = "대구";
  } else if (province.startsWith("부산")) {
    province = "부산";
  } else if (province.startsWith("울산")) {
    province = "울산";
  } else if (province.startsWith("광주")) {
    province = "광주";
  } else if (province.startsWith("제주")) {
    province = "제주";
  } else {
    province = null;
  }

  // Derive regionKey based on province mappings
  // province 매핑을 기반으로 regionKey를 도출합니다.
  let regionKey: string | null = null;
  if (province) {
    const capital = ["서울", "경기", "인천"];
    const chungcheong = ["충북", "충남", "대전", "sejong", "세종"];
    const honam = ["광주", "전북", "전남"];
    const yeongnam = ["부산", "대구", "울산", "경북", "경남"];
    const gangwon = ["강원"];
    const jeju = ["제주"];

    if (capital.includes(province)) regionKey = "capital";
    else if (chungcheong.includes(province)) regionKey = "chungcheong";
    else if (honam.includes(province)) regionKey = "honam";
    else if (yeongnam.includes(province)) regionKey = "yeongnam";
    else if (gangwon.includes(province)) regionKey = "gangwon";
    else if (jeju.includes(province)) regionKey = "jeju";
  }

  return { province, district, regionKey };
}
