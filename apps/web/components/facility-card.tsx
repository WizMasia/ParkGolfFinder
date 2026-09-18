import { FacilitySummary } from "@parkgolf/shared";
import Link from "next/link";

interface FacilityCardProps {
  facility: FacilitySummary;
}

/**
 * Display card for single facility in listing.
 * 시설 목록에서 보여줄 개별 파크골프 시설 정보 카드 컴포넌트입니다.
 */
export function FacilityCard({ facility }: FacilityCardProps) {
  const { id, name, address, operatorName, reservationSummary, homepageUrl, kakaoPlaceId, mapSearchQuery, distanceKm } = facility;

  return (
    <Link href={`/facilities/${id}`}>
      <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 hover:bg-slate-800/40 hover:border-emerald-500/30 transition-all duration-300 shadow-lg cursor-pointer flex flex-col justify-between h-48">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              {name}
            </h3>
            {distanceKm !== undefined && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                {distanceKm} km
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mb-1 line-clamp-1">{address}</p>
          <p className="text-xs text-slate-500">운영: {operatorName || "기타"}</p>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 mt-2">
          <div className="flex flex-col gap-0.5 max-w-[60%]">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">예약 방식</span>
            <span className="text-xs font-bold text-emerald-400 truncate">{reservationSummary || "정보 없음"}</span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {kakaoPlaceId ? (
              <a
                href={`https://map.kakao.com/link/map/${encodeURIComponent(name)},${kakaoPlaceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all font-medium"
              >
                지도
              </a>
            ) : mapSearchQuery ? (
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(mapSearchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all font-medium"
              >
                지도
              </a>
            ) : null}

            {homepageUrl ? (
              <a
                href={homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 text-xs rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all font-semibold"
              >
                홈페이지
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
