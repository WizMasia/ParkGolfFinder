import { findFacilitiesByQuery } from "@parkgolf/db";
import { FacilitySearchUi } from "../components/facility-search-ui";
import { MOCK_FACILITIES } from "../lib/mock-data";
import { FacilitySummary } from "@parkgolf/shared";

function isRealHomepageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  const blacklistedDomains = [
    "parkgolflist.com",
    "djpkgolf.kr",
    "api.odcloud.kr",
    "data.go.kr",
    "openapi.gg.go.kr",
    "eshare.go.kr",
    "local_upload"
  ];
  return !blacklistedDomains.some(domain => lowercaseUrl.includes(domain));
}

/**
 * Root Home Page of the ParkGolfFinder Web Application.
 * ParkGolfFinder 웹 애플리케이션의 루트 홈 페이지입니다.
 */
export const revalidate = 60;

export default async function HomePage() {
  let dbFacilities: any[] = [];
  try {
    dbFacilities = await findFacilitiesByQuery("");
  } catch (error) {
    console.warn(
      "Database connection failed, falling back to mock data / 데이터베이스 연결 실패, 모의 데이터로 대체합니다:",
      error
    );
  }

  // Map database records to FacilitySummary format
  // 데이터베이스 레코드를 FacilitySummary 포맷으로 변환합니다.
  const mappedFacilities: FacilitySummary[] =
    dbFacilities.length > 0
      ? dbFacilities.map((f: any) => {
          const reservationUrl = f.reservation?.methods?.find((m: any) => m.url)?.url;
          const bestUrl =
            reservationUrl ||
            f.sourceUrl ||
            (f.kakaoPlaceId ? `https://place.map.kakao.com/${f.kakaoPlaceId}` : null);
          return {
            id: f.id,
            name: f.name,
            address: f.address,
            province: f.province,
            district: f.district,
            regionKey: f.regionKey,
            facilityType: f.facilityType as any,
            status: f.status as any,
            ownership: f.ownership as any,
            operatorName: f.operatorName,
            phone: f.phone,
            lat: f.lat,
            lng: f.lng,
            baseFeeText: f.pricing?.baseFeeText || "정보 없음 / No Info",
            concessionFeeText: f.pricing?.concessionFeeText || null,
            kakaoPlaceId: f.kakaoPlaceId,
            naverPlaceId: f.naverPlaceId,
            mapSearchQuery: f.mapSearchQuery,
            reservationSummary: f.reservation?.summary || "예약 정보 확인 필요",
            homepageUrl: (bestUrl && isRealHomepageUrl(bestUrl)) ? bestUrl : null,
          };
        })
      : (MOCK_FACILITIES as any[]);

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-12">
      <header className="mb-12 text-center md:text-left">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          모던 파크골프 가이드 / Modern Park Golf Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          ParkGolf<span className="text-emerald-400">Finder</span>
        </h1>
        <p className="text-slate-400 max-w-xl text-lg">
          전국 파크골프장의 위치 정보와 예약 방법, 요금 요약을 쉽고 빠르게 필터링하여 조회하세요.
        </p>
      </header>

      <section>
        <FacilitySearchUi initialFacilities={mappedFacilities} />
      </section>
    </main>
  );
}
