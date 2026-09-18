"use client";

import { useEffect, useState } from "react";

interface FacilityMapProps {
  lat: number;
  lng: number;
  name: string;
  kakaoPlaceId?: string | null;
  mapSearchQuery?: string | null;
}

export default function FacilityMap({ lat, lng, name, kakaoPlaceId, mapSearchQuery }: FacilityMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      setHasApiKey(false);
      return;
    }

    const existingScript = document.getElementById("kakao-map-sdk");
    if (existingScript) {
      // @ts-ignore
      if (window.kakao && window.kakao.maps) {
        setMapLoaded(true);
      } else {
        existingScript.addEventListener("load", () => {
          // @ts-ignore
          window.kakao.maps.load(() => {
            setMapLoaded(true);
          });
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      window.kakao.maps.load(() => {
        setMapLoaded(true);
      });
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;

    const container = document.getElementById("map-container");
    if (!container) return;

    // @ts-ignore
    const maps = window.kakao.maps;
    const options = {
      center: new maps.LatLng(lat, lng),
      level: 3,
      marker: {
        position: new maps.LatLng(lat, lng),
        text: name
      }
    };

    new maps.StaticMap(container, options);
  }, [mapLoaded, lat, lng, name]);

  const targetMapUrl = kakaoPlaceId
    ? `https://map.kakao.com/link/map/${kakaoPlaceId}`
    : `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;

  if (!hasApiKey) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center shadow-lg">
        <p className="text-slate-400 text-sm mb-2">지도를 로드할 수 없습니다 (API 키 미설정)</p>
        <p className="text-slate-500 text-xs">위도: {lat} / 경도: {lng}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-1.5 shadow-lg overflow-hidden">
        <div
          id="map-container"
          className="w-full h-72 rounded-xl bg-slate-900/80 flex items-center justify-center text-xs text-slate-500"
        >
          {!mapLoaded && "지도를 로드하는 중입니다..."}
        </div>
      </div>

      <div className="flex justify-end">
        <a
          href={targetMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900/40 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-400 transition-all shadow-md"
        >
          카카오맵 크게 보기 및 길찾기 ↗
        </a>
      </div>
    </div>
  );
}
