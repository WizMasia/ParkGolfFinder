import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Adapter for Daejeon Park Golf Association Board Pages (djpkgolf.kr/46)
 * 대전광역시파크골프협회 전국 파크골프장 목록 게시판 수집 어댑터
 */
export class DjpkgolfAdapter implements SourceAdapter {
  name = "djpkgolf";
  kind: SourceKind = "official";
  url = "https://djpkgolf.kr/46";

  // Article IDs representing different regions
  // 지역별 파크골프장 리스트 게시글 ID 목록
  private articleIds: number[] = [
    132029905, // Seoul, Gyeonggi / 서울, 경기
    132030085, // Gangwon, Jeju / 강원, 제주
    132032131, // Daejeon, Sejong, Chungnam, Chungbuk / 대전, 세종, 충남, 충북
    132032439, // Jeonbuk, Jeonnam, Gwangju / 전북, 전남, 광주
    132032831, // Busan, Ulsan, Gyeongnam / 부산, 울산, 경남
    132033213, // Daegu, Gyeongbuk / 대구, 경북
  ];

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    const records: SourceRecord[] = [];
    console.log(`[DjpkgolfAdapter] Starting to fetch ${this.articleIds.length} board articles... / 대전협회 전국 게시글 ${this.articleIds.length}개 수집 시작...`);

    for (const idx of this.articleIds) {
      const targetUrl = `https://djpkgolf.kr/46/?bmode=view&idx=${idx}`;
      try {
        const response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "User-Agent": userAgent,
          },
        });

        if (!response.ok) {
          console.warn(`[DjpkgolfAdapter] Failed fetching article ${idx} (status: ${response.status}). / 게시글 ${idx} 호출 실패: ${response.status}`);
          continue;
        }

        const html = await response.text();
        
        // Extract table content using Regex
        // HTML 내의 테이블 영역을 정규식으로 안전하게 추출합니다.
        const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
        if (!tableMatch) {
          console.warn(`[DjpkgolfAdapter] No table found in article ${idx}. / 게시글 ${idx}에서 테이블을 찾지 못했습니다.`);
          continue;
        }

        const tableHtml = tableMatch[1];
        
        // Find tr blocks
        // 각 로우 행들을 파싱합니다.
        const trMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
        if (!trMatches) continue;

        let currentRegion = "";

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
          // '지역', '파크골프장', '주 소', '규모'와 같은 헤더 행은 패스합니다.
          if (cells.includes("지역") || cells.includes("파크골프장")) {
            continue;
          }

          let name = "";
          let address = "";
          let capacity = "";

          if (cells.length >= 4) {
            // Row with region column (contains 4 cells)
            // 지역명 셀이 포함된 로우 (총 4개 셀 존재)
            if (cells[0]) {
              currentRegion = cells[0];
            }
            name = cells[1];
            address = cells[2];
            capacity = cells[3];
          } else if (cells.length === 3) {
            // Row without region column (rowspan continuation, 3 cells)
            // 앞선 지역명이 rowspan 병합 처리된 로우 (총 3개 셀 존재)
            name = cells[0];
            address = cells[1];
            capacity = cells[2];
          }

          // Skip empty row or placeholders
          // 내용이 비었거나 점선 등 무의미한 로우는 제외합니다.
          if (!name || name === " " || name === "-" || name.includes("지역파크골프장")) continue;

          const item = {
            region: currentRegion,
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
            extractedOperatorName: "대전광역시파크골프협회",
            extractedPhone: null,
            extractedReservationText: capacity ? `규모: ${capacity}` : null,
          });
        }

      } catch (error) {
        console.error(`[DjpkgolfAdapter] Error processing article ${idx}: / 게시글 ${idx} 처리 중 에러:`, error);
      }

      // Respectful delay between web requests
      // 사이트 과부하 방지를 위해 호출간 딜레이 적용
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[DjpkgolfAdapter] Finished board crawling. Collected ${records.length} records. / 대전협회 전국 리스트 수집 완료: 총 ${records.length}개 레코드 확보.`);
    return records;
  }
}
