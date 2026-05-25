import { findFacilityById } from "@parkgolf/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReservationMethodList } from "../../../components/reservation-method-list";
import FacilityMap from "../../../components/facility-map";

interface FacilityDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Detail page for single facility dynamic route.
 * 특정 시설 상세 내역을 가져와 표시하는 상세 페이지 컴포넌트입니다.
 */
export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { id } = await params;
  const facility = await findFacilityById(id);

  if (!facility) {
    notFound();
  }

  // Formatting fee type label
  // 요금 형태 라벨 변환
  const getFeeTypeLabel = (type: string) => {
    switch (type) {
      case "free":
        return "무료 / Free";
      case "paid":
        return "유료 / Paid";
      case "partial":
        return "일부 유료 / Partial Paid";
      case "inquiry":
        return "전화 문의 / Inquiry";
      default:
        return "확인 불가 / Unknown";
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-12">
      {/* Navigation header */}
      {/* 네비게이션 헤더 */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          ← 목록으로 돌아가기 / Back to List
        </Link>
      </div>

      <div className="space-y-8">
        {/* 1. Summary card */}
        {/* 1. 요약 카드 */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 shadow-xl">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {facility.facilityType === "outdoor" ? "야외 코스 / Outdoor" : "실내 코스 / Indoor"}
          </span>
          <h1 className="text-3xl font-black text-white mb-2">{facility.name}</h1>
          <p className="text-slate-400 text-sm">{facility.address}</p>
        </section>

        {/* 2. Reservation info */}
        {/* 2. 예약 방식 정보 */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">예약 방법 / Booking Information</h2>
          <ReservationMethodList methods={facility.reservation?.methods || []} />
        </section>

        {/* 3. Pricing details */}
        {/* 3. 요금 및 감면 정보 */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">이용 요금 / Pricing Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-sm text-slate-400">요금 유형 / Fee Type</span>
              <span className="text-sm font-semibold text-white">
                {getFeeTypeLabel(facility.pricing?.feeType || "paid")}
              </span>
            </div>
            <div className="flex justify-between items-start py-2">
              <span className="text-sm text-slate-400">기본 요금 / Base Fee</span>
              <span className="text-sm font-semibold text-emerald-400 text-right max-w-xs">
                {facility.pricing?.baseFeeText}
              </span>
            </div>
            {facility.pricing?.concessionFeeText && (
              <div className="flex justify-between items-start py-2 border-t border-slate-800/40">
                <span className="text-sm text-slate-400">할인 및 경로우대 / Concession Fee</span>
                <span className="text-sm font-semibold text-slate-300 text-right max-w-xs">
                  {facility.pricing.concessionFeeText}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 4. Map area */}
        {/* 4. 지도 영역 */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white">위치 지도 / Location Map</h2>
          <FacilityMap lat={facility.lat} lng={facility.lng} name={facility.name} />
        </section>

        {/* 5. Operator information */}
        {/* 5. 운영 정보 및 연락처 */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">운영 및 문의처 / Operator Contacts</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">운영 주체 / Operator</span>
              <span className="text-sm font-semibold text-white">{facility.operatorName}</span>
            </div>
            {facility.phone && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">전화번호 / Phone</span>
                <span className="text-sm font-semibold text-emerald-400">{facility.phone}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
