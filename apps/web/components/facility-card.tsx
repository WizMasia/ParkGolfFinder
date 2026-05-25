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
  const { id, name, address, operatorName, baseFeeText, distanceKm } = facility;

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
          <span className="text-xs font-medium text-slate-400">요금 / Fee</span>
          <span className="text-sm font-semibold text-emerald-400">{baseFeeText}</span>
        </div>
      </div>
    </Link>
  );
}
