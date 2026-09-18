import { describe, expect, it } from "vitest";
import { isParkGolfVenue, clusterDuplicates, NormalizedFacilityCandidate } from "../src/bot-domain.js";

describe("isParkGolfVenue / 파크골프장 판단 판별기", () => {
  it("should confirm park golf venues / 파크골프장의 키워드가 있으면 true를 반환해야 합니다", () => {
    expect(
      isParkGolfVenue({
        name: "잠실파크골프장",
        rawText: "시설 운영 안내",
        sourceName: "official",
        sourceUrl: "https://example.com",
      })
    ).toBe(true);

    expect(
      isParkGolfVenue({
        name: "일반 골프장",
        rawText: "여기는 Park Golf를 즐기는 곳입니다",
        sourceName: "official",
        sourceUrl: "https://example.com",
      })
    ).toBe(true);
  });

  it("should reject screen golf and normal golf clubs / 스크린 골프 및 일반 골프장은 거부해야 합니다", () => {
    expect(
      isParkGolfVenue({
        name: "강남스크린골프클럽",
        rawText: "파크골프 느낌의 스크린골프",
        sourceName: "kakao",
        sourceUrl: "https://example.com",
      })
    ).toBe(false);

    expect(
      isParkGolfVenue({
        name: "해운대CC",
        rawText: "18홀 정규 골프장",
        sourceName: "other",
        sourceUrl: "https://example.com",
      })
    ).toBe(false);
  });

  it("should allow screen park golf and indoor park golf / 스크린 파크골프 및 실내 파크골프장은 허용해야 합니다", () => {
    expect(
      isParkGolfVenue({
        name: "강남실내파크골프장",
        rawText: "실내파크골프 연습 시설",
        sourceName: "kakao",
        sourceUrl: "https://example.com",
      })
    ).toBe(true);

    expect(
      isParkGolfVenue({
        name: "동구 스크린 파크골프",
        rawText: "스크린 파크골프 18홀 완비",
        sourceName: "kakao",
        sourceUrl: "https://example.com",
      })
    ).toBe(true);
  });
});

describe("clusterDuplicates / 중복 클러스터링", () => {
  it("should cluster exact and probable duplicates / 완전히 같거나 유사한 시설들을 그룹핑해야 합니다", () => {
    const candidates: NormalizedFacilityCandidate[] = [
      {
        contentHash: "hash1",
        sourceName: "A",
        sourceUrl: "http://url1",
        name: "여의도 파크골프장",
        address: "서울시 영등포구 여의도동 1",
        province: "Seoul",
        district: "Yeongdeungpo",
        regionKey: "capital",
        operatorName: "영등포구",
        phone: "02-123-4567",
        lat: 37.5,
        lng: 126.9,
        rawText: "파크골프",
        normalizedName: "여의도파크골프장",
        normalizedAddress: "서울시영등포구여의도동1",
        normalizedOperatorName: "영등포구",
        sourceKind: "official",
      },
      {
        contentHash: "hash1", // Exact match by hash
        sourceName: "B",
        sourceUrl: "http://url2",
        name: "여의도 파크골프장",
        address: "서울시 영등포구 여의도동 1",
        province: "Seoul",
        district: "Yeongdeungpo",
        regionKey: "capital",
        operatorName: "영등포구",
        phone: "02-123-4567",
        lat: 37.5,
        lng: 126.9,
        rawText: "파크골프",
        normalizedName: "여의도파크골프장",
        normalizedAddress: "서울시영등포구여의도동1",
        normalizedOperatorName: "영등포구",
        sourceKind: "official",
      },
      {
        contentHash: "hash2", // Probable match by name/address
        sourceName: "C",
        sourceUrl: "http://url3",
        name: "여의도 파크골프장",
        address: "서울시 영등포구 여의도동 1",
        province: "Seoul",
        district: "Yeongdeungpo",
        regionKey: "capital",
        operatorName: "영등포구",
        phone: "02-123-4567",
        lat: 37.5,
        lng: 126.9,
        rawText: "파크골프",
        normalizedName: "여의도파크골프장",
        normalizedAddress: "서울시영등포구여의도동1",
        normalizedOperatorName: "영등포구",
        sourceKind: "official",
      },
    ];

    const clusters = clusterDuplicates(candidates);

    expect(clusters.length).toBe(1);
    expect(clusters[0].canonicalKey).toBe("hash1");
    expect(clusters[0].memberKeys).toContain("hash1");
    expect(clusters[0].memberKeys).toContain("hash2");
  });

  it("should not cluster candidates with same normalizedName & province if districts differ and distance > 10km or missing", () => {
    // Generic name in different districts with no coords or far distance
    const candidates: NormalizedFacilityCandidate[] = [
      {
        contentHash: "hash-gangnam",
        sourceName: "A",
        sourceUrl: "http://url1",
        name: "시민 파크골프장",
        address: "서울시 강남구 개포동",
        province: "서울",
        district: "강남구",
        regionKey: "capital",
        operatorName: null,
        phone: null,
        lat: 37.48,
        lng: 127.06,
        rawText: "파크골프",
        normalizedName: "시민",
        normalizedAddress: "서울시강남구개포동",
        sourceKind: "official",
      },
      {
        contentHash: "hash-gangseo",
        sourceName: "B",
        sourceUrl: "http://url2",
        name: "시민 파크골프장",
        address: "서울시 강서구 마곡동",
        province: "서울",
        district: "강서구",
        regionKey: "capital",
        operatorName: null,
        phone: null,
        lat: 37.56,
        lng: 126.83, // Distance Gangnam to Gangseo > 20km
        rawText: "파크골프",
        normalizedName: "시민",
        normalizedAddress: "서울시강서구마곡동",
        sourceKind: "official",
      },
    ];

    const clusters = clusterDuplicates(candidates);
    expect(clusters.length).toBe(0);
  });

  it("should cluster candidates with same normalizedName & province across differing districts if within 10km", () => {
    const candidates: NormalizedFacilityCandidate[] = [
      {
        contentHash: "hash-border-1",
        sourceName: "A",
        sourceUrl: "http://url1",
        name: "탄천 파크골프장",
        address: "서울시 강남구 일원동",
        province: "서울",
        district: "강남구",
        regionKey: "capital",
        operatorName: null,
        phone: null,
        lat: 37.49,
        lng: 127.08,
        rawText: "파크골프",
        normalizedName: "탄천",
        normalizedAddress: "서울시강남구일원동",
        sourceKind: "official",
      },
      {
        contentHash: "hash-border-2",
        sourceName: "B",
        sourceUrl: "http://url2",
        name: "탄천 파크골프장",
        address: "서울시 송파구 잠실동",
        province: "서울",
        district: "송파구",
        regionKey: "capital",
        operatorName: null,
        phone: null,
        lat: 37.50,
        lng: 127.09, // Distance < 2km
        rawText: "파크골프",
        normalizedName: "탄천",
        normalizedAddress: "서울시송파구잠실동",
        sourceKind: "kakao",
      },
    ];

    const clusters = clusterDuplicates(candidates);
    expect(clusters.length).toBe(1);
    expect(clusters[0].canonicalKey).toBe("hash-border-1");
  });
});
