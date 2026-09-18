import { describe, expect, it } from "vitest";
import {
  isOutdoorParkGolf,
  classifyRegion,
  calculateDistanceKm,
} from "../src/index.js";

describe("Outdoor Park Golf Classifier / 실외 파크골프장 노이즈 필터", () => {
  it("should return TRUE for verified outdoor park golf courses", () => {
    expect(isOutdoorParkGolf("여의도 한강 파크골프장")).toBe(true);
    expect(isOutdoorParkGolf("양평 누리 파크골프장", "천연잔디 36홀 야외 구장")).toBe(true);
    expect(isOutdoorParkGolf("잠실 파크골프장", "서울시 송파구 잠실종합운동장 내 체육시설")).toBe(true);
    expect(isOutdoorParkGolf("화천 산천어 파크골프장")).toBe(true);
  });

  it("should return FALSE for screen golf, golfzon, and driving ranges", () => {
    expect(isOutdoorParkGolf("골프존파크 강남점")).toBe(false);
    expect(isOutdoorParkGolf("프렌즈스크린 역삼점")).toBe(false);
    expect(isOutdoorParkGolf("SG골프 연습장")).toBe(false);
    expect(isOutdoorParkGolf("XX실내스크린골프")).toBe(false);
    expect(isOutdoorParkGolf("강남 실내골프연습장")).toBe(false);
    expect(isOutdoorParkGolf("분당 골프 드라이빙레인지")).toBe(false);
    expect(isOutdoorParkGolf("송도 인도어 골프연습장")).toBe(false);
    expect(isOutdoorParkGolf("한일 골프아카데미")).toBe(false);
  });

  it("should return FALSE for conventional golf clubs and country clubs (CC)", () => {
    expect(isOutdoorParkGolf("OO골프클럽")).toBe(false);
    expect(isOutdoorParkGolf("안양컨트리클럽")).toBe(false);
    expect(isOutdoorParkGolf("스카이72 CC")).toBe(false);
    expect(isOutdoorParkGolf("남촌 C.C.")).toBe(false);
    expect(isOutdoorParkGolf("레이크사이드 C.C")).toBe(false);
  });

  it("should return FALSE for indoor/screen facilities even if park golf is mentioned (outdoor only filter)", () => {
    expect(isOutdoorParkGolf("스크린파크골프장 강남점")).toBe(false);
    expect(isOutdoorParkGolf("홍길동 실내 파크골프 클럽")).toBe(false);
    expect(isOutdoorParkGolf("도심 실내스크린 파크골프")).toBe(false);
    expect(isOutdoorParkGolf("영등포 파크골프장", "스크린 타석 5개 구비된 실내 시설")).toBe(false);
  });

  it("should return FALSE if park golf indicator is completely absent", () => {
    expect(isOutdoorParkGolf("한강 시민공원 체육시설")).toBe(false);
    expect(isOutdoorParkGolf("올림픽공원 테니스장")).toBe(false);
    expect(isOutdoorParkGolf("뚝섬유원지 축구장")).toBe(false);
  });
});

describe("Region Classification / 권역 분류", () => {
  it("should classify capital region correctly", () => {
    expect(classifyRegion("서울", "송파구")).toBe("capital");
    expect(classifyRegion("서울특별시", "영등포구")).toBe("capital");
    expect(classifyRegion("경기", "성남시")).toBe("capital");
    expect(classifyRegion("경기도", "양평군")).toBe("capital");
    expect(classifyRegion("인천", "연수구")).toBe("capital");
    expect(classifyRegion("인천광역시")).toBe("capital");
  });

  it("should classify gangwon region correctly", () => {
    expect(classifyRegion("강원", "춘천시")).toBe("gangwon");
    expect(classifyRegion("강원도", "화천군")).toBe("gangwon");
    expect(classifyRegion("강원특별자치도", "원주시")).toBe("gangwon");
  });

  it("should classify chungcheong region correctly", () => {
    expect(classifyRegion("충북", "청주시")).toBe("chungcheong");
    expect(classifyRegion("충청북도", "충주시")).toBe("chungcheong");
    expect(classifyRegion("충남", "천안시")).toBe("chungcheong");
    expect(classifyRegion("충청남도", "아산시")).toBe("chungcheong");
    expect(classifyRegion("대전", "유성구")).toBe("chungcheong");
    expect(classifyRegion("대전광역시")).toBe("chungcheong");
    expect(classifyRegion("세종", "세종시")).toBe("chungcheong");
    expect(classifyRegion("세종특별자치시")).toBe("chungcheong");
  });

  it("should classify honam region correctly", () => {
    expect(classifyRegion("광주", "서구")).toBe("honam");
    expect(classifyRegion("광주광역시")).toBe("honam");
    expect(classifyRegion("전북", "전주시")).toBe("honam");
    expect(classifyRegion("전라북도", "군산시")).toBe("honam");
    expect(classifyRegion("전북특별자치도", "익산시")).toBe("honam");
    expect(classifyRegion("전남", "목포시")).toBe("honam");
    expect(classifyRegion("전라남도", "순천시")).toBe("honam");
  });

  it("should classify yeongnam region correctly", () => {
    expect(classifyRegion("부산", "해운대구")).toBe("yeongnam");
    expect(classifyRegion("부산광역시")).toBe("yeongnam");
    expect(classifyRegion("대구", "수성구")).toBe("yeongnam");
    expect(classifyRegion("대구광역시")).toBe("yeongnam");
    expect(classifyRegion("울산", "남구")).toBe("yeongnam");
    expect(classifyRegion("울산광역시")).toBe("yeongnam");
    expect(classifyRegion("경북", "포항시")).toBe("yeongnam");
    expect(classifyRegion("경상북도", "구미시")).toBe("yeongnam");
    expect(classifyRegion("경남", "창원시")).toBe("yeongnam");
    expect(classifyRegion("경상남도", "김해시")).toBe("yeongnam");
  });

  it("should classify jeju region correctly", () => {
    expect(classifyRegion("제주", "제주시")).toBe("jeju");
    expect(classifyRegion("제주도", "서귀포시")).toBe("jeju");
    expect(classifyRegion("제주특별자치도")).toBe("jeju");
  });

  it("should fallback to capital or fallback when unmatched", () => {
    expect(classifyRegion("기타")).toBe("capital");
    expect(classifyRegion("")).toBe("capital");
  });
});

describe("Distance Utility / calculateDistanceKm", () => {
  it("should calculate distance between two coordinates in kilometers", () => {
    const seoulCityHall = { lat: 37.5662952, lng: 126.9779451 };
    const jamsil = { lat: 37.5148406, lng: 127.0728795 };
    const dist = calculateDistanceKm(
      seoulCityHall.lat,
      seoulCityHall.lng,
      jamsil.lat,
      jamsil.lng
    );
    expect(dist).toBeGreaterThan(10.0);
    expect(dist).toBeLessThan(11.5);
  });

  it("should return 0 for identical coordinates", () => {
    expect(calculateDistanceKm(37.5, 127.0, 37.5, 127.0)).toBe(0);
  });
});
