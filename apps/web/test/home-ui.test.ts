import { describe, it, expect, vi } from "vitest";
import React from "react";
import { ViewToggle, type ViewMode } from "../components/home/view-toggle";
import { SeniorFacilityCard, formatFeeSummary, formatHolesSummary } from "../components/home/facility-card";
import { SeniorHomeShell } from "../components/home/senior-home-shell";
import type { FacilitySummary } from "@parkgolf/shared";

function safeStringify(node: any): string {
  const seen = new WeakSet();
  return JSON.stringify(node, (_key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return undefined;
      seen.add(value);
    }
    return value;
  });
}

describe("Senior-Friendly Home UI Components / 시니어 친화적 홈 UI 컴포넌트", () => {
  describe("ViewToggle / 목록 및 지도 토글 컴포넌트", () => {
    it("should render both list and map buttons with senior-friendly labels", () => {
      const onModeChange = vi.fn();
      const element = React.createElement(ViewToggle, {
        mode: "list",
        onModeChange,
      });

      expect(element).toBeDefined();
      expect(element.props.mode).toBe("list");
      expect(element.props.onModeChange).toBe(onModeChange);
    });

    it("should have correct button labels containing clear icons and korean text", () => {
      const listProps = { mode: "list" as ViewMode, onModeChange: vi.fn() };
      const renderedList = ViewToggle(listProps);
      expect(renderedList).toBeDefined();

      const jsonString = JSON.stringify(renderedList);
      expect(jsonString).toContain("목록으로 보기");
      expect(jsonString).toContain("지도로 모아보기");
      expect(jsonString).toContain("📋");
      expect(jsonString).toContain("🗺️");
      expect(jsonString).toContain("#0f766e");
    });

    it("should switch modes and highlight the active mode button", () => {
      const onModeChange = vi.fn();
      const listToggle = ViewToggle({ mode: "list", onModeChange });
      const mapToggle = ViewToggle({ mode: "map", onModeChange });

      const listStr = JSON.stringify(listToggle);
      const mapStr = JSON.stringify(mapToggle);

      expect(listStr).toContain('aria-pressed":true');
      expect(mapStr).toContain('aria-pressed":true');
      expect(listStr).toContain("#0f766e");
      expect(mapStr).toContain("#0f766e");
    });
  });

  describe("FacilityCard helpers / 시설 카드 표시 헬퍼", () => {
    it("should format fee summary correctly with priority", () => {
      expect(formatFeeSummary({ baseFeeText: "무료", feeSummary: undefined })).toBe("무료");
      expect(formatFeeSummary({ baseFeeText: "2,000원", feeSummary: "관내 2,000원 / 관외 5,000원" })).toBe("관내 2,000원 / 관외 5,000원");
      expect(formatFeeSummary({ baseFeeText: "무료", feeSummary: null })).toBe("무료");
      expect(formatFeeSummary({ baseFeeText: "정보 없음", feeSummary: undefined })).toBe(null);
      expect(formatFeeSummary({ baseFeeText: "확인 필요", feeSummary: null })).toBe(null);
    });

    it("should format holes summary correctly", () => {
      expect(formatHolesSummary(18)).toBe("18홀");
      expect(formatHolesSummary(36)).toBe("36홀");
      expect(formatHolesSummary(null)).toBe("홀수 미정");
      expect(formatHolesSummary(undefined)).toBe("홀수 미정");
    });
  });

  describe("SeniorFacilityCard / 시설 카드 컴포넌트", () => {
    const mockFacility: FacilitySummary = {
      id: "fac-jamsil-01",
      name: "잠실 파크골프장",
      address: "서울특별시 송파구 잠실동 10",
      province: "서울",
      district: "송파구",
      regionKey: "capital",
      facilityType: "outdoor",
      status: "active",
      ownership: "public",
      operatorName: "송파구청",
      lat: 37.5148406,
      lng: 127.0728795,
      holes: 18,
      feeSummary: "2,000원",
      baseFeeText: "2,000원",
      distanceKm: 2.4,
      reservationUrl: "https://www.songpashisul.or.kr",
    };

    it("should render card with direct detail link and reservation button", () => {
      const element = SeniorFacilityCard({ facility: mockFacility });
      expect(element.props.className).toContain("rounded-2xl");

      const childrenStr = safeStringify(element.props.children);
      expect(childrenStr).toContain("잠실 파크골프장");
      expect(childrenStr).toContain("2.4 km");
      expect(childrenStr).toContain("18홀");
      expect(childrenStr).toContain("2,000원");
      expect(childrenStr).toContain("서울특별시 송파구 잠실동 10");
      expect(childrenStr).toContain("/facility/fac-jamsil-01");
      expect(childrenStr).toContain("https://www.songpashisul.or.kr");
      expect(childrenStr).toContain("예약하기");
    });

    it("should display free fee badge cleanly when fee is free", () => {
      const freeFacility: FacilitySummary = {
        ...mockFacility,
        id: "fac-free-01",
        name: "여의도 한강 파크골프장",
        holes: 9,
        feeSummary: "무료",
        baseFeeText: "무료",
        distanceKm: 1.2,
        phone: "02-123-4567",
        reservationUrl: null,
      };

      const element = SeniorFacilityCard({ facility: freeFacility });
      const childrenStr = safeStringify(element.props.children);
      expect(childrenStr).toContain("여의도 한강 파크골프장");
      expect(childrenStr).toContain("1.2 km");
      expect(childrenStr).toContain("9홀");
      expect(childrenStr).toContain("무료");
      expect(childrenStr).toContain("tel:021234567");
      expect(childrenStr).toContain("전화 예약 문의");
    });

    it("should handle missing distance, holes, and omit unverified fee badge gracefully", () => {
      const minimalFacility: FacilitySummary = {
        id: "fac-min-01",
        name: "동네 파크골프장",
        address: "경기도 수원시 영통구",
        province: "경기",
        district: "수원시",
        regionKey: "capital",
        facilityType: "outdoor",
        status: "active",
        ownership: "public",
        operatorName: null,
        lat: 37.2,
        lng: 127.1,
        baseFeeText: "정보 없음",
      };

      const element = SeniorFacilityCard({ facility: minimalFacility });
      const childrenStr = safeStringify(element.props.children);
      expect(childrenStr).toContain("동네 파크골프장");
      expect(childrenStr).toContain("경기도 수원시 영통구");
      expect(childrenStr).toContain("홀수 미정");
      expect(childrenStr).not.toContain("undefined km");
      // Unverified fee should be completely omitted from badge (Option 1-A)
      expect(childrenStr).not.toContain("정보 없음");
    });

    it("should render high-contrast light theme classes and touch targets", () => {
      const element = SeniorFacilityCard({ facility: mockFacility });
      expect(element.props.className).toContain("bg-white");
      expect(element.props.className).toContain("border-slate-200");
      const childrenStr = safeStringify(element.props.children);
      expect(childrenStr).toContain("text-slate-900");
      expect(childrenStr).toContain("text-[20px]");
    });
  });

  describe("SeniorHomeShell / 시니어 홈 쉘 컴포넌트", () => {
    it("should export SeniorHomeShell component correctly", () => {
      expect(SeniorHomeShell).toBeDefined();
      expect(typeof SeniorHomeShell).toBe("function");
    });
  });
});
