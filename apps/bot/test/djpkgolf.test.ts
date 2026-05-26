import { describe, expect, it, vi } from "vitest";
import { DjpkgolfAdapter } from "../src/sources/djpkgolf.js";

describe("DjpkgolfAdapter / 대전파크골프협회 어댑터", () => {
  it("should fetch and parse board tables successfully / 게시글 테이블을 정상적으로 파싱해야 합니다", async () => {
    const mockHtml = `
      <table>
        <tbody>
          <tr>
            <td>지역</td>
            <td>파크골프장</td>
            <td>주 소</td>
            <td>규모</td>
          </tr>
          <tr>
            <td rowspan="2"><p>대전</p></td>
            <td><p>버드네파크골프장</p></td>
            <td><p>대전시 중구 태평동 515-2</p></td>
            <td><p>18홀</p></td>
          </tr>
          <tr>
            <td><p>유등파크골프장</p></td>
            <td><p>대전시 서구 만년동 424</p></td>
            <td><p>27홀</p></td>
          </tr>
        </tbody>
      </table>
    `;

    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as Response);

    const adapter = new DjpkgolfAdapter();
    const records = await adapter.fetchRecords("TestAgent");

    expect(globalFetch).toHaveBeenCalled();
    // 6 articles fetched, each returning 2 records = 12 total
    // 6개의 게시글 ID를 돌며 모킹된 HTML 테이블을 긁으므로 총 12개 레코드가 잡힙니다.
    expect(records.length).toBe(12);

    const first = records[0];
    expect(first.extractedName).toBe("버드네파크골프장");
    expect(first.extractedAddress).toBe("대전시 중구 태평동 515-2");
    expect(first.extractedReservationText).toBe("규모: 18홀");

    globalFetch.mockRestore();
  });
});
