import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { rankFacilities } from "../lib/facility-search";
import { RegionFilterTabs, REGION_TABS } from "../components/home/region-filter-tabs";
import { DistanceFilterBar, DISTANCE_PRESETS } from "../components/home/distance-filter-bar";
import { SEOUL_CITY_HALL } from "../lib/seoul-fallback";
import type { FacilitySummary } from "@parkgolf/shared";

describe("Combined Region + Distance + Name Filter Logic", () => {
  const mockFacilities: FacilitySummary[] = [
    {
      id: "fac-jamsil",
      name: "잠실 파크골프장",
      address: "서울특별시 송파구 올림픽로 25",
      province: "서울",
      district: "송파구",
      regionKey: "서울",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "송파구청",
      lat: 37.5148,
      lng: 127.0728, // ~12.2km from Seoul City Hall (37.5663, 126.9779)
      baseFeeText: "2,000원",
    },
    {
      id: "fac-yeouido",
      name: "여의도 한강 파크골프장",
      address: "서울특별시 영등포구 여의도동",
      province: "서울",
      district: "영등포구",
      regionKey: "서울",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "영등포구청",
      lat: 37.5255,
      lng: 126.9248, // ~6.5km from Seoul City Hall
      baseFeeText: "무료",
    },
    {
      id: "fac-chuncheon",
      name: "춘천 의암호 파크골프장",
      address: "강원특별자치도 춘천시 삼천동",
      province: "강원",
      district: "춘천시",
      regionKey: "강원",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "춘천시청",
      lat: 37.868,
      lng: 127.705, // ~75km from Seoul City Hall
      baseFeeText: "무료",
    },
    {
      id: "fac-daegu",
      name: "대구 수성 파크골프장",
      address: "대구광역시 수성구 파동",
      province: "대구",
      district: "수성구",
      regionKey: "대구",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "수성구청",
      lat: 35.819,
      lng: 128.643, // ~240km from Seoul City Hall
      baseFeeText: "무료",
    },
    {
      id: "fac-hidden",
      name: "공사중 파크골프장",
      address: "서울특별시 중구",
      province: "서울",
      district: "중구",
      regionKey: "서울",
      facilityType: "outdoor",
      status: "hidden",
      ownership: "public",
      operatorName: "중구청",
      lat: 37.566,
      lng: 126.978,
      baseFeeText: "무료",
    },
  ];

  it("should return all active facilities when distanceKm is null (전체) and regionGroup is null", () => {
    const results = rankFacilities({
      facilities: mockFacilities,
      query: "",
      regionGroup: null,
      distanceKm: null,
      currentLocation: null,
      concessionOn: false,
      feeFilter: null,
    });

    expect(results.length).toBe(4);
    expect(results.some((f) => f.id === "fac-hidden")).toBe(false);
  });

  it("should filter by regionGroup correctly (e.g. gangwon)", () => {
    const results = rankFacilities({
      facilities: mockFacilities,
      query: "",
      regionGroup: "gangwon",
      distanceKm: null,
      currentLocation: null,
      concessionOn: false,
      feeFilter: null,
    });

    expect(results.length).toBe(1);
    expect(results[0].id).toBe("fac-chuncheon");
  });

  it("should filter by distance preset 10km relative to Seoul City Hall", () => {
    const results = rankFacilities({
      facilities: mockFacilities,
      query: "",
      regionGroup: null,
      distanceKm: 10,
      currentLocation: { lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng },
      concessionOn: false,
      feeFilter: null,
    });

    // Yeouido is ~6.5km (<= 10km), Jamsil is ~12.2km (> 10km)
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("fac-yeouido");
  });

  it("should filter by combined region, distance, and query search", () => {
    // Yeouido is capital ('서울'), ~6.5km, name matches '한강'
    const results = rankFacilities({
      facilities: mockFacilities,
      query: "한강",
      regionGroup: "capital",
      distanceKm: 20,
      currentLocation: { lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng },
      concessionOn: false,
      feeFilter: null,
    });

    expect(results.length).toBe(1);
    expect(results[0].id).toBe("fac-yeouido");

    // Query mismatch
    const noResults = rankFacilities({
      facilities: mockFacilities,
      query: "부산",
      regionGroup: "capital",
      distanceKm: 20,
      currentLocation: { lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng },
      concessionOn: false,
      feeFilter: null,
    });

    expect(noResults.length).toBe(0);
  });

  it("should sort results ascending by distance from location", () => {
    const results = rankFacilities({
      facilities: mockFacilities,
      query: "",
      regionGroup: null,
      distanceKm: null,
      currentLocation: { lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng },
      concessionOn: false,
      feeFilter: null,
    });

    expect(results[0].id).toBe("fac-yeouido"); // ~6.5km
    expect(results[1].id).toBe("fac-jamsil");  // ~12.2km
    expect(results[2].id).toBe("fac-chuncheon"); // ~75km
    expect(results[3].id).toBe("fac-daegu");  // ~240km
  });
});

describe("RegionFilterTabs Component", () => {
  it("should render all 7 regional tabs ([전체], [수도권], [강원], [충청], [호남], [영남], [제주])", () => {
    expect(REGION_TABS.length).toBe(7);
    const labels = REGION_TABS.map((t) => t.label);
    expect(labels).toEqual(["전체", "수도권", "강원", "충청", "호남", "영남", "제주"]);
  });

  it("should render high-contrast senior-friendly active and inactive pill styles", () => {
    const html = renderToStaticMarkup(
      React.createElement(RegionFilterTabs, {
        selectedRegion: "capital",
        onSelectRegion: () => {},
      })
    );

    // Active styling: #0f766e, text-white
    expect(html).toContain("bg-[#0f766e]");
    expect(html).toContain("text-white");
    // Min height >= 48px, text size >= 17px
    expect(html).toContain("min-h-[48px]");
    expect(html).toContain("text-[17px]");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("수도권");
    expect(html).toContain("강원");
    expect(html).toContain("전체");
  });
});

describe("DistanceFilterBar Component", () => {
  it("should include presets: 5km, 10km, 20km, 전체", () => {
    expect(DISTANCE_PRESETS.length).toBe(4);
    expect(DISTANCE_PRESETS.map((p) => p.label)).toEqual(["5km", "10km", "20km", "전체"]);
  });

  it("should render large GPS button '내 위치 주변 (10km)' and preset buttons", () => {
    const html = renderToStaticMarkup(
      React.createElement(DistanceFilterBar, {
        distanceKm: 10,
        onDistanceChange: () => {},
        currentLocation: null,
        onLocationChange: () => {},
        locationStatus: "idle",
      })
    );

    expect(html).toContain("내 위치 주변 (10km)");
    expect(html).toContain("min-h-[48px]");
    expect(html).toContain("5km");
    expect(html).toContain("10km");
    expect(html).toContain("20km");
    expect(html).toContain("전체");
    expect(html).toContain('aria-pressed="true"');
  });

  it("should render active state on GPS button when current location is set", () => {
    const htmlWithGps = renderToStaticMarkup(
      React.createElement(DistanceFilterBar, {
        distanceKm: 10,
        onDistanceChange: () => {},
        currentLocation: { lat: 37.5, lng: 127.0 },
        onLocationChange: () => {},
        locationStatus: "success",
      })
    );

    expect(htmlWithGps).toContain("bg-[#0f766e]");
    expect(htmlWithGps).toContain("text-white");
  });
});
