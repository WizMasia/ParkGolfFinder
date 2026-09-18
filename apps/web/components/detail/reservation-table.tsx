import React from "react";

export interface ReservationMethodItem {
  id: string;
  methodType: string;
  methodText: string;
  priority: number;
  ruleText?: string | null;
  url?: string | null;
  notes?: string | null;
}

export interface ReservationTableProps {
  summary?: string | null;
  methods?: ReservationMethodItem[] | null;
}

/**
 * Translates reservation method type to clear Korean label
 */
export function formatMethodType(type: string): string {
  switch (type) {
    case "phone":
      return "전화 예약";
    case "internet_first_come":
      return "인터넷 선착순";
    case "internet_lottery":
      return "인터넷 추첨제";
    case "visit":
      return "현장 방문 접수";
    case "none":
      return "예약 불필요 / 현장 이용";
    default:
      return "기타 안내";
  }
}

/**
 * Reservation information table designed for high contrast and senior legibility.
 * Information-first layout without requiring external redirects.
 */
export function ReservationTable({ summary, methods }: ReservationTableProps) {
  const hasMethods = methods && methods.length > 0;

  return (
    <section
      aria-labelledby="reservation-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 text-xl font-bold">
          📅
        </span>
        <div>
          <h2 id="reservation-heading" className="text-xl md:text-2xl font-bold text-slate-900">
            예약 및 이용 안내
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-0.5">
            예약 일정 및 접수 방법을 확인하세요.
          </p>
        </div>
      </div>

      {summary && (
        <div className="mb-6 rounded-xl bg-teal-50/70 border border-teal-200/60 p-4">
          <span className="block text-xs font-bold text-teal-800 mb-1">
            요약 안내
          </span>
          <p className="text-base md:text-lg font-semibold text-teal-950 leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {hasMethods ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <caption className="sr-only">예약 방법 및 세부 규칙 안내 표</caption>
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-sm md:text-base font-bold">
                <th scope="col" className="py-3.5 px-4 md:px-5 w-1/4">예약 방식</th>
                <th scope="col" className="py-3.5 px-4 md:px-5 w-2/5">접수 및 신청 내용</th>
                <th scope="col" className="py-3.5 px-4 md:px-5">유의사항 및 규칙</th>
              </tr>
           </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 text-[17px]">
              {methods!.map((method, idx) => (
                <tr key={method.id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 md:px-5 align-top font-semibold text-teal-800">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-teal-600" />
                      <span>{formatMethodType(method.methodType)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-5 align-top">
                    <p className="font-medium text-slate-900 leading-snug">
                      {method.methodText || "세부 내용 확인 필요"}
                    </p>
                   {method.notes && (
                      <p className="text-[17px] text-slate-600 mt-1 leading-relaxed">
                        {method.notes}
                      </p>
                   )}
                 </td>
                  <td className="py-4 px-4 md:px-5 align-top text-slate-700 text-[17px] leading-relaxed">
                    {method.ruleText ? (
                      <span>{method.ruleText}</span>
                    ) : (
                      <span className="text-slate-400">현장 운영 규정에 따름</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-600 text-base md:text-lg">
          등록된 세부 예약 규칙이 없습니다. 전화 문의 또는 현장 방문을 권장합니다.
        </div>
      )}
    </section>
  );
}
