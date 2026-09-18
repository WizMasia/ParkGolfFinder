import { describe, expect, it, vi } from "vitest";
import { ParkGolfListAdapter } from "../src/sources/parkgolflist.js";

describe("ParkGolfListAdapter / 전국파크골프장리스트 어댑터", () => {
  it("should fetch and parse provincial pages successfully / 지역별 구장 목록 테이블을 정상적으로 파싱해야 합니다", async () => {
    const mockHtml = `
      <table style="border-collapse: collapse; width: 100%;">
        <tbody>
          <tr>
            <td><strong>구장명</strong></td>
            <td><strong>지역</strong></td>
            <td><strong>홀 수</strong></td>
            <td><strong>블로그 후기</strong></td>
          </tr>
          <tr>
            <td>갑천 파크골프장</td>
            <td>유성구</td>
            <td>36</td>
            <td><a>후기 보기</a></td>
          </tr>
        </tbody>
      </table>
    `;

    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as Response);

    const adapter = new ParkGolfListAdapter();
    const records = await adapter.fetchRecords("TestAgent");

    expect(globalFetch).toHaveBeenCalled();
    // 16 paths, each returning 1 record = 16 total
    // 16개 시도 경로를 돌며 모킹된 HTML 테이블을 긁으므로 총 16개 레코드가 잡힙니다.
    expect(records.length).toBe(16);

    const first = records[0];
    expect(first.extractedName).toBe("갑천 파크골프장");
    // Standardized address format checking (combines path resolved province with sigungu)
    // 0번째 path인 seoul/에 유성구가 조합된 '서울특별시 유성구'를 정상으로 파싱해야 합니다.
    expect(first.extractedAddress).toBe("서울특별시 유성구");
    expect(first.extractedReservationText).toBe("36홀");

    globalFetch.mockRestore();
  });
});
