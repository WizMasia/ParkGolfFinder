import { describe, expect, it } from "vitest";
import { runFetchPipeline } from "../src/pipeline/fetch.js";

describe("Fetch Pipeline / 데이터 수집 파이프라인", () => {
  it("should resolve active sources and return records / 활성화된 소스에서 레코드를 정상 수집해야 합니다", async () => {
    // DATABASE_URL environment mock is supplied by vitest or env
    // DATABASE_URL 환경 변수가 모의 설정되어 있는 경우를 체크합니다.
    process.env.DATABASE_URL = "postgresql://localhost";

    const records = await runFetchPipeline("official");

    expect(records.length).toBeGreaterThan(0);
    expect(records[0].sourceName).toBe("official");
    expect(records[0].extractedName).toBe("잠실 파크골프장");
  });
});
