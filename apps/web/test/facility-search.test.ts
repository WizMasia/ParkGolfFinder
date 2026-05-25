import { describe, expect, it } from "vitest";
import { rankFacilities } from "../lib/facility-search.js";
import { FacilitySummary } from "@parkgolf/shared";

describe("rankFacilities Search Engine / 시설 검색 및 랭킹 엔진", () => {
  const dummyFacilities: FacilitySummary[] = [
    {
      id: "1",
      name: "잠실 파크골프장",
      address: "서울특별시 송파구 잠실동 10",
      province: "서울",
      district: "송파구",
      regionKey: "서울",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "송파구청",
      lat: 37.5148406,
      lng: 127.0728795,
      baseFeeText: "무료",
    },
    {
      id: "2",
      name: "여의도 파크골프장",
      address: "서울특별시 영등포구 여의도동 1",
      province: "서울",
      district: "영등포구",
      regionKey: "서울",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "영등포구청",
      lat: 37.525585,
      lng: 126.924843,
      baseFeeText: "유료 3000원",
    },
    {
      id: "3",
      name: "대구 파크골프장",
      address: "대구광역시 북구",
      province: "대구",
      district: "북구",
      regionKey: "대구",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "북구청",
      lat: 35.889,
      lng: 128.582,
      baseFeeText: "무료",
    },
    {
      id: "4",
      name: "비활성 파크골프장",
      address: "어딘가",
      province: "기타",
      district: "기타",
      regionKey: "서울",
      facilityType: "outdoor",
      status: "hidden",
      ownership: "public",
      operatorName: "비공개",
      lat: 37.5,
      lng: 127.0,
      baseFeeText: "무료",
    },
  ];

  it("should filter active facilities only / 활성 상태인 시설만 노출되어야 합니다", () => {
    const results = rankFacilities({
      facilities: dummyFacilities,
      query: "",
      regionGroup: null,
      distanceKm: 500,
      currentLocation: { lat: 37.5, lng: 127.0 },
      concessionOn: false,
      feeFilter: null,
    });

    const hiddenExists = results.some((f) => f.status === "hidden");
    expect(hiddenExists).toBe(false);
    expect(results.length).toBe(3);
  });

  it("should filter by regionGroup capital / 서울 경기 인천(capital) 권역만 필터링되어야 합니다", () => {
    const results = rankFacilities({
      facilities: dummyFacilities,
      query: "",
      regionGroup: "capital",
      distanceKm: 500,
      currentLocation: { lat: 37.5, lng: 127.0 },
      concessionOn: false,
      feeFilter: null,
    });

    expect(results.length).toBe(2);
    expect(results.map((f) => f.id)).toContain("1");
    expect(results.map((f) => f.id)).toContain("2");
  });

  it("should sort by distance from current location / 특정 위치에서 더 가까운 곳이 우선 노출되어야 합니다", () => {
    // Current point: Yeouido area (여의도 부근)
    const results = rankFacilities({
      facilities: dummyFacilities,
      query: "",
      regionGroup: null,
      distanceKm: 500,
      currentLocation: { lat: 37.52, lng: 126.92 },
      concessionOn: false,
      feeFilter: null,
    });

    // Yeouido (id 2) is closer than Jamsil (id 1)
    // 여의도(id 2)가 잠실(id 1)보다 가까워야 합니다.
    expect(results[0].id).toBe("2");
    expect(results[1].id).toBe("1");
  });

  it("should fallback to 10 nearest items if no facilities are within range / 범위 내 항목이 없을 시 가장 가까운 리스트를 fallback으로 돌려주어야 합니다", () => {
    const results = rankFacilities({
      facilities: dummyFacilities,
      query: "",
      regionGroup: null,
      distanceKm: 1, // Extremely narrow range (1km)
      currentLocation: { lat: 37.52, lng: 126.92 },
      concessionOn: false,
      feeFilter: null,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("2"); // Falls back to closest Yeouido
  });
});
