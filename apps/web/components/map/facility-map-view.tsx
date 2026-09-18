"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { MapFacility, LeafletMapProps } from "./leaflet-map";
import { filterValidFacilities, SEOUL_CITY_HALL } from "./leaflet-map";

// Dynamic import with SSR disabled to prevent window/SSR errors
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span>지도를 불러오는 중입니다...</span>
    </div>
  ),
});

export interface FacilityMapViewProps extends LeafletMapProps {
  preferKakao?: boolean;
}

/**
 * Kakao Map sub-component used when an API key is provided and Kakao is preferred.
 */
function KakaoMapView({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  className,
  center,
  zoom,
  onFallback,
}: FacilityMapViewProps & { onFallback: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);

  useEffect(() => {
    try {
      const kakao = (window as any).kakao;
      if (!kakao || !kakao.maps || !containerRef.current) {
        onFallback();
        return;
      }

      const validFacilities = filterValidFacilities(facilities);
      const initialLat = center ? center[0] : (validFacilities[0]?.lat ?? SEOUL_CITY_HALL[0]);
      const initialLng = center ? center[1] : (validFacilities[0]?.lng ?? SEOUL_CITY_HALL[1]);

      const mapOptions = {
        center: new kakao.maps.LatLng(initialLat, initialLng),
        level: zoom ? Math.max(1, 14 - zoom) : 5,
      };

      const map = new kakao.maps.Map(containerRef.current, mapOptions);
      kakaoMapRef.current = map;

      const bounds = new kakao.maps.LatLngBounds();

      for (const facility of validFacilities) {
        const markerPosition = new kakao.maps.LatLng(facility.lat, facility.lng);
        bounds.extend(markerPosition);

        const marker = new kakao.maps.Marker({
          position: markerPosition,
          map,
          title: facility.name,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          onSelectFacility?.(facility.id);
        });
      }

      if (validFacilities.length > 1) {
        map.setBounds(bounds);
      }
    } catch (err) {
      console.warn("Kakao map initialization failed, falling back to Leaflet:", err);
      onFallback();
    }
  }, [facilities, center, zoom, onSelectFacility, onFallback]);

  return (
    <div
      ref={containerRef}
      className={"w-full h-full min-h-[300px] relative z-0 " + (className || "")}
      data-testid="kakao-map-container"
    />
  );
}

/**
 * FacilityMapView component
 * Defaults to zero-key Leaflet with OpenStreetMap tiles.
 * If NEXT_PUBLIC_KAKAO_MAP_API_KEY is provided and preferKakao is true, Kakao Map is attempted,
 * falling back to Leaflet on any error.
 */
export function FacilityMapView({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  className,
  center,
  zoom,
  preferKakao = false,
}: FacilityMapViewProps) {
  const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  const [kakaoError, setKakaoError] = useState(false);
  const [kakaoLoaded, setKakaoLoaded] = useState(false);

  // If no Kakao API key is set, or Kakao experienced an error, or Kakao is not preferred:
  // Default to zero-key Leaflet with OpenStreetMap.
  const shouldUseLeaflet = !kakaoApiKey || kakaoError || !preferKakao;

  useEffect(() => {
    if (!kakaoApiKey || !preferKakao) return;

    if ((window as any).kakao && (window as any).kakao.maps) {
      (window as any).kakao.maps.load(() => {
        setKakaoLoaded(true);
      });
      return;
    }

    const existingScript = document.getElementById("kakao-map-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        try {
          (window as any).kakao.maps.load(() => {
            setKakaoLoaded(true);
          });
        } catch {
          setKakaoError(true);
        }
      });
      existingScript.addEventListener("error", () => {
        setKakaoError(true);
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=" + kakaoApiKey + "&autoload=false";
    script.async = true;

    script.onload = () => {
      try {
        (window as any).kakao.maps.load(() => {
          setKakaoLoaded(true);
        });
      } catch {
        setKakaoError(true);
      }
    };

    script.onerror = () => {
      setKakaoError(true);
    };

    document.head.appendChild(script);
  }, [kakaoApiKey, preferKakao]);

  if (shouldUseLeaflet || !kakaoLoaded) {
    return (
      <LeafletMap
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={onSelectFacility}
        className={className}
        center={center}
        zoom={zoom}
      />
    );
  }

  return (
    <KakaoMapView
      facilities={facilities}
      selectedFacilityId={selectedFacilityId}
      onSelectFacility={onSelectFacility}
      className={className}
      center={center}
      zoom={zoom}
      onFallback={() => setKakaoError(true)}
    />
  );
}

export default FacilityMapView;

