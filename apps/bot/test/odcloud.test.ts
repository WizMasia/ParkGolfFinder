import { describe, expect, it, vi } from "vitest";
import {
  parseHolesCount,
  mapOdcloudItemToRawFacility,
  fetchOdcloudPortalRecords,
  ODCLOUD_DEFAULT_AUTH_KEY,
  ODCLOUD_ENDPOINTS,
  RawFacilityPayload,
  OdcloudPortalAdapter,
} from "../src/sources/odcloud-portal.js";

describe("ODCloud Portal Adapter / 공공데이터포털 ODCloud 어댑터", () => {
  describe("parseHolesCount / 홀수 파싱 유틸리티", () => {
    it("should parse numeric and string hole values accurately", () => {
      expect(parseHolesCount(18)).toBe(18);
      expect(parseHolesCount("18")).toBe(18);
      expect(parseHolesCount("18홀")).toBe(18);
      expect(parseHolesCount("36 홀")).toBe(36);
      expect(parseHolesCount("9+9홀")).toBe(18);
      expect(parseHolesCount("54홀(A,B,C,D,E,F)")).toBe(54);
      expect(parseHolesCount("규모: 27홀")).toBe(27);
      expect(parseHolesCount(null)).toBeNull();
      expect(parseHolesCount(undefined)).toBeNull();
      expect(parseHolesCount("미정")).toBeNull();
    });
  });

  describe("mapOdcloudItemToRawFacility / ODCloud 항목 정규화 매핑", () => {
    it("should map Seoul / Ministry of Culture dataset item to RawFacilityPayload", () => {
      const mockItem = {
        "시 설 명": "여의도 한강 파크골프장",
        "위 치": "서울특별시 영등포구 여의도동 1",
        "운영기관": "영등포구청",
        "홀수": "18홀",
        "규 모": "7700㎡",
      };

      const payload = mapOdcloudItemToRawFacility(mockItem);

      expect(payload).not.toBeNull();
      expect(payload?.name).toBe("여의도 한강 파크골프장");
      expect(payload?.address).toBe("서울특별시 영등포구 여의도동 1");
      expect(payload?.holes).toBe(18);
      expect(payload?.operator).toBe("영등포구청");
      expect(payload?.lat).toBeNull();
      expect(payload?.lng).toBeNull();
    });

    it("should map Geochang / Gyeongnam dataset with coordinates and alternative field names", () => {
      const mockItem = {
        "시설명": "거창 파크골프장",
        "소재지도로명주소": "경상남도 거창군 거창읍 강남로 1",
        "관리기관": "거창군 체육회",
        "규모(홀)": "36",
        "위도": "35.6865",
        "경도": "127.9123",
      };

      const payload = mapOdcloudItemToRawFacility(mockItem);

      expect(payload).not.toBeNull();
      expect(payload?.name).toBe("거창 파크골프장");
      expect(payload?.address).toBe("경상남도 거창군 거창읍 강남로 1");
      expect(payload?.operator).toBe("거창군 체육회");
      expect(payload?.holes).toBe(36);
      expect(payload?.lat).toBeCloseTo(35.6865);
      expect(payload?.lng).toBeCloseTo(127.9123);
    });

    it("should return null for noise venues (e.g. screen golf / CC) using isOutdoorParkGolf", () => {
      const screenGolfItem = {
        "시설명": "골프존파크 여의도점",
        "위치": "서울특별시 영등포구 여의도동 2",
        "운영기관": "개인",
        "홀수": "18홀",
      };

      const regularCcItem = {
        "시설명": "안양컨트리클럽",
        "소재지도로명주소": "경기도 군포시 군포로 1",
        "운영기관": "안양CC",
        "홀수": "18",
      };

      expect(mapOdcloudItemToRawFacility(screenGolfItem)).toBeNull();
      expect(mapOdcloudItemToRawFacility(regularCcItem)).toBeNull();
    });
  });

  describe("OdcloudPortalAdapter & fetchOdcloudPortalRecords / API 수집 기능", () => {
    it("should fetch and normalize facilities using defaultAuthKey and endpoints", async () => {
      const mockApiResponse = {
        currentCount: 2,
        matchCount: 2,
        totalCount: 2,
        page: 1,
        perPage: 100,
        data: [
          {
            "시 설 명": "잠실 파크골프장",
            "위 치": "서울특별시 송파구 잠실동 10",
            "운영기관": "송파구청",
            "홀수": "9홀",
          },
          {
            "시 설 명": "골프존파크 잠실점",
            "위 치": "서울특별시 송파구 잠실동 20",
            "운영기관": "사설",
            "홀수": "18",
          },
        ],
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const endpoint = ODCLOUD_ENDPOINTS[0];
      const payloads = await fetchOdcloudPortalRecords(endpoint, {
        apiKey: ODCLOUD_DEFAULT_AUTH_KEY,
        userAgent: "TestBot/1.0",
      });

      // Second item (골프존) must be filtered out by isOutdoorParkGolf
      expect(payloads.length).toBe(1);
      expect(payloads[0].name).toBe("잠실 파크골프장");
      expect(payloads[0].address).toBe("서울특별시 송파구 잠실동 10");
      expect(payloads[0].holes).toBe(9);
      expect(payloads[0].operator).toBe("송파구청");

      fetchSpy.mockRestore();
    });

    it("should integrate with SourceAdapter interface in OdcloudPortalAdapter", async () => {
      const mockApiResponse = {
        currentCount: 1,
        matchCount: 1,
        totalCount: 1,
        page: 1,
        perPage: 100,
        data: [
          {
            "시 설 명": "양평 누리 파크골프장",
            "위 치": "경기도 양평군 강상면 강남로 1",
            "운영기관": "양평군",
            "홀수": "36홀",
          },
        ],
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const adapter = new OdcloudPortalAdapter();
      const records = await adapter.fetchRecords("TestBot/1.0");

      expect(records.length).toBeGreaterThan(0);
      const yangpyeong = records.find((r) => r.extractedName === "양평 누리 파크골프장");
      expect(yangpyeong).toBeDefined();
      expect(yangpyeong?.sourceKind).toBe("official");
      expect(yangpyeong?.extractedAddress).toBe("경기도 양평군 강상면 강남로 1");
      expect(yangpyeong?.extractedReservationText).toContain("36홀");

      fetchSpy.mockRestore();
    });
  });
});

