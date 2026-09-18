import React from "react";

export interface PricingData {
  feeType?: string | null;
  baseFeeText?: string | null;
  concessionFeeText?: string | null;
}

export interface PricingTableProps {
  pricing?: PricingData | null;
}

/**
 * Formats fee type label into senior-friendly Korean text
 */
export function formatFeeType(feeType?: string | null): string {
  switch (feeType) {
    case "free":
      return "무료 이용";
    case "paid":
      return "유료 이용";
    case "partial":
      return "일부 유료 / 조건부 무료";
    case "inquiry":
      return "전화 문의 요망";
    default:
      return "확인 필요";
  }
}

/**
 * High-contrast senior-readable pricing and concession fee table.
 * Prominently highlights Senior (만 65세 이상) concession benefits.
 */
export function PricingTable({ pricing }: PricingTableProps) {
  const feeType = pricing?.feeType || "paid";
  const isFree = feeType === "free";
  const baseFeeText = pricing?.baseFeeText || (isFree ? "무료 이용 가능" : "현장 확인 필요");
  const concessionFeeText = pricing?.concessionFeeText;

  return (
    <section
      aria-labelledby="pricing-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 text-xl font-bold">
          🏷️
        </span>
        <div>
          <h2 id="pricing-heading" className="text-xl md:text-2xl font-bold text-slate-900">
            이용 요금 및 감면 혜택
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-0.5">
            기본 요금 및 어르신(만 65세 이상) 감면 혜택을 확인하세요.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <caption className="sr-only">이용 요금 및 경로우대 감면 안내 표</caption>
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-sm md:text-base font-bold">
              <th scope="col" className="py-3.5 px-4 md:px-5 w-1/3">항목</th>
              <th scope="col" className="py-3.5 px-4 md:px-5 w-2/3">요금 및 감면 내용</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-base md:text-[17px]">
            {/* 요금 구분 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                요금 구분
              </th>
              <td className="py-4 px-4 md:px-5">
                <span
                  className={
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-bold " +
                    (isFree
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-teal-50 text-teal-800 border border-teal-200")
                  }
                >
                  {formatFeeType(feeType)}
                </span>
              </td>
            </tr>

            {/* 기본 이용료 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                기본 이용 요금
              </th>
              <td className="py-4 px-4 md:px-5 font-semibold text-slate-900">
                {baseFeeText}
              </td>
            </tr>

            {/* 경로우대 혜택 (만 65세 이상) */}
            <tr className="hover:bg-teal-50/30 transition-colors bg-teal-50/20">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-teal-900 bg-teal-100/40">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎖️</span>
                  <span>경로우대 (만 65세 이상)</span>
                </div>
              </th>
              <td className="py-4 px-4 md:px-5">
                {concessionFeeText ? (
                  <div className="font-bold text-teal-900 leading-snug">
                    {concessionFeeText}
                  </div>
                ) : isFree ? (
                  <div className="text-slate-700">
                    기본 무료 시설로 모든 연령 무료 이용 가능합니다.
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-sm md:text-base">
                    별도 명시된 경로우대 기준이 없습니다. 현장 매표소 또는 조례 감면 규정을 확인하세요.
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs md:text-sm text-slate-600 leading-relaxed">
        💡 <strong>안내:</strong> 관내 주민 우대 및 국가유공자·장애인 감면 혜택 적용 여부는 신분증 및 증빙 서류 지참 후 현장에서 적용됩니다.
      </div>
    </section>
  );
}
