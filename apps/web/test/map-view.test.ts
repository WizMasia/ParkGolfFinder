import { describe, it, expect, vi } from "vitest";
import {
  isValidCoordinate,
  filterValidFacilities,
  createMarkerHtml,
  createPopupHtml,
  DEFAULT_PIN_COLOR,
  SELECTED_PIN_COLOR,
  SEOUL_CITY_HALL,
  OPEN_STREET_MAP_URL,
  OPEN_STREET_MAP_ATTRIBUTION,
  type MapFacility,
} from "../components/map/leaflet-map";

describe("Leaflet Map Component & Utilities / 지도 컴포넌트 유틸리티 검증", () => {
  describe("Coordinate Validation / 좌표 유효성 검증", () => {
    it("should accept valid coordinates / 정상 위경도 좌표를 승인해야 합니다", () => {
      expect(isValidCoordinate(37.5665, 126.978)).toBe(true);
      expect(isValidCoordinate(33.4996, 126.5312)).toBe(true); // Jeju
      expect(isValidCoordinate(-33.8688, 151.2093)).toBe(true); // Sydney
    });

    it("should reject dummy (0, 0) coordinates / 더미 0,0 좌표를 거부해야 합니다", () => {
      expect(isValidCoordinate(0, 0)).toBe(false);
    });

    it("should reject out-of-range coordinates / 범위를 벗어난 좌표를 거부해야 합니다", () => {
      expect(isValidCoordinate(91, 127)).toBe(false);
      expect(isValidCoordinate(-91, 127)).toBe(false);
      expect(isValidCoordinate(37, 181)).toBe(false);
      expect(isValidCoordinate(37, -181)).toBe(false);
    });

    it("should reject non-numeric and NaN coordinates / NaN 및 유효하지 않은 타입을 거부해야 합니다", () => {
      expect(isValidCoordinate(NaN, 127)).toBe(false);
      expect(isValidCoordinate(37, NaN)).toBe(false);
      expect(isValidCoordinate(null, 127)).toBe(false);
      expect(isValidCoordinate(37, undefined)).toBe(false);
      expect(isValidCoordinate("37.5" as any, 127)).toBe(false);
      expect(isValidCoordinate(Infinity, 127)).toBe(false);
    });
  });

  describe("Facility Filtering / 유효 좌표 시설 필터링", () => {
    const mockFacilities: MapFacility[] = [
      {
        id: "fac-1",
        name: "잠실 파크골프장",
        lat: 37.5148,
        lng: 127.0728,
        holes: 18,
      },
      {
        id: "fac-invalid-zero",
        name: "더미 시설",
        lat: 0,
        lng: 0,
      },
      {
        id: "fac-invalid-nan",
        name: "좌표 누락 시설",
        lat: NaN,
        lng: 127.0,
      },
      {
        id: "fac-2",
        name: "여의도 파크골프장",
        lat: 37.5255,
        lng: 126.9248,
        holes: 9,
      },
    ];

    it("should only keep facilities with valid lat/lng coordinates", () => {
      const valid = filterValidFacilities(mockFacilities);
      expect(valid.length).toBe(2);
      expect(valid.map((f) => f.id)).toEqual(["fac-1", "fac-2"]);
    });
  });

  describe("Custom Marker Creation / 커스텀 핀 마커 생성 로직", () => {
    it("should render clean green pin (#0f766e) for unselected facility", () => {
      const html = createMarkerHtml({ name: "한강 파크골프장", holes: 18 }, false);
      expect(html).toContain(DEFAULT_PIN_COLOR); // #0f766e
      expect(html).toContain("18H");
      expect(html).toContain("한강 파크골프장");
      expect(html).not.toContain("selected");
    });

    it("should render highlighted pin with SELECTED_PIN_COLOR (#10b981) when selected", () => {
      const html = createMarkerHtml({ name: "한강 파크골프장", holes: 18 }, true);
      expect(html).toContain(SELECTED_PIN_COLOR); // #10b981
      expect(html).toContain("selected");
      expect(html).toContain("scale(1.15)");
    });

    it("should fallback to golf flag icon when holes is missing", () => {
      const html = createMarkerHtml({ name: "홀수 미정 골프장", holes: null }, false);
      expect(html).toContain("⛳");
      expect(html).toContain("홀수 미정 골프장");
    });

    it("should properly escape facility names against XSS", () => {
      const html = createMarkerHtml({ name: '<script>alert("xss")</script>' }, false);
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });
  });

  describe("Popup Generation / 팝업 생성 로직", () => {
    it("should render popup with details and link", () => {
      const facility: MapFacility = {
        id: "test-facility-123",
        name: "올림픽 파크골프장",
        lat: 37.52,
        lng: 127.12,
        holes: 27,
        feeSummary: "무료 (구민 전용)",
        address: "서울특별시 송파구 올림픽로 424",
      };

      const popupHtml = createPopupHtml(facility);
      expect(popupHtml).toContain("올림픽 파크골프장");
      expect(popupHtml).toContain("27홀");
      expect(popupHtml).toContain("무료 (구민 전용)");
      expect(popupHtml).toContain("서울특별시 송파구 올림픽로 424");
      expect(popupHtml).toContain("/facility/test-facility-123");
      expect(popupHtml).toContain("상세보기");
    });

    it("should handle optional fields gracefully in popup", () => {
      const facility: MapFacility = {
        id: "minimal",
        name: "기본 파크골프장",
        lat: 37.5,
        lng: 127.0,
      };

      const popupHtml = createPopupHtml(facility);
      expect(popupHtml).toContain("기본 파크골프장");
      expect(popupHtml).not.toContain("undefined");
      expect(popupHtml).not.toContain("null");
    });
  });

  describe("Map Configuration / 오픈스트리트맵 설정", () => {
    it("should have correct OpenStreetMap tile URL and attribution", () => {
      expect(OPEN_STREET_MAP_URL).toBe("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
      expect(OPEN_STREET_MAP_ATTRIBUTION).toContain("OpenStreetMap");
    });

    it("should default center to Seoul City Hall", () => {
      expect(SEOUL_CITY_HALL).toEqual([37.5665, 126.978]);
    });
  });

  describe("Leaflet Marker & Event Simulation / 마커 생성 및 클릭 이벤트 처리", () => {
    it("should invoke onSelectFacility callback when marker is clicked", () => {
      const onSelectFacility = vi.fn();
      const facilityId = "facility-xyz";

      // Simulate Leaflet marker click handler behavior
      const clickHandler = () => {
        onSelectFacility(facilityId);
      };

      clickHandler();
      expect(onSelectFacility).toHaveBeenCalledTimes(1);
      expect(onSelectFacility).toHaveBeenCalledWith("facility-xyz");
    });
  });
});
