import { describe, expect, it } from "vitest";
import { createStagingRun, listOpenRuns } from "../src/staging-repository.js";
import { prisma } from "../src/client.js";

describe("Prisma client instantiation / 프리즈마 클라이언트 인스턴스화 검증", () => {
  it("should have repository functions defined / 레포지토리 함수들이 정의되어 있어야 합니다", () => {
    expect(createStagingRun).toBeTypeOf("function");
    expect(listOpenRuns).toBeTypeOf("function");
  });

  it("should have correct models configured in prisma instance / 프리즈마 인스턴스에 올바른 모델이 구성되어 있어야 합니다", () => {
    expect(prisma.stagingRun).toBeDefined();
    expect(prisma.stagingSource).toBeDefined();
    expect(prisma.stagingFacilityRecord).toBeDefined();
    expect(prisma.stagingReservationRecord).toBeDefined();
    expect(prisma.stagingDecision).toBeDefined();
    expect(prisma.stagingDuplicateCluster).toBeDefined();
  });
});
