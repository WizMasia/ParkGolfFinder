import { describe, expect, it, vi, beforeEach } from "vitest";
import { runFetchPipeline } from "../src/pipeline/fetch.js";

describe("Fetch Pipeline / 데이터 수집 파이프라인", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/parkgolffinder");
  });

  it("should resolve active sources and return records / 활성화된 소스에서 레코드를 정상 수집해야 합니다", async () => {
    const mockResponse = {
      currentCount: 1,
      matchCount: 1,
      totalCount: 1,
      data: [
        {
          "시 설 명": "여의도한강 파크골프장",
          "위 치": "서울특별시 영등포구 여의도동 1",
          "운영기관": "영등포구청",
          "홀수": "18홀",
          "규 모": "7700㎡",
        },
      ],
    };

    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const records = await runFetchPipeline("seoul");

    expect(globalFetch).toHaveBeenCalled();
    expect(records.length).toBeGreaterThan(0);
    expect(records[0].sourceName).toBe("seoul");
    expect(records[0].extractedName).toBe("여의도한강 파크골프장");
    expect(records[0].extractedAddress).toBe("서울특별시 영등포구 여의도동 1");

    globalFetch.mockRestore();
  });
});
