import proj4 from "proj4";
import { parseAddressRegion } from "./normalize-address.js";

// Define the coordinate system projection for EPSG:5179 (UTM-K GRS80)
// EPSG:5179(UTM-K GRS80) 좌표계 프로젝션 정의 등록
proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs");
proj4.defs("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");

/**
 * Standard coordinates for each province in South Korea (Fallback centroids)
 * 대한민국 각 광역자치단체별 대표 기준 좌표 (지오코딩 실패 시 활용)
 */
export const PROVINCE_FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  "서울": { lat: 37.5663, lng: 126.9779 }, // Seoul City Hall / 서울시청
  "부산": { lat: 35.1798, lng: 129.0750 }, // Busan City Hall / 부산시청
  "대구": { lat: 35.8714, lng: 128.6014 }, // Daegu City Hall / 대구시청
  "인천": { lat: 37.4563, lng: 126.7052 }, // Incheon City Hall / 인천시청
  "광주": { lat: 35.1601, lng: 126.8517 }, // Gwangju City Hall / 광주시청
  "대전": { lat: 36.3504, lng: 127.3848 }, // Daejeon City Hall / 대전시청
  "울산": { lat: 35.5389, lng: 129.3114 }, // Ulsan City Hall / 울산시청
  "세종": { lat: 36.4800, lng: 127.2890 }, // Sejong City Hall / 세종시청
  "경기": { lat: 37.2636, lng: 127.0286 }, // Gyeonggi Provincial Government / 경기도청
  "강원": { lat: 37.8853, lng: 127.7298 }, // Gangwon Provincial Government / 강원도청
  "충북": { lat: 36.6356, lng: 127.4913 }, // Chungbuk Provincial Government / 충북도청
  "충남": { lat: 36.6588, lng: 126.6728 }, // Chungnam Provincial Government / 충남도청
  "전북": { lat: 35.8204, lng: 127.1087 }, // Jeonbuk Provincial Government / 전북도청
  "전남": { lat: 34.8160, lng: 126.4629 }, // Jeonnam Provincial Government / 전남도청
  "경북": { lat: 36.5760, lng: 128.5056 }, // Gyeongbuk Provincial Government / 경북도청
  "경남": { lat: 35.2383, lng: 128.6924 }, // Gyeongnam Provincial Government / 경남도청
  "제주": { lat: 33.4890, lng: 126.4983 }, // Jeju Provincial Government / 제주도청
};

/**
 * Default coordinate when everything else fails (Seoul City Hall)
 * 모든 매핑이 실패했을 때의 기본 좌표 (서울시청)
 */
export const DEFAULT_COORDS = { lat: 37.5663, lng: 126.9779 };

/**
 * Returns fallback coordinates based on address province parsing.
 * 주소의 광역지자체를 분석하여 대체 대표 좌표를 반환합니다.
 */
export function getFallbackCoords(address: string): { lat: number; lng: number } {
  if (!address) return DEFAULT_COORDS;
  
  const parsed = parseAddressRegion(address);
  if (parsed.province && PROVINCE_FALLBACK_COORDS[parsed.province]) {
    return PROVINCE_FALLBACK_COORDS[parsed.province];
  }
  
  return DEFAULT_COORDS;
}

/**
 * Geocodes an address to WGS84 coordinates utilizing Juso Search API + Juso Coordinates API.
 * 도로명주소 검색 API와 좌표제공 API를 연속 호출하여 주소를 위경도 좌표로 변환합니다.
 */
export async function geocodeAddressWithJuso(
  address: string,
  userAgent: string
): Promise<{ lat: number; lng: number } | null> {
  const confirmKey = process.env.JUSO_COORD_CONFIRM_KEY || process.env.JUSO_CONFIRM_KEY;
  if (!confirmKey) {
    return null;
  }

  try {
    // 1. Search building detail components from Juso Search API
    // 1. 도로명주소 검색 API를 호출하여 건물 상세정보(admCd, rnMgtSn 등)를 획득합니다.
    const searchUrl = `https://business.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=1&keyword=${encodeURIComponent(address)}&confmKey=${confirmKey}&resultType=json`;
    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: { "User-Agent": userAgent }
    });

    if (!searchResponse.ok) return null;
    const searchData: any = await searchResponse.json();

    if (
      !searchData.results ||
      searchData.results.common.errorCode !== "0" ||
      !searchData.results.juso ||
      searchData.results.juso.length === 0
    ) {
      return null;
    }

    const juso = searchData.results.juso[0];
    const { admCd, rnMgtSn, udrtYn, buldMnnm, buldSlno } = juso;

    // 2. Fetch coordinates (entX, entY) from Juso Coordinates API
    // 2. 획득한 코드를 바탕으로 도로명주소 좌표제공 API를 호출합니다.
    const coordUrl = `https://business.juso.go.kr/addrlink/addrCoordApi.do?admCd=${admCd}&rnMgtSn=${rnMgtSn}&udrtYn=${udrtYn}&buldMnnm=${buldMnnm}&buldSlno=${buldSlno}&confmKey=${confirmKey}&resultType=json`;
    const coordResponse = await fetch(coordUrl, {
      method: "GET",
      headers: { "User-Agent": userAgent }
    });

    if (!coordResponse.ok) return null;
    const coordData: any = await coordResponse.json();

    if (
      !coordData.results ||
      coordData.results.common.errorCode !== "0" ||
      !coordData.results.juso ||
      coordData.results.juso.length === 0
    ) {
      return null;
    }

    const coordObj = coordData.results.juso[0];
    const entX = parseFloat(coordObj.entX);
    const entY = parseFloat(coordObj.entY);

    if (isNaN(entX) || isNaN(entY)) return null;

    // 3. Convert EPSG:5179 (GRS80 UTM-K) to EPSG:4326 (WGS84)
    // 3. proj4를 사용하여 GRS80 좌표를 WGS84 위경도로 변환합니다.
    const converted = proj4("EPSG:5179", "EPSG:4326", [entX, entY]);
    
    // proj4 returns [longitude, latitude] / proj4는 [경도, 위도]를 반환함
    const lng = converted[0];
    const lat = converted[1];

    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error(`[geocodeAddressWithJuso] Error geocoding address "${address}": / Juso 좌표 검색 에러:`, error);
    return null;
  }
}

/**
 * Geocodes an address string to coordinates using Kakao Map Local API.
 * 카카오맵 로컬 API를 활용하여 주소를 위경도 좌표로 변환합니다.
 */
export async function geocodeAddressWithKakao(
  address: string,
  userAgent: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!address || address.trim() === "") {
    return null;
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `KakaoAK ${apiKey}`,
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      console.error(`Kakao Geocoding API failed with status ${response.status} / 카카오 지오코딩 API 호출 실패: ${response.status}`);
      return null;
    }

    const data: any = await response.json();
    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      const lat = parseFloat(doc.y);
      const lng = parseFloat(doc.x);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to geocode address "${address}": / 주소 지오코딩 오류:`, error);
    return null;
  }
}

/**
 * Integrated geocoding dispatcher with fallback.
 * 통합 지오코딩 디스패처 및 대체 좌표 할당
 */
export async function geocodeAddress(
  address: string,
  userAgent: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim() === "") return null;

  // 1. Try Juso Coordinate API first
  // 1. 도로명주소 좌표제공 API를 우선 시도합니다.
  const jusoResult = await geocodeAddressWithJuso(address, userAgent);
  if (jusoResult) {
    return jusoResult;
  }

  // 2. Fallback to Kakao Map Local Search API
  // 2. 실패 시 카카오맵 로컬 API로 대체 시도합니다.
  const kakaoResult = await geocodeAddressWithKakao(address, userAgent);
  if (kakaoResult) {
    return kakaoResult;
  }

  return null;
}
