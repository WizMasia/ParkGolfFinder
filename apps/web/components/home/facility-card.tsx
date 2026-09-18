import React from "react";
import Link from "next/link";
import type { FacilitySummary } from "@parkgolf/shared";

export interface FacilityCardProps {
  facility: FacilitySummary;
  className?: string;
}

/**
 * Formats holes count for senior-readable display
 */
export function formatHolesSummary(holes?: number | null): string {
  if (holes && !isNaN(holes) && holes > 0) {
    return `${holes}홀`;
  }
  return "홀수 미정";
}

/**
 * Formats fee summary into clean Korean text.
 * Returns null if the fee is unverified, missing, or unknown (Option 1-A).
 */
export function formatFeeSummary(facility: { baseFeeText?: string; feeSummary?: string | null }): string | null {
  if (facility.feeSummary && facility.feeSummary.trim().length > 0) {
    const text = facility.feeSummary.trim();
    if (
      text.includes("정보 없음") ||
      text.includes("No Info") ||
      text.includes("확인 필요") ||
      text.includes("미정")
    ) {
      return null;
    }
    return text;
  }
  if (facility.baseFeeText && facility.baseFeeText.trim().length > 0) {
    const text = facility.baseFeeText.trim();
    if (text === "무료") return "무료";
    if (
      text.includes("정보 없음") ||
      text.includes("No Info") ||
      text.includes("확인 필요") ||
      text.includes("미정")
    ) {
      return null;
    }
    return text;
  }
  return null;
}

/**
 * Senior-Friendly Facility Card Component
 * Displays facility name (bold 20px), distance badge, holes count, fee summary (if verified), and address.
 * Provides direct reservation link when available, or detail link with large touch target.
 */
export function SeniorFacilityCard({ facility, className = "" }: FacilityCardProps) {
  const { id, name, address, holes, distanceKm, reservationUrl, phone } = facility;
  const holesText = formatHolesSummary(holes);
  const feeText = formatFeeSummary(facility);
  const isFree = feeText === "무료";
  const distanceText = distanceKm !== undefined && !isNaN(distanceKm) ? `${distanceKm.toFixed(1)} km` : null;

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white p-5 md:p-6 transition-all duration-200 hover:border-teal-700/60 hover:shadow-md shadow-sm ${className}`}
    >
      <div className="flex flex-col justify-between gap-4 h-full min-h-[140px]">
        <div>
          {/* Header Row: Name & Distance Badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[20px] md:text-[22px] font-extrabold text-slate-900 leading-snug">
              <Link
                href={`/facility/${id}`}
                className="hover:text-teal-700 transition-colors focus:outline-none focus:underline"
                aria-label={`${name} 상세 정보 보기`}
              >
                {name}
              </Link>
            </h3>

            {distanceText && (
              <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[15px] font-bold">
                {distanceText}
              </span>
            )}
          </div>

          {/* Address */}
          <p className="text-[17px] text-slate-700 line-clamp-1 mb-3">
            {address || "주소 정보 확인 필요"}
          </p>
        </div>

        {/* Badges and Attributes Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-200">
          {/* Holes Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 text-[16px] font-bold">
            <span className="text-sm">⛳</span>
            <span>{holesText}</span>
          </span>

          {/* Fee Summary Badge (Only displayed when verified) */}
          {feeText && (
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[16px] font-bold border ${
                isFree
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <span>{feeText}</span>
            </span>
          )}

          {/* Operator if available */}
          {facility.operatorName && (
            <span className="hidden sm:inline-block text-[15px] text-slate-600 ml-auto truncate max-w-[180px]">
              {facility.operatorName}
            </span>
          )}
        </div>

        {/* Action Row: Direct Booking Link or Phone / Detail Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <Link
            href={`/facility/${id}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-[16px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex-1 text-center"
            aria-label={`${name} 상세 보기`}
          >
            상세 정보 보기
          </Link>

          {reservationUrl ? (
            <a
              href={reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[16px] font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors flex-1 text-center shadow-sm"
              aria-label={`${name} 공식 예약 사이트 바로가기`}
            >
              <span>예약하기</span>
              <span className="text-sm">↗</span>
            </a>
          ) : phone ? (
            <a
              href={`tel:${phone.replace(/[^0-9]/g, "")}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[16px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex-1 text-center"
              aria-label={`${name} 전화 예약 문의`}
            >
              <span>전화 예약 문의</span>
              <span className="text-sm">📞</span>
            </a>
          ) : (
            <Link
              href={`/facility/${id}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[16px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex-1 text-center"
            >
              <span>현장 이용 안내</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeniorFacilityCard;
