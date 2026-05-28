"use client";

interface FacilityMapProps {
  lat: number;
  lng: number;
  name: string;
  kakaoPlaceId?: string | null;
  mapSearchQuery?: string | null;
}

export default function FacilityMap({ lat, lng, name, kakaoPlaceId, mapSearchQuery }: FacilityMapProps) {
  const staticMapUrl = `https://t1.daumcdn.net/mapjsapi/staticimages/DYNAMIC_MAP/apis/local/staticmap.png?mx=${lng}&my=${lat}&w=800&h=300&level=3&marker=default`;

  const targetMapUrl = kakaoPlaceId
    ? `https://map.kakao.com/link/map/${encodeURIComponent(name)},${kakaoPlaceId}`
    : mapSearchQuery
    ? `https://map.kakao.com/link/search/${encodeURIComponent(mapSearchQuery)}`
    : `https://map.kakao.com/link/search/${encodeURIComponent(name)}`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-1.5 shadow-lg overflow-hidden group">
      <a href={targetMapUrl} target="_blank" rel="noopener noreferrer" className="block relative cursor-pointer overflow-hidden rounded-xl">
        <img
          src={staticMapUrl}
          alt={name}
          className="w-full h-72 object-cover group-hover:scale-[1.02] transition-all duration-500 rounded-xl"
        />
        <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
          <div className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 text-white border border-slate-700/60 shadow-lg group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-white transition-all transform group-hover:scale-105 duration-300">
            카카오맵에서 크게 보기 및 길찾기 ↗
          </div>
        </div>
      </a>
    </div>
  );
}
