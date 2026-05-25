import { describe, expect, it, vi } from "vitest";
import { normalizeName } from "../src/classification/normalize-name.js";
import { normalizeAddress, parseAddressRegion } from "../src/classification/normalize-address.js";
import { runNormalizePipeline } from "../src/pipeline/normalize.js";

// Mock database updates
// 데이터베이스 업데이트 메서드를 모킹합니다.
vi.mock("@parkgolf/db", () => {
  return {
    prisma: {
      stagingFacilityRecord: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "rec1",
            name: "여의도 파크골프장 (임시)",
            address: "서울특별시 영등포구 여의도동 1",
          },
        ]),
        update: vi.fn().mockResolvedValue({}),
      },
    },
  };
});

describe("Name Normalization / 이름 정제", () => {
  it("should strip suffixes and brackets / 접미사 및 괄호를 제거해야 합니다", () => {
    expect(normalizeName("잠실 파크골프장 (공영)")).toBe("잠실");
    expect(normalizeName("화랑유원지 파크골프클럽")).toBe("화랑유원지");
    expect(normalizeName("여의도 파크골프")).toBe("여의도");
  });
});

describe("Address Normalization / 주소 정제 및 파싱", () => {
  it("should extract correct region elements / 주소에서 올바른 지역 정보들을 추출해야 합니다", () => {
    const region1 = parseAddressRegion("서울특별시 송파구 잠실동 10");
    expect(region1.province).toBe("서울");
    expect(region1.district).toBe("송파구");
    expect(region1.regionKey).toBe("capital");

    const region2 = parseAddressRegion("경기도 안산시 단원구");
    expect(region2.province).toBe("경기");
    expect(region2.district).toBe("안산시");
    expect(region2.regionKey).toBe("capital");
  });

  it("should collapse whitespace in address / 주소 공백이 완전히 압축되어야 합니다", () => {
    expect(normalizeAddress("서울시  송파구, 잠실동")).toBe("서울시송파구잠실동");
  });
});

describe("Normalize Pipeline / 정제 파이프라인 작동", () => {
  it("should run pipeline successfully / 정제 파이프라인이 정상적으로 돌아가야 합니다", async () => {
    await expect(runNormalizePipeline("mock-run-id")).resolves.not.toThrow();
  });
});
