import { describe, expect, it } from "vitest";
import { CURATED_SEED_FACILITIES } from "../src/seed-data.js";

describe("Curated Seed Facilities / 7대 권역 검증 시드 데이터", () => {
  it("should contain at least 14 verified facilities covering all regions", () => {
    expect(CURATED_SEED_FACILITIES.length).toBeGreaterThanOrEqual(14);
  });

  it("should cover all 7 key regional zones (Seoul, Gyeonggi, Gangwon, Chungcheong, Honam, Yeongnam, Jeju)", () => {
    const provinces = new Set(CURATED_SEED_FACILITIES.map((f) => f.province));
    expect(provinces.has("서울")).toBe(true);
    expect(provinces.has("경기")).toBe(true);
    expect(provinces.has("강원")).toBe(true);
    expect(provinces.has("충북") || provinces.has("세종")).toBe(true);
    expect(provinces.has("광주") || provinces.has("전남")).toBe(true);
    expect(provinces.has("대구") || provinces.has("경남")).toBe(true);
    expect(provinces.has("제주")).toBe(true);

    const regionKeys = new Set(CURATED_SEED_FACILITIES.map((f) => f.regionKey));
    expect(regionKeys.has("capital")).toBe(true);
    expect(regionKeys.has("gangwon")).toBe(true);
    expect(regionKeys.has("chungcheong")).toBe(true);
    expect(regionKeys.has("honam")).toBe(true);
    expect(regionKeys.has("yeongnam")).toBe(true);
    expect(regionKeys.has("jeju")).toBe(true);
  });

  it("should verify that every facility is outdoor and public", () => {
    for (const fac of CURATED_SEED_FACILITIES) {
      expect(fac.facilityType).toBe("outdoor");
      expect(fac.ownership).toBe("public");
      expect(fac.status).toBe("active");
    }
  });

  it("should have valid coordinates and structured pricing with senior concession", () => {
    for (const fac of CURATED_SEED_FACILITIES) {
      expect(fac.lat).toBeGreaterThan(33);
      expect(fac.lat).toBeLessThan(39);
      expect(fac.lng).toBeGreaterThan(125);
      expect(fac.lng).toBeLessThan(130);

      expect(fac.pricing).toBeDefined();
      expect(fac.pricing.baseFeeText).toBeTruthy();
      expect(["free", "paid", "partial", "inquiry"]).toContain(fac.pricing.feeType);

      // Senior concession check (만 65세 이상 or 무료)
      expect(fac.pricing.concessionFeeText).toBeTruthy();
      expect(fac.pricing.concessionFeeText).toMatch(/만 65세|어르신|무료/);
    }
  });

  it("should have structured reservation summary and methods", () => {
    for (const fac of CURATED_SEED_FACILITIES) {
      expect(fac.reservation).toBeDefined();
      expect(fac.reservation.summary).toBeTruthy();
      expect(fac.reservation.methods.length).toBeGreaterThan(0);

      for (const m of fac.reservation.methods) {
        expect(m.methodText).toBeTruthy();
        expect(m.priority).toBeGreaterThanOrEqual(1);
        expect(["phone", "internet_first_come", "internet_lottery", "visit", "none"]).toContain(
          m.methodType
        );
      }
    }
  });
});

