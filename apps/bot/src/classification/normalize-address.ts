/**
 * Normalizes address by removing whitespace and mapping provinces to standard short keys.
 * 공백을 제거하고 광역자치단체를 표준 키로 매핑하여 주소를 정규화합니다.
 */
export function normalizeAddress(address: string): string {
  if (!address) return "";
  return address.trim().toLowerCase().replace(/[\s\-_,\.]/g, "");
}

/**
 * Extracts province and district from a raw Korean address using local regex.
 * 로컬 정규식을 활용하여 한국어 원시 주소로부터 광역권역(province) 및 시군구(district)를 추출합니다.
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

/**
 * Standardizes raw address and extracts regions utilizing the government Juso Search API.
 * 행정안전부 도로명주소 검색 API를 호출하여 주소를 표준화하고 행정구역 정보를 파싱합니다.
 */
export async function normalizeAddressAndRegion(
  address: string,
  userAgent: string
): Promise<{
  standardizedAddress: string | null;
  province: string | null;
  district: string | null;
  regionKey: string | null;
}> {
  const confirmKey = process.env.JUSO_CONFIRM_KEY;
  if (!confirmKey) {
    console.warn("Juso API key is not configured. Falling back to local parser. / 도로명주소 API 키가 설정되지 않아 로컬 파서를 사용합니다.");
    return { standardizedAddress: null, ...parseAddressRegion(address) };
  }

  if (!address || address.trim() === "") {
    return { standardizedAddress: null, province: null, district: null, regionKey: null };
  }

  try {
    const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=1&keyword=${encodeURIComponent(address)}&confmKey=${confirmKey}&resultType=json`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      console.error(`Juso API failed with status ${response.status} / 도로명주소 API 호출 실패: ${response.status}`);
      return { standardizedAddress: null, ...parseAddressRegion(address) };
    }

    const data: any = await response.json();
    const results = data.results;

    if (results && results.common && results.common.errorCode === "0" && results.juso && results.juso.length > 0) {
      const juso = results.juso[0];
      const standardizedAddress = juso.roadAddrPart1; // Use clean road name address / 정제된 도로명주소 사용
      
      // Standardize the province name using local standard map
      // 반환된 시도명(siNm)을 로컬 표준 규격에 맞게 매핑합니다.
      const regionData = parseAddressRegion(juso.siNm + " " + (juso.sggNm || ""));

      return {
        standardizedAddress,
        province: regionData.province,
        district: juso.sggNm || null,
        regionKey: regionData.regionKey,
      };
    }

    // Fallback if no juso found
    // 검색 결과가 없는 경우 로컬 파서 활용
    return { standardizedAddress: null, ...parseAddressRegion(address) };
  } catch (error) {
    console.error(`Failed to call Juso API for "${address}": / 도로명주소 API 호출 중 에러 발생:`, error);
    return { standardizedAddress: null, ...parseAddressRegion(address) };
  }
}
