import { describe, expect, it, vi, beforeEach } from "vitest";
import { getFallbackCoords, geocodeAddress, geocodeAddressWithJuso, PROVINCE_FALLBACK_COORDS, DEFAULT_COORDS } from "../src/classification/geocoder.js";

describe("Geocoder / 지오코더 모듈 테스트", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_MAP_API_KEY", "");
    vi.stubEnv("KAKAO_REST_API_KEY", "");
    vi.stubEnv("JUSO_CONFIRM_KEY", "");
    vi.stubEnv("JUSO_COORD_CONFIRM_KEY", "");
  });

  it("should return correct fallback coords for provinces / 각 도별 올바른 대체 좌표를 반환해야 합니다", () => {
    const seoulCoords = getFallbackCoords("서울특별시 송파구 올림픽로");
    expect(seoulCoords).toEqual(PROVINCE_FALLBACK_COORDS["서울"]);

    const gangwonCoords = getFallbackCoords("강원특별자치도 원주시");
    expect(gangwonCoords).toEqual(PROVINCE_FALLBACK_COORDS["강원"]);
  });

  it("should return default coords for invalid or unknown address / 알 수 없는 주소에 대해 기본 좌표를 반환해야 합니다", () => {
    const defaultCoords = getFallbackCoords("아틀란티스 대륙 123");
    expect(defaultCoords).toEqual(DEFAULT_COORDS);

    const emptyCoords = getFallbackCoords("");
    expect(emptyCoords).toEqual(DEFAULT_COORDS);
  });

  it("should return null if API key is not configured / API 키가 설정되지 않은 경우 null을 반환해야 합니다", async () => {
    const result = await geocodeAddress("서울특별시 송파구 올림픽로", "TestAgent");
    expect(result).toBeNull();
  });

  it("should parse and return coordinates on successful API fetch / API 호출 성공 시 좌표를 파싱하여 반환해야 합니다", async () => {
    vi.stubEnv("KAKAO_REST_API_KEY", "mock-api-key");

    const mockResponse = {
      documents: [
        {
          x: "127.0286",
          y: "37.2636",
        },
      ],
    };

    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geocodeAddress("경기도 수원시", "TestAgent");
    expect(globalFetch).toHaveBeenCalled();
    expect(result).toEqual({ lat: 37.2636, lng: 127.0286 });

    globalFetch.mockRestore();
  });

  it("should call Juso search then coordinate API and transform GRS80 to WGS84 / Juso API를 통해 GRS80 좌표를 획득하고 WGS84로 정상 변환해야 합니다", async () => {
    vi.stubEnv("JUSO_CONFIRM_KEY", "mock-juso-key");

    // 1st fetch (Juso Search API)
    const mockSearchResponse = {
      results: {
        common: { errorCode: "0", errorMessage: "정상" },
        juso: [{
          admCd: "1171010200",
          rnMgtSn: "117103123023",
          udrtYn: "0",
          buldMnnm: "333",
          buldSlno: "0",
        }],
      },
    };

    // 2nd fetch (Juso Coordinates API)
    // Sample coordinates in EPSG:5179 representing Seoul City Hall area
    const mockCoordResponse = {
      results: {
        common: { errorCode: "0", errorMessage: "정상" },
        juso: [{
          entX: "953835.63",
          entY: "1952285.59",
        }],
      },
    };

    let fetchCount = 0;
    const globalFetch = vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      fetchCount++;
      const resData = fetchCount === 1 ? mockSearchResponse : mockCoordResponse;
      return {
        ok: true,
        json: async () => resData,
      } as Response;
    });

    const result = await geocodeAddressWithJuso("서울특별시 송파구 올림픽로 333", "TestAgent");

    expect(globalFetch).toHaveBeenCalledTimes(2);
    expect(result).not.toBeNull();
    // Validate converted coordinates range (Seoul area is around 37.5 lat, 126.9 lng)
    expect(result!.lat).toBeCloseTo(37.566, 1);
    expect(result!.lng).toBeCloseTo(126.978, 1);

    globalFetch.mockRestore();
  });
});
