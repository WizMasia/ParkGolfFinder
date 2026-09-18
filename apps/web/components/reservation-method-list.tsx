interface ReservationMethodData {
  id: string;
  methodType: string;
  methodText: string;
  priority: number;
  ruleText?: string | null;
  url?: string | null;
  notes?: string | null;
}

interface ReservationMethodListProps {
  methods: ReservationMethodData[];
}

/**
 * Display reservation methods chips and details list.
 * 예약 방식 목록 및 상세 안내 리스트를 렌더링하는 컴포넌트입니다.
 */
export function ReservationMethodList({ methods }: ReservationMethodListProps) {
  if (!methods || methods.length === 0) {
    return (
      <div className="text-slate-500 italic text-sm">
        예약 정보 확인 필요 / Reservation Check Required
      </div>
    );
  }

  // Helper to map type to Korean tag string
  // methodType을 한글 태그 명칭으로 변환합니다.
  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case "phone":
        return "전화 예약 / Phone";
      case "internet_first_come":
        return "인터넷 선착순 / Online (FCFS)";
      case "internet_lottery":
        return "인터넷 추첨 / Online (Lottery)";
      case "visit":
        return "방문 예약 / Walk-in";
      case "none":
        return "예약 불가 / Unavailable";
      default:
        return "기타 / Other";
    }
  };

  return (
    <div className="space-y-4">
      {/* Active chips */}
      {/* 배지 목록 */}
      <div className="flex flex-wrap gap-2">
        {methods.map((method) => (
          <span
            key={method.id}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              method.methodType === "none"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {getMethodTypeLabel(method.methodType)}
          </span>
        ))}
      </div>

      {/* Detail description list */}
      {/* 세부 안내 리스트 */}
      <div className="space-y-3 mt-4">
        {methods.map((method) => (
          <div key={method.id} className="rounded-xl bg-slate-800/30 border border-slate-800 p-4">
            <h4 className="text-sm font-bold text-white mb-2">{method.methodText}</h4>
            {method.ruleText && (
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                규정: {method.ruleText}
              </p>
            )}
            {method.notes && (
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                참고: {method.notes}
              </p>
            )}
            {method.url && (
              <a
                href={method.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-400 hover:underline block"
              >
                예약 링크 바로가기 / Go to Booking Link →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
