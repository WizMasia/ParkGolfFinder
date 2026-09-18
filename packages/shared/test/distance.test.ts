import { describe, expect, it } from "vitest";
import { haversineKm } from "../src/distance.js";

describe("Distance Utility (Haversine) / 거리 계산 유틸리티 (하버사인)", () => {
  it("should calculate correct distance in kilometers / 두 지점 간 최단 거리를 정확한 킬로미터(km)로 반환해야 합니다", () => {
    // Coordinate of Seoul City Hall (서울시청 좌표)
    const seoulCityHall = { lat: 37.5662952, lng: 126.9779451 };

    // Coordinate of Jamsil Sports Complex (잠실종합운동장 좌표, 약 10.6km 거리)
    const jamsilComplex = { lat: 37.5148406, lng: 127.0728795 };

    const distance = haversineKm(seoulCityHall, jamsilComplex);

    // Distance should be approximately between 10.0 and 11.5 km
    // 거리는 대략 10.0 ~ 11.5 km 사이여야 합니다.
    expect(distance).toBeGreaterThan(10.0);
    expect(distance).toBeLessThan(11.5);
  });

  it("should return 0 for identical points / 동일 지점 간의 거리는 0이어야 합니다", () => {
    const point = { lat: 37.5, lng: 126.9 };
    expect(haversineKm(point, point)).toBe(0);
  });
});
