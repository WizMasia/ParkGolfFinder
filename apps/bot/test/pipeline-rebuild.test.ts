import { describe, expect, it, vi, beforeEach } from "vitest";
import { runNormalizePipeline } from "../src/pipeline/normalize.js";
import { runReviewPipeline } from "../src/pipeline/review.js";
import { runPromotePipeline } from "../src/pipeline/promote.js";
import { prisma, insertDecision, insertDuplicateCluster } from "@parkgolf/db";

vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/parkgolffinder");

// Mock @parkgolf/db
vi.mock("@parkgolf/db", () => {
  return {
    prisma: {
      stagingFacilityRecord: {
        findMany: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
      },
      stagingDecision: {
        findMany: vi.fn(),
      },
      facility: {
        findFirst: vi.fn(),
        upsert: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      facilityPricing: {
        upsert: vi.fn(),
      },
      reservationInfo: {
        upsert: vi.fn(),
      },
      reservationMethod: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      facilitySnapshot: {
        create: vi.fn(),
      },
    },
    insertDecision: vi.fn(),
    insertDuplicateCluster: vi.fn(),
  };
});

describe("Pipeline Rebuild: Normalization & Strict Outdoor Park Golf Filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mark screen golf, indoor golf, and CC facilities as hidden during normalization", async () => {
    const mockRecords = [
      {
        id: "rec-valid-1",
        runId: "test-run",
        name: "여의도 한강 파크골프장",
        address: "서울특별시 영등포구 여의도동 1",
        rawText: "야외 18홀 천연잔디 파크골프장",
        parkGolfVerdict: "confirmed",
        lat: 37.52,
        lng: 126.92,
      },
      {
        id: "rec-screen-2",
        runId: "test-run",
        name: "골프존파크 강남 스크린점",
        address: "서울특별시 강남구 테헤란로 123",
        rawText: "최신 스크린골프 시설",
        parkGolfVerdict: "confirmed", // tentatively set, should be rejected
        lat: 37.50,
        lng: 127.03,
      },
      {
        id: "rec-indoor-3",
        runId: "test-run",
        name: "도심 실내 파크골프장",
        address: "서울특별시 마포구 마포대로 1",
        rawText: "실내 타석 완비",
        parkGolfVerdict: "confirmed",
        lat: 37.54,
        lng: 126.95,
      },
      {
        id: "rec-cc-4",
        runId: "test-run",
        name: "안양 컨트리클럽 CC",
        address: "경기도 안양시 동안구",
        rawText: "18홀 정규 회원제 컨트리클럽",
        parkGolfVerdict: "confirmed",
        lat: 37.40,
        lng: 126.96,
      },
    ];

    (prisma.stagingFacilityRecord.findMany as any).mockResolvedValue(mockRecords);

    await runNormalizePipeline("test-run");

    const updateCalls = (prisma.stagingFacilityRecord.update as any).mock.calls;
    expect(updateCalls.length).toBe(4);

    const updatedValid = updateCalls.find((c: any) => c[0].where.id === "rec-valid-1");
    expect(updatedValid[0].data.parkGolfVerdict).toBe("confirmed");

    const updatedScreen = updateCalls.find((c: any) => c[0].where.id === "rec-screen-2");
    expect(updatedScreen[0].data.parkGolfVerdict).toBe("hidden");

    const updatedIndoor = updateCalls.find((c: any) => c[0].where.id === "rec-indoor-3");
    expect(updatedIndoor[0].data.parkGolfVerdict).toBe("hidden");

    const updatedCC = updateCalls.find((c: any) => c[0].where.id === "rec-cc-4");
    expect(updatedCC[0].data.parkGolfVerdict).toBe("hidden");
  });
});

describe("Pipeline Rebuild: Deduplication & Review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should merge duplicates with identical normalized name and province into a single canonical confirmed record", async () => {
    // Two records from different sources with slightly different address texts but identical normalized name and province
    const mockCandidates = [
      {
        id: "rec-source-a",
        runId: "test-run",
        name: "잠실 파크골프장",
        normalizedName: "잠실",
        address: "서울특별시 송파구 올림픽로 25 (잠실동)",
        normalizedAddress: "서울특별시송파구올림픽로25",
        province: "서울",
        district: "송파구",
        regionKey: "capital",
        operatorName: "송파구 시설관리공단",
        normalizedOperatorName: "송파구시설관리공단",
        phone: "02-1234-5678",
        lat: 37.51,
        lng: 127.07,
        rawText: "잠실 파크골프장 야외",
        contentHash: "hash-a",
        parkGolfVerdict: "confirmed",
        duplicateStatus: "ambiguous",
      },
      {
        id: "rec-source-b",
        runId: "test-run",
        name: "잠실파크골프장 (공공)",
        normalizedName: "잠실",
        address: "서울특별시 송파구 잠실동 10",
        normalizedAddress: "서울특별시송파구잠실동10", // Different address representation
        province: "서울",
        district: "송파구",
        regionKey: "capital",
        operatorName: null,
        normalizedOperatorName: null,
        phone: null,
        lat: null, // missing coords
        lng: null,
        rawText: "잠실파크골프장 공공체육시설",
        contentHash: "hash-b",
        parkGolfVerdict: "confirmed",
        duplicateStatus: "ambiguous",
      },
    ];

    (prisma.stagingFacilityRecord.findMany as any).mockResolvedValue(mockCandidates);

    await runReviewPipeline("test-run");

    // Check that duplicate cluster was recorded
    expect(insertDuplicateCluster).toHaveBeenCalled();

    // Check decisions: exactly one confirmed, other marked hidden as duplicate
    const decisionCalls = (insertDecision as any).mock.calls;
    expect(decisionCalls.length).toBe(2);

    const confirmedDecision = decisionCalls.find((c: any) => c[0].decision === "confirmed");
    const hiddenDecision = decisionCalls.find((c: any) => c[0].decision === "hidden");

    expect(confirmedDecision).toBeDefined();
    expect(hiddenDecision).toBeDefined();

    // Canonical key should be the richer record (rec-source-a has phone, coords, and operatorName)
    expect(confirmedDecision[0].facilityRecordId).toBe("rec-source-a");
    expect(hiddenDecision[0].facilityRecordId).toBe("rec-source-b");
    expect(hiddenDecision[0].reason).toContain("Duplicate");
  });

  it("should mark records with parkGolfVerdict !== 'confirmed' as hidden in review", async () => {
    const mockCandidates = [
      {
        id: "rec-noise",
        runId: "test-run",
        name: "스크린파크골프",
        normalizedName: "스크린",
        address: "서울특별시 강남구",
        normalizedAddress: "서울특별시강남구",
        province: "서울",
        district: "강남구",
        regionKey: "capital",
        operatorName: null,
        phone: null,
        lat: null,
        lng: null,
        rawText: "스크린",
        contentHash: "hash-noise",
        parkGolfVerdict: "hidden", // non-confirmed
        duplicateStatus: "ambiguous",
      },
    ];

    (prisma.stagingFacilityRecord.findMany as any).mockResolvedValue(mockCandidates);

    await runReviewPipeline("test-run");

    const decisionCalls = (insertDecision as any).mock.calls;
    expect(decisionCalls.length).toBe(1);
    expect(decisionCalls[0][0].decision).toBe("hidden");
  });
});

describe("Pipeline Rebuild: Clean Production Promotion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should only promote confirmed records and NEVER promote hidden or non-outdoor records", async () => {
    const mockDecisions = [
      {
        id: "dec-1",
        runId: "test-run",
        decision: "confirmed",
        facilityRecord: {
          id: "rec-confirmed-1",
          name: "양평 파크골프장",
          address: "경기도 양평군 강상면",
          province: "경기",
          district: "양평군",
          regionKey: "capital",
          operatorName: "양평군청",
          phone: "031-770-0000",
          lat: 37.49,
          lng: 127.50,
          rawText: "양평 파크골프장 36홀",
          sourceUrl: "https://example.com/yp",
          reservations: [
            {
              methodType: "phone",
              methodText: "전화 예약 031-770-0000",
              priority: 1,
              ruleText: "선착순 접수",
              url: null,
              notes: null,
            },
          ],
        },
      },
    ];

    (prisma.stagingDecision.findMany as any).mockResolvedValue(mockDecisions);
    (prisma.facility.upsert as any).mockResolvedValue({ id: "rec-confirmed-1" });
    (prisma.reservationInfo.upsert as any).mockResolvedValue({ id: "res-info-1" });

    await runPromotePipeline("test-run");

    // Only 1 upsert to production Facility
    expect(prisma.facility.upsert).toHaveBeenCalledTimes(1);
    const facilityUpsertCall = (prisma.facility.upsert as any).mock.calls[0][0];
    expect(facilityUpsertCall.create.name).toBe("양평 파크골프장");
    expect(facilityUpsertCall.create.status).toBe("active");
    expect(facilityUpsertCall.create.facilityType).toBe("outdoor");

    // Pricing upsert
    expect(prisma.facilityPricing.upsert).toHaveBeenCalledTimes(1);

    // ReservationInfo and ReservationMethod upsert
    expect(prisma.reservationInfo.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.reservationMethod.create).toHaveBeenCalledTimes(1);
  });

  it("should skip promotion if record is identified as screen or CC even if previously confirmed", async () => {
    const mockDecisions = [
      {
        id: "dec-2",
        runId: "test-run",
        decision: "confirmed",
        facilityRecord: {
          id: "rec-indoor-leak",
          name: "강남 실내 스크린 골프연습장",
          address: "서울특별시 강남구 역삼동",
          province: "서울",
          district: "강남구",
          regionKey: "capital",
          operatorName: "민간",
          phone: "02-999-9999",
          lat: 37.50,
          lng: 127.03,
          rawText: "스크린 골프",
          sourceUrl: null,
          reservations: [],
        },
      },
    ];

    (prisma.stagingDecision.findMany as any).mockResolvedValue(mockDecisions);

    await runPromotePipeline("test-run");

    // Must NOT upsert non-outdoor park golf into Facility
    expect(prisma.facility.upsert).not.toHaveBeenCalled();
  });
});

