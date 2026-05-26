import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

export interface PortalFieldMapping {
  name: string;              // Facility name / 시설명
  address: string;           // Address / 주소
  addressFallback?: string;  // Land lot address / 지번 주소
  operator?: string;         // Operator name / 운영/관리 기관
  phone?: string;            // Contact phone / 연락처
  holes?: string;            // Hole count / 홀수
  size?: string;             // Capacity/area size / 규모(면적)
  lat?: string;              // Latitude / 위도
  lng?: string;              // Longitude / 경도
  sportsItem?: string;       // Allowed sports items / 운동 가능 종목
}

export interface PortalDatasetConfig {
  name: string;
  url: string;
  endpoint: string;
  authKeyEnvVar?: string;
  defaultAuthKey?: string;
  isCustomOpenApi?: boolean;
  fields: PortalFieldMapping;
}

/**
 * 13 Active Public Datasets mapping configurations
 * 13개의 연동 대상 공공데이터 포털 및 지자체 API 설정 데이터
 */
export const PORTAL_DATASETS: PortalDatasetConfig[] = [
  {
    name: "seoul",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15113672/v1/uddi:79165a17-96e3-4d4e-9c5e-bec481767aa2",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시 설 명",
      address: "위 치",
      operator: "운영기관",
      holes: "홀수",
      size: "규 모"
    }
  },
  {
    name: "jeonbuk",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142226/v1/uddi:93a1de58-077c-4ffd-914b-b332c0def7f2",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "주소",
      operator: "시군",
      holes: "홀수",
      size: "면적(제곱미터)"
    }
  },
  {
    name: "jeonnam",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142153/v1/uddi:bfe56e8f-eee8-42b0-8435-dffc5117193f",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "파크골프장명",
      address: "주소",
      operator: "시군",
      holes: "홀수"
    }
  },
  {
    name: "gangwon",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142244/v1/uddi:700466fe-de6e-4a3b-8942-c9eed632d674",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "주소",
      phone: "연락처",
      holes: "홀 수",
      size: "규모(미터제곱)"
    }
  },
  {
    name: "gwangju",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142311/v1/uddi:3818ba97-807d-49c0-aa48-f06e0cf70647",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "위치",
      operator: "운영기관",
      phone: "연락처",
      holes: "홀수",
      size: "규모"
    }
  },
  {
    name: "gyeongbuk",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142265/v1/uddi:9a0a5066-7e1b-49b4-aa31-d3ffd94c8d9b",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "파크골프장명",
      address: "주소",
      operator: "운영기관",
      holes: "홀수"
    }
  },
  {
    name: "incheon",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142271/v1/uddi:d6406955-4d77-4920-b86b-d98e5c25e1d9",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "위치",
      operator: "운영기관",
      phone: "연락처",
      holes: "홀수",
      size: "규모"
    }
  },
  {
    name: "sejong",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142438/v1/uddi:3201ce12-2429-4fdd-ac85-e3d258ee7e31",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "주소",
      operator: "운영기관",
      phone: "연락처",
      holes: "홀수",
      size: "규모(제곱미터)"
    }
  },
  {
    name: "daegu",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142224/v1/uddi:687af8b6-4bde-4830-8b6f-95625e9e5849",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "파크골프장명",
      address: "파크골프장 주소",
      operator: "운영기관",
      phone: "연락처",
      holes: "파크골프장 홀수",
      size: "파크골프장 규모(제곱미터)"
    }
  },
  {
    name: "gyeongnam-geochang",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15113377/v1/uddi:3b4dbccc-7a72-468f-80bb-f92d85c2784f",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "소재지도로명주소",
      addressFallback: "소재지지번주소",
      operator: "관리기관",
      phone: "전화번호",
      holes: "규모(홀)",
      size: "면적(제곱미터)",
      lat: "위도",
      lng: "경도"
    }
  },
  {
    name: "gyeonggi-dream",
    url: "https://openapi.gg.go.kr",
    endpoint: "/PublicLivelihood",
    authKeyEnvVar: "GG_DREAM_API_KEY",
    defaultAuthKey: "sample",
    isCustomOpenApi: true,
    fields: {
      name: "FACLT_NM",
      address: "REFINE_ROADNM_ADDR",
      addressFallback: "REFINE_LOTNO_ADDR",
      operator: "MANAGE_MAINBD_NM",
      phone: "CONTCT_NO",
      lat: "REFINE_WGS84_LAT",
      lng: "REFINE_WGS84_LOGT",
      sportsItem: "GYM_POSBL_ITEM_CONT"
    }
  },
  {
    name: "eshare-portal",
    url: "https://www.eshare.go.kr",
    endpoint: "/eshare-openapi/rsrc/list/010500",
    authKeyEnvVar: "ESHARE_API_KEY",
    defaultAuthKey: "ee151322ffd13fe9af05130b433b9140",
    isCustomOpenApi: true,
    fields: {
      name: "rsrcNm",
      address: "addr",
      lat: "lat",
      lng: "lot"
    }
  },
  {
    name: "registered-sports",
    url: "https://apis.data.go.kr",
    endpoint: "/1741000/registered_sports_facilities/info",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    isCustomOpenApi: true,
    fields: {
      name: "FACLT_NM",
      address: "REFINE_ROADNM_ADDR",
      lat: "REFINE_WGS84_LAT",
      lng: "REFINE_WGS84_LOGT"
    }
  },
  {
    name: "comprehensive-sports",
    url: "https://apis.data.go.kr",
    endpoint: "/1741000/comprehensive_sports_facilities/info",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    isCustomOpenApi: true,
    fields: {
      name: "FACLT_NM",
      address: "REFINE_ROADNM_ADDR",
      lat: "REFINE_WGS84_LAT",
      lng: "REFINE_WGS84_LOGT"
    }
  }
];

/**
 * Adapter for all public data portal REST API datasets
 * 공공데이터포털 REST API를 통합 처리하는 범용 데이터 수집 어댑터
 */
export class PublicPortalAdapter implements SourceAdapter {
  name: string;
  kind: SourceKind;
  url: string;
  private config: PortalDatasetConfig;

  constructor(config: PortalDatasetConfig) {
    this.config = config;
    this.name = config.name;
    this.url = `${config.url}${config.endpoint}`;

    // Establish source kind mapping
    // 소스 데이터 소유 권력에 따른 유형 매핑
    if (this.name === "eshare-portal") {
      this.kind = "other";
    } else if (this.name === "registered-sports" || this.name === "comprehensive-sports") {
      this.kind = "mcst";
    } else {
      this.kind = "official";
    }
  }

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    // 1. Resolve API authentication key from environment or defaults
    // 1. 환경변수 또는 사전 설정된 인증키를 획득합니다.
    let apiKey = this.config.defaultAuthKey || "";
    if (this.config.authKeyEnvVar && process.env[this.config.authKeyEnvVar]) {
      apiKey = process.env[this.config.authKeyEnvVar]!;
    } else if (process.env.PORTAL_API_KEY) {
      apiKey = process.env.PORTAL_API_KEY;
    }

    const records: SourceRecord[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    console.log(`[PublicPortalAdapter] Fetching "${this.name}" dataset... / "${this.name}" 데이터셋 수집 시작...`);

    while (hasMore) {
      let requestUrl = "";

      if (this.config.isCustomOpenApi) {
        if (this.name === "gyeonggi-dream") {
          // Gyeonggi Data Dream format
          requestUrl = `${this.config.url}${this.config.endpoint}?KEY=${apiKey}&Type=json&pIndex=${page}&pSize=${perPage}`;
        } else if (this.name === "eshare-portal") {
          // 공유누리 API format
          requestUrl = `${this.config.url}${this.config.endpoint}/${apiKey}?pageNo=${page}&numOfRows=${perPage}`;
        } else {
          // Standard apis.data.go.kr REST format
          requestUrl = `${this.config.url}${this.config.endpoint}?pageNo=${page}&numOfRows=${perPage}&serviceKey=${apiKey}&type=json`;
        }
      } else {
        // Standard api.odcloud.kr Common Infuser format
        requestUrl = `${this.config.url}${this.config.endpoint}?page=${page}&perPage=${perPage}&serviceKey=${apiKey}`;
      }

      try {
        const response = await fetch(requestUrl, {
          method: "GET",
          headers: {
            "User-Agent": userAgent,
          },
        });

        if (!response.ok) {
          console.warn(`[PublicPortalAdapter] Failed request to "${this.name}" on page ${page} (status ${response.status}). Stopping. / "${this.name}" 데이터셋 ${page}페이지 호출 실패: ${response.status}`);
          break;
        }

        const data: any = await response.json();
        const rawRows = this.extractRows(data);

        if (rawRows.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of rawRows) {
          // Extract fields using mapping configuration
          // 매핑 설정을 활용한 개별 필드 추출
          const fields = this.config.fields;
          const rawName = item[fields.name] ? String(item[fields.name]).trim() : "";
          const rawAddress = item[fields.address]
            ? String(item[fields.address]).trim()
            : (fields.addressFallback && item[fields.addressFallback] ? String(item[fields.addressFallback]).trim() : "");
          const operatorName = fields.operator && item[fields.operator] ? String(item[fields.operator]).trim() : null;
          const phone = fields.phone && item[fields.phone] ? String(item[fields.phone]).trim() : null;
          const latVal = fields.lat && item[fields.lat] ? parseFloat(item[fields.lat]) : null;
          const lngVal = fields.lng && item[fields.lng] ? parseFloat(item[fields.lng]) : null;

          // 2. Filter sport classification if specified (Gyeonggi Data Dream, etc.)
          // 2. 특정 종목(스포츠명) 필터링이 필요할 경우 거릅니다.
          if (fields.sportsItem && item[fields.sportsItem]) {
            const sports = String(item[fields.sportsItem]).trim();
            if (!sports.includes("파크골프")) {
              continue; // Skip if not park golf / 파크골프 종목이 아니면 건너뜁니다.
            }
          }

          // Build raw text summary for hashing and screening
          // 해싱 및 검수용 원본 텍스트 구축
          const rawText = JSON.stringify(item);
          const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

          // Build reservation notes if holes or size is present
          // 홀수 또는 규모 정보를 모아 비고 텍스트 생성
          let extractedReservationText = "";
          if (fields.holes && item[fields.holes]) {
            extractedReservationText += `${String(item[fields.holes]).trim()}`;
          }
          if (fields.size && item[fields.size]) {
            if (extractedReservationText) extractedReservationText += " / ";
            extractedReservationText += `규모: ${String(item[fields.size]).trim()}`;
          }

          records.push({
            sourceName: this.name,
            sourceUrl: requestUrl,
            sourceKind: this.kind,
            contentHash,
            rawText,
            extractedName: rawName,
            extractedAddress: rawAddress,
            extractedOperatorName: operatorName,
            extractedPhone: phone,
            extractedReservationText: extractedReservationText || null,
          });
        }

        // Check if we hit the end of the pages
        // 페이지네이션 한도 검사
        if (rawRows.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error(`[PublicPortalAdapter] Error fetching dataset "${this.name}" page ${page}: / "${this.name}" 수집 중 에러 발생:`, error);
        hasMore = false; // Stop fetching on error to keep system stable
      }
    }

    console.log(`[PublicPortalAdapter] Finished "${this.name}". Collected ${records.length} records. / "${this.name}" 수집 완료: ${records.length}개 레코드 확보.`);
    return records;
  }

  /**
   * Helper to recursively extract data array from API responses
   * 다양한 형태의 API 응답 JSON에서 데이터 배열을 추출하는 헬퍼 함수
   */
  private extractRows(body: any): any[] {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (body.data && Array.isArray(body.data)) return body.data;

    // Check for Gyeonggi-style or Go.kr-style structure containing 'row'
    // Gyeonggi 또는 공공데이터포털 XML/JSON 변환 시 발생하는 'row' 키 탐색
    for (const key of Object.keys(body)) {
      const val = body[key];
      if (Array.isArray(val)) {
        // Gyeonggi Data Dream structure check
        const rowObj = val.find((item: any) => item && Array.isArray(item.row));
        if (rowObj) return rowObj.row;

        // If it's a direct array of objects
        if (val.length > 0 && typeof val[0] === "object") {
          return val;
        }
      }
    }
    return [];
  }
}
