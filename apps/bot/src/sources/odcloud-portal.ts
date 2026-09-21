import crypto from "crypto";
import { isOutdoorParkGolf } from "@parkgolf/shared";
import { SourceAdapter, SourceRecord } from "./source-types.js";

/**
 * Resolves ODCloud API Authentication key.
 * Prioritizes environment variables (DATA_GO_KR_API_KEY, ODCLOUD_API_KEY) over hardcoded default fallback.
 * 공공데이터 포털 인증키를 환경변수에서 우선 해석하며, 없을 경우에만 대체 기본키를 참조합니다.
 */
export function resolveOdcloudApiKey(explicitKey?: string): string {
  return (
    explicitKey ||
    process.env.DATA_GO_KR_API_KEY ||
    process.env.ODCLOUD_API_KEY ||
    "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1"
  );
}

export const ODCLOUD_DEFAULT_AUTH_KEY = resolveOdcloudApiKey();

/**
 * Normalized raw facility payload returned by ODCloud portal
 * ODCloud 포털에서 추출된 정규화 시설 페이로드
 */
export interface RawFacilityPayload {
  name: string;
  address: string;
  operator: string | null;
  holes: number | null;
  lat: number | null;
  lng: number | null;
  rawRecord?: Record<string, any>;
}

/**
 * ODCloud dataset endpoint definition
 * ODCloud 데이터셋 엔드포인트 정의
 */
export interface OdcloudEndpointConfig {
  name: string;
  endpoint: string;
  description: string;
}

/**
 * Verified ODCloud UDDI endpoints for official park golf datasets across Korea
 * 전국 지방자치단체 및 공공기관의 공식 파크골프 데이터셋 UDDI 엔드포인트 목록
 */
export const ODCLOUD_ENDPOINTS: OdcloudEndpointConfig[] = [
  {
    name: "seoul-odcloud",
    endpoint: "/15113672/v1/uddi:79165a17-96e3-4d4e-9c5e-bec481767aa2",
    description: "서울시 파크골프장 현황",
  },
  {
    name: "jeonbuk-odcloud",
    endpoint: "/15142226/v1/uddi:93a1de58-077c-4ffd-914b-b332c0def7f2",
    description: "전북 파크골프장 정보",
  },
  {
    name: "jeonnam-odcloud",
    endpoint: "/15142153/v1/uddi:bfe56e8f-eee8-42b0-8435-dffc5117193f",
    description: "전남 파크골프장 정보",
  },
  {
    name: "gangwon-odcloud",
    endpoint: "/15142244/v1/uddi:700466fe-de6e-4a3b-8942-c9eed632d674",
    description: "강원도 파크골프장 정보",
  },
  {
    name: "gwangju-odcloud",
    endpoint: "/15142311/v1/uddi:3818ba97-807d-49c0-aa48-f06e0cf70647",
    description: "광주광역시 파크골프장 정보",
  },
  {
    name: "gyeongbuk-odcloud",
    endpoint: "/15142265/v1/uddi:9a0a5066-7e1b-49b4-aa31-d3ffd94c8d9b",
    description: "경북 파크골프장 정보",
  },
  {
    name: "incheon-odcloud",
    endpoint: "/15142271/v1/uddi:d6406955-4d77-4920-b86b-d98e5c25e1d9",
    description: "인천광역시 파크골프장 정보",
  },
  {
    name: "sejong-odcloud",
    endpoint: "/15142438/v1/uddi:3201ce12-2429-4fdd-ac85-e3d258ee7e31",
    description: "세종특별자치시 파크골프장 정보",
  },
  {
    name: "daegu-odcloud",
    endpoint: "/15142224/v1/uddi:687af8b6-4bde-4830-8b6f-95625e9e5849",
    description: "대구광역시 파크골프장 정보",
  },
  {
    name: "gyeongnam-geochang-odcloud",
    endpoint: "/15113377/v1/uddi:3b4dbccc-7a72-468f-80bb-f92d85c2784f",
    description: "경남 거창군 파크골프장 정보",
  },
];

const BASE_URL = "https://api.odcloud.kr/api";

/**
 * Parses holes count from string or number.
 * 예: 18 -> 18, "18홀" -> 18, "36" -> 36, "9+9홀" -> 18
 */
export function parseHolesCount(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return !isNaN(value) && value > 0 ? value : null;
  }

  const str = String(value).trim();
  if (!str) return null;

  // Handle formats like "9+9홀", "9 + 9"
  if (str.includes("+")) {
    const parts = str.split("+").map((p) => parseInt(p.replace(/[^0-9]/g, ""), 10));
    if (parts.every((n) => !isNaN(n) && n > 0)) {
      return parts.reduce((acc, curr) => acc + curr, 0);
    }
  }

  // Prioritize matching (\d+)\s*홀: e.g. "1코스 18홀" -> 18, "규모: 27홀" -> 27
  const holeMatch = str.match(/(\d+)\s*홀/);
  if (holeMatch) {
    const parsed = parseInt(holeMatch[1], 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }

  // Extract first digit group: e.g. "18홀", "규모: 27홀", "54홀(A,B,C,D,E,F)"
  const match = str.match(/(\d+)/);
  if (match) {
    const parsed = parseInt(match[1], 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

/**
 * Finds value from item given multiple possible Korean key names
 */
function findValue(item: Record<string, any>, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== "") {
      return item[key];
    }
  }
  // Try case/whitespace-insensitive lookup
  const normalizedMap = new Map<string, string>();
  for (const actualKey of Object.keys(item)) {
    normalizedMap.set(actualKey.replace(/\s+/g, "").toLowerCase(), actualKey);
  }
  for (const key of possibleKeys) {
    const compact = key.replace(/\s+/g, "").toLowerCase();
    if (normalizedMap.has(compact)) {
      const actualKey = normalizedMap.get(compact)!;
      if (item[actualKey] !== undefined && item[actualKey] !== null && String(item[actualKey]).trim() !== "") {
        return item[actualKey];
      }
    }
  }
  return null;
}

/**
 * Maps an ODCloud JSON row into a normalized RawFacilityPayload.
 * Filters out non-outdoor park golf venues (screen golf, cc, driving range).
 */
export function mapOdcloudItemToRawFacility(item: Record<string, any>): RawFacilityPayload | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const rawName = findValue(item, [
    "시설명",
    "시 설 명",
    "파크골프장명",
    "파크골프장 명",
    "체육시설명",
    "FACLT_NM",
  ]);
  const name = rawName ? String(rawName).trim() : "";
  if (!name) {
    return null;
  }

  const rawAddress = findValue(item, [
    "소재지도로명주소",
    "도로명주소",
    "소재지 도로명주소",
    "위치",
    "위 치",
    "주소",
    "파크골프장 주소",
    "소재지지번주소",
    "지번주소",
    "REFINE_ROADNM_ADDR",
  ]);
  const address = rawAddress ? String(rawAddress).trim() : "";

  const rawFacilityType = findValue(item, [
    "시설유형",
    "시설종류",
    "체육시설종류",
    "업종",
  ]);
  const facilityTypeDesc = rawFacilityType ? String(rawFacilityType).trim() : undefined;

  // Strict check using isOutdoorParkGolf from packages/shared
  // Do NOT pass full street address into noise check to avoid false positives (e.g. "아카데미로", "(실내체육관 옆)").
  // Only pass facility-type/description if available.
  if (!isOutdoorParkGolf(name, facilityTypeDesc)) {
    return null;
  }

  const rawOperator = findValue(item, [
    "관리기관명",
    "관리기관",
    "운영기관",
    "운영기관명",
    "시군",
    "시·군",
    "관리부서",
  ]);
  const operator = rawOperator ? String(rawOperator).trim() : null;

  const rawHoles = findValue(item, [
    "홀수",
    "홀 수",
    "규모(홀)",
    "파크골프장 홀수",
    "홀수(홀)",
  ]);
  const holes = parseHolesCount(rawHoles);

  const rawLat = findValue(item, ["위도", "lat", "REFINE_WGS84_LAT"]);
  const rawLng = findValue(item, ["경도", "lng", "lot", "REFINE_WGS84_LOGT"]);
  const lat = rawLat ? parseFloat(rawLat) : null;
  const lng = rawLng ? parseFloat(rawLng) : null;

  return {
    name,
    address,
    operator,
    holes,
    lat: lat && !isNaN(lat) ? lat : null,
    lng: lng && !isNaN(lng) ? lng : null,
    rawRecord: item,
  };
}

/**
 * Fetches and normalizes records from a single ODCloud endpoint
 */
export async function fetchOdcloudPortalRecords(
  endpointConfig: OdcloudEndpointConfig,
  options?: { apiKey?: string; userAgent?: string; perPage?: number }
): Promise<RawFacilityPayload[]> {
  const apiKey = resolveOdcloudApiKey(options?.apiKey);
  const userAgent = options?.userAgent || "ParkGolfFinderBot/1.0";
  const perPage = options?.perPage || 100;

  const results: RawFacilityPayload[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${BASE_URL}${endpointConfig.endpoint}?page=${page}&perPage=${perPage}&serviceKey=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(10000),
        headers: {
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) {
        console.warn(`[ODCloud] Failed to fetch ${endpointConfig.name} on page ${page}: status ${response.status}`);
        break;
      }

      const json: any = await response.json();
      const rows: any[] = Array.isArray(json?.data) ? json.data : [];

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const row of rows) {
        const mapped = mapOdcloudItemToRawFacility(row);
        if (mapped) {
          results.push(mapped);
        }
      }

      if (rows.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error(`[ODCloud] Error fetching ${endpointConfig.name} on page ${page}:`, error);
      hasMore = false;
    }
  }

  return results;
}

/**
 * OdcloudPortalAdapter implements the SourceAdapter interface for the bot pipeline.
 * Collects data across official ODCloud datasets with default zero-key configuration.
 */
export class OdcloudPortalAdapter implements SourceAdapter {
  name = "odcloud-portal";
  kind = "official" as const;
  url = BASE_URL;

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    const apiKey = resolveOdcloudApiKey();
    const records: SourceRecord[] = [];

    console.log(`[OdcloudPortalAdapter] Fetching verified official datasets from ODCloud...`);

    for (const endpoint of ODCLOUD_ENDPOINTS) {
      try {
        const facilities = await fetchOdcloudPortalRecords(endpoint, {
          apiKey,
          userAgent,
        });

        for (const fac of facilities) {
          const rawText = JSON.stringify(fac.rawRecord || fac);
          const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

          const reservationText = fac.holes ? `${fac.holes}홀` : null;

          records.push({
            sourceName: endpoint.name,
            sourceUrl: `${BASE_URL}${endpoint.endpoint}`,
            sourceKind: this.kind,
            contentHash,
            rawText,
            extractedName: fac.name,
            extractedAddress: fac.address,
            extractedOperatorName: fac.operator,
            extractedPhone: null,
            extractedReservationText: reservationText,
          });
        }
      } catch (err) {
        console.error(`[OdcloudPortalAdapter] Error in endpoint ${endpoint.name}:`, err);
      }
    }

    console.log(`[OdcloudPortalAdapter] Collected ${records.length} official records.`);
    return records;
  }
}
