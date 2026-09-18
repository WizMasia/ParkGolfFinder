import { describe, it, expect } from "vitest";
import React from "react";
import { ReservationTable, formatMethodType } from "../components/detail/reservation-table";
import { PricingTable, formatFeeType } from "../components/detail/pricing-table";
import { FacilitySpecTable, formatHolesText } from "../components/detail/facility-spec-table";
import FacilityDetailPage from "../app/facility/[id]/page";

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

describe("Facility Detail Page & Components / 시설 상세 페이지 및 컴포넌트", () => {
  describe("ReservationTable / 예약 정보 표 컴포넌트", () => {
    it("should format reservation method type correctly", () => {
      expect(formatMethodType("phone")).toBe("전화 예약");
      expect(formatMethodType("internet_first_come")).toBe("인터넷 선착순");
      expect(formatMethodType("internet_lottery")).toBe("인터넷 추첨제");
      expect(formatMethodType("visit")).toBe("현장 방문 접수");
      expect(formatMethodType("none")).toBe("예약 불필요 / 현장 이용");
      expect(formatMethodType("unknown")).toBe("기타 안내");
    });

    it("should render reservation table with method items", () => {
      const methods = [
        {
          id: "m-1",
          methodType: "internet_first_come",
          methodText: "송파구 통합예약 사이트 선착순 접수",
          priority: 1,
          ruleText: "매월 25일 오전 9시 예약 시작",
          notes: "관내 주민 우선 예약 2일간 적용",
        },
        {
          id: "m-2",
          methodType: "phone",
          methodText: "관리사무소 전화 문의",
          priority: 2,
          notes: "만 65세 이상 어르신만 유선 접수 가능",
        },
      ];

      const element = ReservationTable({
        summary: "인터넷 선착순 및 전화 예약 병행",
        methods,
      });

      const json = safeStringify(element);
      expect(json).toContain("예약 및 이용 안내");
      expect(json).toContain("인터넷 선착순 및 전화 예약 병행");
      expect(json).toContain("인터넷 선착순");
      expect(json).toContain("전화 예약");
      expect(json).toContain("송파구 통합예약 사이트 선착순 접수");
      expect(json).toContain("매월 25일 오전 9시 예약 시작");
      expect(json).toContain("만 65세 이상 어르신만 유선 접수 가능");
    });

    it("should render fallback message when methods array is empty or undefined", () => {
      const elementEmpty = ReservationTable({ summary: null, methods: [] });
      const jsonEmpty = safeStringify(elementEmpty);
      expect(jsonEmpty).toContain("등록된 세부 예약 규칙이 없습니다");

      const elementNull = ReservationTable({ summary: null, methods: null });
      const jsonNull = safeStringify(elementNull);
      expect(jsonNull).toContain("등록된 세부 예약 규칙이 없습니다");
    });
  });

  describe("PricingTable / 요금 및 경로우대 표 컴포넌트", () => {
    it("should format fee type correctly", () => {
      expect(formatFeeType("free")).toBe("무료 이용");
      expect(formatFeeType("paid")).toBe("유료 이용");
      expect(formatFeeType("partial")).toBe("일부 유료 / 조건부 무료");
      expect(formatFeeType("inquiry")).toBe("전화 문의 요망");
      expect(formatFeeType(undefined)).toBe("확인 필요");
    });

    it("should render pricing table with senior concession discount highlighted", () => {
      const pricing = {
        feeType: "paid",
        baseFeeText: "성인 3,000원 / 청소년 2,000원",
        concessionFeeText: "만 65세 이상 어르신 50% 할인 (1,500원)",
      };

      const element = PricingTable({ pricing });
      const json = safeStringify(element);

      expect(json).toContain("이용 요금 및 감면 혜택");
      expect(json).toContain("유료 이용");
      expect(json).toContain("성인 3,000원 / 청소년 2,000원");
      expect(json).toContain("경로우대 (만 65세 이상)");
      expect(json).toContain("만 65세 이상 어르신 50% 할인 (1,500원)");
    });

    it("should handle free facility pricing correctly", () => {
      const freePricing = {
        feeType: "free",
        baseFeeText: "무료 이용 가능",
        concessionFeeText: null,
      };

      const element = PricingTable({ pricing: freePricing });
      const json = safeStringify(element);

      expect(json).toContain("무료 이용");
      expect(json).toContain("무료 이용 가능");
      expect(json).toContain("기본 무료 시설로 모든 연령 무료 이용 가능합니다");
    });

    it("should handle omitted pricing data with graceful fallbacks", () => {
      const element = PricingTable({ pricing: null });
      const json = safeStringify(element);

      expect(json).toContain("현장 확인 필요");
      expect(json).toContain("별도 명시된 경로우대 기준이 없습니다");
    });
  });

  describe("FacilitySpecTable / 코스 사양 및 시설 정보 표", () => {
    it("should format holes count correctly", () => {
      expect(formatHolesText(18)).toBe("18홀 정규 코스");
      expect(formatHolesText(36)).toBe("36홀 정규 코스");
      expect(formatHolesText(null)).toBe("홀수 정보 확인 필요");
      expect(formatHolesText(undefined)).toBe("홀수 정보 확인 필요");
    });

    it("should render facility specifications with operator, phone, and holes", () => {
      const specData = {
        holes: 18,
        facilityType: "outdoor",
        operatorName: "송파구청 체육진흥과",
        phone: "02-423-0045",
        address: "서울특별시 송파구 잠실동 10",
        ownership: "public",
        closedDaysText: "매주 월요일 정기 휴장",
      };

      const element = FacilitySpecTable({ facility: specData });
      const json = safeStringify(element);

      expect(json).toContain("코스 사양 및 시설 정보");
      expect(json).toContain("18홀 정규 코스");
      expect(json).toContain("야외 천연/인조 잔디 코스");
      expect(json).toContain("공공 체육시설");
      expect(json).toContain("송파구청 체육진흥과");
      expect(json).toContain("02-423-0045");
      expect(json).toContain("서울특별시 송파구 잠실동 10");
      expect(json).toContain("매주 월요일 정기 휴장");
    });

    it("should gracefully handle missing phone and operator", () => {
      const minimalData = {
        holes: null,
        facilityType: null,
        operatorName: null,
        phone: null,
        address: null,
        ownership: null,
      };

      const element = FacilitySpecTable({ facility: minimalData });
      const json = safeStringify(element);

      expect(json).toContain("홀수 정보 확인 필요");
      expect(json).toContain("지자체 체육회 및 관리부서");
      expect(json).toContain("등록된 전화번호가 없습니다");
      expect(json).toContain("주소 정보 확인 필요");
    });
  });

  describe("FacilityDetailPage Route Component / 상세 페이지 라우트 서버 컴포넌트", () => {
    it("should render detail page successfully with mock facility fallback", async () => {
      const page = await FacilityDetailPage({
        params: Promise.resolve({ id: "seed-facility-jamsil" }),
      });

      expect(page).toBeDefined();
      const json = safeStringify(page);

      // Header checks
      expect(json).toContain("잠실 파크골프장");
      expect(json).toContain("서울특별시 송파구 잠실동 10");
      expect(json).toContain("02-423-0045");
      expect(json).toContain("송파구청");
      expect(json).toContain("목록으로 돌아가기");

      // Subcomponent props checks in element tree
      expect(page.props.children[1].props.children).toBeDefined();
      const children = page.props.children[1].props.children;
      // Children: [header, reservationTable, pricingTable, specTable, mapSection]
      expect(children.length).toBe(5);

      // Reservation table element
      expect(children[1].type).toBe(ReservationTable);
      expect(children[1].props.summary).toContain("인터넷 선착순");
      expect(children[1].props.methods.length).toBe(2);

      // Pricing table element
      expect(children[2].type).toBe(PricingTable);
      expect(children[2].props.pricing.baseFeeText).toContain("3,000원");
      expect(children[2].props.pricing.concessionFeeText).toContain("경로우대");

      // Spec table element
      expect(children[3].type).toBe(FacilitySpecTable);
      expect(children[3].props.facility.operatorName).toBe("송파구청");

      // Map section check
      expect(json).toContain("구장 위치 지도");
      expect(json).toContain("파크골프장의 상세 위치를 지도에서 확인하세요.");
    });

    it("should render detail page for Chungju free facility", async () => {
      const page = await FacilityDetailPage({
        params: Promise.resolve({ id: "seed-facility-chungju" }),
      });

      expect(page).toBeDefined();
      const json = safeStringify(page);

      expect(json).toContain("충주 월드 파크골프장");
      expect(json).toContain("충주시시설관리공단");

      const children = page.props.children[1].props.children;
     expect(children[2].props.pricing.feeType).toBe("free");
   });

    it("should enforce text-[17px] for table bodies in detail views for senior accessibility", () => {
      const spec = FacilitySpecTable({
        facility: { holes: 18, operatorName: "테스트", address: "서울" },
      });
      const pricing = PricingTable({
        pricing: { baseFeeText: "무료", feeType: "free" },
      });
      const reservation = ReservationTable({
        summary: "예약 안내",
        methods: [{ id: "1", methodType: "phone", methodText: "전화", priority: 1 }],
      });

      expect(safeStringify(spec)).toContain("text-[17px]");
      expect(safeStringify(pricing)).toContain("text-[17px]");
      expect(safeStringify(reservation)).toContain("text-[17px]");
    });
  });
});
