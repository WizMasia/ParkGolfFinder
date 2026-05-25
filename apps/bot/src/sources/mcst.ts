import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Adapter for Ministry of Culture, Sports and Tourism (MCST) public API/CSV
 * 문화체육관광부 공공데이터 포털 연계 어댑터
 */
export class McstAdapter implements SourceAdapter {
  name = "mcst";
  kind: SourceKind = "mcst";
  url = "https://data.go.kr/mcst/facility";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    // Generate mockup data representing MCST dataset
    // 문체부 데이터를 모사한 모의 데이터를 생성합니다.
    const mockRaw = [
      {
        facilityName: "여의도 한강공원 파크골프장",
        addr: "서울특별시 영등포구 여의도동 1",
        manager: "영등포구청",
        tel: "02-2670-3114",
        bookingInfo: "인터넷 예약(선착순)",
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
        extractedName: item.facilityName,
        extractedAddress: item.addr,
        extractedOperatorName: item.manager,
        extractedPhone: item.tel,
        extractedReservationText: item.bookingInfo,
      };
    });
  }
}
