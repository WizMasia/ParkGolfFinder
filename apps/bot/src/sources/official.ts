import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Adapter for official municipality park golf websites
 * 지방자치단체 공식 파크골프 웹사이트 어댑터
 */
export class OfficialAdapter implements SourceAdapter {
  name = "official";
  kind: SourceKind = "official";
  url = "https://example-municipality.go.kr/parkgolf";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    // Generate mockup data representing official sources
    // 공식 소스를 나타내는 모의(mockup) 데이터를 생성합니다.
    const mockRaw = [
      {
        name: "잠실 파크골프장",
        address: "서울특별시 송파구 잠실동 10",
        operatorName: "송파구청",
        phone: "02-423-0045",
        reservationText: "전화 예약 및 방문 접수",
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
        extractedName: item.name,
        extractedAddress: item.address,
        extractedOperatorName: item.operatorName,
        extractedPhone: item.phone,
        extractedReservationText: item.reservationText,
      };
    });
  }
}
