"use client";

import { useEffect, useState } from "react";

interface FacilityMapProps {
  lat: number;
  lng: number;
  name: string;
}

/**
 * Display map utilizing Kakao Map SDK or displays Fallback details.
 * 카카오맵 SDK를 이용해 지도를 표시하거나, 키가 없는 경우 대체(Fallback) 안내를 노출하는 클라이언트 컴포넌트입니다.
 */
export default function FacilityMap({ lat, lng, name }: FacilityMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      setHasApiKey(false);
      return;
    }

    // Check if script is already injected
    // 스크립트가 이미 삽입되었는지 체크합니다.
    const existingScript = document.getElementById("kakao-map-sdk");
    if (existingScript) {
      setMapLoaded(true);
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
      level: 4,
    };

    const map = new maps.Map(container, options);

    const markerPosition = new maps.LatLng(lat, lng);
    const marker = new maps.Marker({
      position: markerPosition,
    });

    marker.setMap(map);

    const infowindow = new maps.InfoWindow({
      content: `<div style="padding:5px; color:#121824; font-size:12px; font-weight:bold;">${name}</div>`,
    });
    infowindow.open(map, marker);
  }, [mapLoaded, lat, lng, name]);

  if (!hasApiKey) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center shadow-lg">
        <p className="text-slate-400 text-sm mb-2">
          지도를 로드할 수 없습니다 (Kakao Map API 키 미설정)
        </p>
        <p className="text-slate-500 text-xs">
          위도: {lat} / 경도: {lng}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-1.5 shadow-lg overflow-hidden">
      <div
        id="map-container"
        className="w-full h-72 rounded-xl bg-slate-900/80 flex items-center justify-center text-xs text-slate-500"
      >
        {!mapLoaded && "지도를 로드하는 중입니다... / Loading Map..."}
      </div>
    </div>
  );
}
