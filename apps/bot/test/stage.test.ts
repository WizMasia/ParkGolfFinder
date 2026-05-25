import { describe, expect, it, vi } from "vitest";
import { runStagePipeline } from "../src/pipeline/stage.js";

// Mock database repository module
// 데이터베이스 레포지토리 모듈을 모킹합니다.
vi.mock("@parkgolf/db", () => {
  return {
    createStagingRun: vi.fn().mockResolvedValue({ id: "mock-run-id" }),
    insertStagingSource: vi.fn().mockResolvedValue({ id: "mock-source-id" }),
    insertFacilityRecord: vi.fn().mockResolvedValue({ id: "mock-record-id" }),
    insertReservationRecord: vi.fn().mockResolvedValue({ id: "mock-res-id" }),
  };
});

describe("Staging Pipeline / 적재 파이프라인", () => {
  it("should stage records without throwing errors / 에러 없이 레코드를 스테이징에 적재해야 합니다", async () => {
    process.env.DATABASE_URL = "postgresql://localhost";

    const mockRecords = [
      {
        sourceName: "official",
        sourceUrl: "https://example.com",
        sourceKind: "official" as const,
        contentHash: "hash123",
        rawText: "파크골프",
        extractedName: "잠실 파크골프장",
        extractedAddress: "송파구",
        extractedOperatorName: "송파구청",
        extractedPhone: "02-123",
        extractedReservationText: "전화",
      },
    ];

    const runId = await runStagePipeline("national", mockRecords);

    expect(runId).toBe("mock-run-id");
  });
});
