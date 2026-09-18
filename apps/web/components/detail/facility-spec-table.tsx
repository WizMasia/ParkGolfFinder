import React from "react";

export interface FacilitySpecData {
  holes?: number | null;
  facilityType?: string | null;
  operatorName?: string | null;
  phone?: string | null;
  address?: string | null;
  ownership?: string | null;
  closedDaysText?: string | null;
}

export interface FacilitySpecTableProps {
  facility: FacilitySpecData;
}

/**
 * Formats hole count into clean Korean representation
 */
export function formatHolesText(holes?: number | null): string {
  if (holes && !isNaN(holes) && holes > 0) {
    return `${holes}홀 정규 코스`;
  }
  return "홀수 정보 확인 필요";
}

/**
 * Clean high-contrast table displaying course specifications, operator, and amenities.
 */
export function FacilitySpecTable({ facility }: FacilitySpecTableProps) {
  const isOutdoor = facility.facilityType !== "indoor";
  const facilityTypeLabel = isOutdoor ? "야외 천연/인조 잔디 코스" : "실내 코스";
  const operatorLabel = facility.operatorName || "지자체 체육회 및 관리부서";
  const ownershipLabel = facility.ownership === "private" ? "민간 운영" : "공공 체육시설";
  const closedDays = facility.closedDaysText || "매주 월요일 정기 휴장 (잔디 보호) 또는 기상 악화 시 휴장";

  return (
    <section
      aria-labelledby="spec-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 text-xl font-bold">
          ⛳
        </span>
        <div>
          <h2 id="spec-heading" className="text-xl md:text-2xl font-bold text-slate-900">
            코스 사양 및 시설 정보
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-0.5">
            코스 규모, 잔디 형태 및 운영처 정보를 확인하세요.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <caption className="sr-only">파크골프장 코스 규모 및 운영 세부 사양 표</caption>
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-sm md:text-base font-bold">
              <th scope="col" className="py-3.5 px-4 md:px-5 w-1/3">항목</th>
              <th scope="col" className="py-3.5 px-4 md:px-5 w-2/3">세부 사양</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-base md:text-[17px]">
            {/* 코스 규모 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                코스 규모
              </th>
              <td className="py-4 px-4 md:px-5 font-bold text-teal-800">
                {formatHolesText(facility.holes)}
              </td>
            </tr>

            {/* 구장 형태 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                구장 형태
              </th>
              <td className="py-4 px-4 md:px-5 text-slate-900">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                  {facilityTypeLabel} ({ownershipLabel})
                </span>
              </td>
            </tr>

            {/* 운영 주체 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                운영 주체
              </th>
              <td className="py-4 px-4 md:px-5 text-slate-900 font-medium">
                {operatorLabel}
              </td>
            </tr>

            {/* 문의 전화 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                문의 연락처
              </th>
              <td className="py-4 px-4 md:px-5">
                {facility.phone ? (
                  <a
                    href={`tel:${facility.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-900 underline underline-offset-4"
                    aria-label={`${facility.phone} 전화걸기`}
                  >
                    <span>📞 {facility.phone}</span>
                    <span className="text-xs font-normal text-slate-500">(터치 시 통화 연결)</span>
                  </a>
                ) : (
                  <span className="text-slate-500">등록된 전화번호가 없습니다.</span>
                )}
              </td>
            </tr>

            {/* 위치 주소 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                소재지 주소
              </th>
              <td className="py-4 px-4 md:px-5 text-slate-900">
                {facility.address || "주소 정보 확인 필요"}
              </td>
            </tr>

            {/* 정기 휴장 및 이용 시간 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <th scope="row" className="py-4 px-4 md:px-5 font-bold text-slate-800 bg-slate-50/40">
                정기 휴장 및 안내
              </th>
              <td className="py-4 px-4 md:px-5 text-slate-700 text-sm md:text-base leading-relaxed">
                {closedDays}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
