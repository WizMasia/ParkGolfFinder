import { describe, expect, it } from "vitest";
import { findFacilitiesByQuery, findFacilityById, listFacilitiesByRegionGroup } from "../src/facility-repository.js";
import { prisma } from "../src/client.js";

describe("Production Facility Repository / 프로덕션 시설 레포지토리 검증", () => {
  it("should have production repository functions defined / 프로덕션 조회 관련 헬퍼 함수들이 정의되어 있어야 합니다", () => {
    expect(findFacilitiesByQuery).toBeTypeOf("function");
    expect(findFacilityById).toBeTypeOf("function");
    expect(listFacilitiesByRegionGroup).toBeTypeOf("function");
  });

  it("should contain production models in prisma client / 프리즈마 클라이언트에 프로덕션 모델이 정의되어 있어야 합니다", () => {
    expect(prisma.facility).toBeDefined();
    expect(prisma.facilityPricing).toBeDefined();
    expect(prisma.reservationInfo).toBeDefined();
    expect(prisma.reservationMethod).toBeDefined();
    expect(prisma.facilitySnapshot).toBeDefined();
  });
});
