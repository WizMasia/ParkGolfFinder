import { describe, expect, it } from "vitest";
import { REGION_GROUPS } from "../src/regions.js";

describe("Region Groups Lookup / 권역 맵핑 테이블", () => {
  it("should contain standard Korean provinces / 표준 광역 자치단체 명이 포함되어 있어야 합니다", () => {
    expect(REGION_GROUPS.capital).toContain("서울");
    expect(REGION_GROUPS.capital).toContain("경기");
    expect(REGION_GROUPS.yeongnam).toContain("부산");
    expect(REGION_GROUPS.yeongnam).toContain("대구");
    expect(REGION_GROUPS.honam).toContain("광주");
  });
});
