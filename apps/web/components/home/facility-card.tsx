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
 * Formats fee summary into clean Korean text
 */
export function formatFeeSummary(facility: { baseFeeText?: string; feeSummary?: string | null }): string {
  if (facility.feeSummary && facility.feeSummary.trim().length > 0) {
    return facility.feeSummary.trim();
  }
  if (facility.baseFeeText && facility.baseFeeText.trim().length > 0) {
    const text = facility.baseFeeText.trim();
    if (text === "무료") return "무료";
    if (text.includes("정보 없음") || text.includes("No Info")) {
      return "정보 확인 필요";
    }
    return text;
  }
  return "정보 확인 필요";
}

/**
 * Senior-Friendly Facility Card Component
 * Displays facility name (bold 20px), distance badge, holes count, fee summary, and address.
 * Generates clean link to /facility/[id] with large touch target.
 */
export function SeniorFacilityCard({ facility, className = "" }: FacilityCardProps) {
  const { id, name, address, holes, distanceKm } = facility;
  const holesText = formatHolesSummary(holes);
  const feeText = formatFeeSummary(facility);
  const isFree = feeText === "무료";
  const distanceText = distanceKm !== undefined && !isNaN(distanceKm) ? `${distanceKm.toFixed(1)} km` : null;

  return (
    <Link
      href={`/facility/${id}`}
      className={`group block rounded-2xl border border-slate-200 bg-white p-5 md:p-6 transition-all duration-200 hover:border-teal-700/60 hover:shadow-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-700 ${className}`}
      aria-label={`${name} 상세 정보 보기`}
    >
      <div className="flex flex-col justify-between gap-4 h-full min-h-[140px]">
        <div>
          {/* Header Row: Name & Distance Badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[20px] md:text-[22px] font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
              {name}
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

          {/* Fee Summary Badge */}
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[16px] font-bold border ${
              isFree
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span>{feeText}</span>
          </span>

          {/* Operator if available */}
          {facility.operatorName && (
            <span className="hidden sm:inline-block text-[15px] text-slate-600 ml-auto truncate max-w-[180px]">
              {facility.operatorName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default SeniorFacilityCard;
