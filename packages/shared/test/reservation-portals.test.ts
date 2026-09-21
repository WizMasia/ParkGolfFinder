import { describe, expect, it } from "vitest";
import {
  REGIONAL_RESERVATION_MAP,
  resolveRegionalReservationUrl,
} from "../src/reservation-portals.js";

describe("Regional Reservation Portals / 전국 예약 포털 매핑 규칙", () => {
  it("should contain verified rules across major regions", () => {
    expect(REGIONAL_RESERVATION_MAP.length).toBeGreaterThan(40);
  });

  it("should resolve Songpa-gu reservation portal correctly", () => {
    const url = resolveRegionalReservationUrl({
      province: "서울",
      district: "송파구",
      name: "송파 파크골프장",
    });
    expect(url).toBe("https://www.songpashisul.or.kr");
  });

  it("should resolve Seoul keyword match for Jamsil", () => {
    const url = resolveRegionalReservationUrl({
      province: "서울",
      district: null,
      name: "잠실 파크골프장",
    });
    expect(url).toBe("https://yeyak.seoul.go.kr");
  });

  it("should resolve provincial portals like Daegu", () => {
    const url = resolveRegionalReservationUrl({
      province: "대구",
      district: "동구",
      name: "불로 파크골프장",
    });
    expect(url).toBe("https://dgpg.daegu.go.kr");
  });

  it("should return null when no rule matches", () => {
    const url = resolveRegionalReservationUrl({
      province: "알수없음",
      district: "미상구",
      name: "가상의 골프장",
    });
    expect(url).toBeNull();
  });
});
