import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Adapter for Kakao Map Search Keyword API
 * 카카오 맵 키워드 검색 API 어댑터
 */
export class KakaoAdapter implements SourceAdapter {
  name = "kakao";
  kind: SourceKind = "kakao";
  url = "https://dapi.kakao.com/v2/local/search/keyword.json";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    // Generate mockup data representing Kakao Map API search
    // 카카오 맵 API 검색 데이터를 모사한 모의 데이터를 생성합니다.
    const mockRaw = [
      {
        place_name: "화랑유원지 파크골프장",
        road_address_name: "경기도 안산시 단원구 초지동 667",
        phone: "031-481-2000",
      },
    ];

    return mockRaw.map((item) => {
      const rawText = JSON.stringify(item);
      const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

      return {
        sourceName: this.name,
        sourceUrl: this.url,
        sourceKind: this.kind,
        contentHash,
        rawText,
        extractedName: item.place_name,
        extractedAddress: item.road_address_name,
        extractedOperatorName: null,
        extractedPhone: item.phone,
        extractedReservationText: null,
      };
    });
  }
}
