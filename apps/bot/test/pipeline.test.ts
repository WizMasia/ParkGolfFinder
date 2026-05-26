import { describe, expect, it, vi, beforeEach } from "vitest";
import { executePipeline } from "../src/pipeline/run.js";

// Mock database layer for pipeline integration testing
// 파이프라인 통합 테스트를 위해 데이터베이스 레이어를 모킹합니다.
vi.mock("@parkgolf/db", () => {
  return {
    prisma: {
      stagingFacilityRecord: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "rec123",
            runId: "run-123",
            name: "잠실 파크골프장 (임시)",
            address: "서울특별시 송파구",
            parkGolfVerdict: "confirmed",
            contentHash: "hash123",
            reservations: [],
            lat: 37.5,
            lng: 126.9,
          },
        ]),
        update: vi.fn().mockResolvedValue({}),
      },
      stagingDecision: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "dec123",
            decision: "confirmed",
            facilityRecord: {
              id: "rec123",
              name: "잠실 파크골프장",
              address: "서울특별시 송파구",
              province: "서울",
              district: "송파구",
              regionKey: "capital",
              operatorName: "송파구청",
              phone: "02-123",
              lat: 37.5,
              lng: 126.9,
              rawText: "파크골프",
              reservations: [],
            },
          },
        ]),
      },
      facility: {
        upsert: vi.fn().mockResolvedValue({ id: "fac123" }),
      },
      facilityPricing: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      reservationInfo: {
        upsert: vi.fn().mockResolvedValue({ id: "res123" }),
      },
      reservationMethod: {
        deleteMany: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      facilitySnapshot: {
        create: vi.fn().mockResolvedValue({}),
      },
    },
    createStagingRun: vi.fn().mockResolvedValue({ id: "mock-run-id" }),
    finishStagingRun: vi.fn().mockResolvedValue({}),
    insertStagingSource: vi.fn().mockResolvedValue({ id: "mock-source-id" }),
    insertFacilityRecord: vi.fn().mockResolvedValue({ id: "rec123" }),
    insertReservationRecord: vi.fn().mockResolvedValue({}),
    insertDuplicateCluster: vi.fn().mockResolvedValue({}),
    insertDecision: vi.fn().mockResolvedValue({}),
    deleteExpiredStagingData: vi.fn().mockResolvedValue({}),
  };
});

describe("Pipeline E2E Orchestration / 파이프라인 E2E 통합 오케스트레이션", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/parkgolffinder");
  });

  it("should run full pipeline sequence without throwing errors / 전체 파이프라인 단계를 에러 없이 무사히 완료해야 합니다", async () => {
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

    await expect(executePipeline("seoul")).resolves.not.toThrow();

    globalFetch.mockRestore();
  });
});
