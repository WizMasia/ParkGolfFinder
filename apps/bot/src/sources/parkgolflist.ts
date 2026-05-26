import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Prefix map to resolve province name based on parkgolflist.com URL path
 * parkgolflist.com URL 경로를 기반으로 한글 시도(광역) 명칭을 해석하기 위한 사전
 */
const PATH_PROVINCE_MAP: Record<string, string> = {
  "seoul/": "서울특별시",
  "gyeonggi/": "경기도",
  "incheon/": "인천광역시",
  "busan/": "부산광역시",
  "ulsan": "울산광역시",
  "gyeongnam/": "경상남도",
  "gyeongbuk/": "경상북도",
  "daegu/": "대구광역시",
  "gangwon/": "강원특별자치도",
  "daejeon/": "대전광역시",
  "chungnam/": "충청남도",
  "chungbuk/": "충청북도",
  "gwangju/": "광주광역시",
  "jeonnam/": "전라남도",
  "jeonbuk/": "전북특별자치도",
  "jeju/": "제주특별자치도",
};

/**
 * Adapter for Park Golf List Pages (parkgolflist.com)
 * 전국 파크골프장 현황 리스트 수집 어댑터
 */
export class ParkGolfListAdapter implements SourceAdapter {
  name = "parkgolflist";
  kind: SourceKind = "other";
  url = "https://parkgolflist.com";

  // URL sub-paths for different provinces
  // 시도별 수집 대상 하위 경로 목록
  private paths: string[] = [
    "seoul/", "gyeonggi/", "incheon/", "busan/", "ulsan",
    "gyeongnam/", "gyeongbuk/", "daegu/", "gangwon/", "daejeon/",
    "chungnam/", "chungbuk/", "gwangju/", "jeonnam/", "jeonbuk/", "jeju/"
  ];

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    const records: SourceRecord[] = [];
    console.log(`[ParkGolfListAdapter] Starting to fetch ${this.paths.length} provincial pages... / 파크골프장리스트 닷컴 ${this.paths.length}개 지역 수집 시작...`);

    for (const path of this.paths) {
      const targetUrl = `${this.url}/${path}`;
      const province = PATH_PROVINCE_MAP[path] || "";

      try {
        const response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "User-Agent": userAgent,
          },
        });

        if (!response.ok) {
          console.warn(`[ParkGolfListAdapter] Failed fetching path ${path} (status: ${response.status}). / 경로 ${path} 호출 실패: ${response.status}`);
          continue;
        }

        const html = await response.text();

        // Extract table content using Regex
        // HTML 내의 테이블 영역을 정규식으로 안전하게 추출합니다.
        const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
        if (!tableMatch) {
          console.warn(`[ParkGolfListAdapter] No table found for path ${path}. / 경로 ${path}에서 테이블을 찾지 못했습니다.`);
          continue;
        }

        const tableHtml = tableMatch[1];

        // Find tr blocks
        // 각 로우 행들을 파싱합니다.
        const trMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
        if (!trMatches) continue;

        for (const trHtml of trMatches) {
          // Extract td cells in the row
          // 각 로우 안의 td 셀들을 추출합니다.
          const tdMatches = trHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          if (!tdMatches || tdMatches.length < 3) continue;

          // Strip HTML tags and entities helper
          // HTML 태그 및 스페이스 엔티티를 정제하는 헬퍼 함수
          const cleanText = (htmlStr: string): string => {
            return htmlStr
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/gi, " ")
              .replace(/&amp;/gi, "&")
              .replace(/\s+/g, " ")
              .trim();
          };

          const cells = tdMatches.map(cleanText);

          // Skip header row
          // '구장명', '지역', '홀 수', '블로그 후기'와 같은 헤더 행은 패스합니다.
          if (cells.includes("구장명") || cells.includes("지역") || cells.includes("홀 수")) {
            continue;
          }

          const name = cells[0];
          const sigungu = cells[1];
          const capacity = cells[2];

          // Skip empty row or placeholders
          // 내용이 비었거나 무의미한 로우는 제외합니다.
          if (!name || name === " " || name === "-" || name.includes("구장명")) continue;

          // Standardize address using resolved province and sigungu district
          // 시도명과 구청(시군구)명을 합해 1차 지오코딩 및 주소 표준화 주소지를 생성합니다.
          const address = sigungu ? `${province} ${sigungu}` : province;

          const item = {
            province,
            sigungu,
            name,
            address,
            capacity,
          };

          const rawText = JSON.stringify(item);
          const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

          records.push({
            sourceName: this.name,
            sourceUrl: targetUrl,
            sourceKind: this.kind,
            contentHash,
            rawText,
            extractedName: name,
            extractedAddress: address,
            extractedOperatorName: "기타",
            extractedPhone: null,
            extractedReservationText: capacity ? `${capacity}홀` : null,
          });
        }

      } catch (error) {
        console.error(`[ParkGolfListAdapter] Error processing path ${path}: / 경로 ${path} 처리 중 에러:`, error);
      }

      // Respectful delay between web requests
      // 사이트 과부하 방지를 위해 호출간 딜레이 적용
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[ParkGolfListAdapter] Finished board crawling. Collected ${records.length} records. / 파크골프장리스트 닷컴 수집 완료: 총 ${records.length}개 레코드 확보.`);
    return records;
  }
}
