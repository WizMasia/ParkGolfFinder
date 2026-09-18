"use client";

import React, { useState } from "react";
import { SEOUL_CITY_HALL } from "../../lib/seoul-fallback";

export type DistancePreset = 5 | 10 | 20 | null;

export interface DistanceFilterBarProps {
  distanceKm: DistancePreset;
  onDistanceChange: (distance: DistancePreset) => void;
  currentLocation: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number } | null) => void;
  locationStatus: "loading" | "success" | "denied" | "unsupported" | "idle";
  onLocationStatusChange?: (status: "loading" | "success" | "denied" | "unsupported" | "idle") => void;
  className?: string;
}

export const DISTANCE_PRESETS: { value: DistancePreset; label: string }[] = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: null, label: "전체" },
];

/**
 * DistanceFilterBar component.
 * Features:
 * - Large GPS trigger button "내 위치 주변 (10km)"
 * - Presets: 5km, 10km, 20km, 전체 (null)
 * - Graceful fallback to Seoul City Hall coordinates if location is denied or unsupported
 * - Clear, high-contrast, touch-friendly UI (min-h >= 48px, text >= 17px)
 */
export function DistanceFilterBar({
  distanceKm,
  onDistanceChange,
  currentLocation,
  onLocationChange,
  locationStatus,
  onLocationStatusChange,
  className = "",
}: DistanceFilterBarProps) {
  const [notification, setNotification] = useState<string | null>(null);

  const handleRequestLocation = () => {
    // Also switch distance to 10km when clicking "내 위치 주변 (10km)"
    onDistanceChange(10);

    if (typeof window === "undefined" || !navigator.geolocation) {
      onLocationChange({ lat: SEOUL_CITY_HALL.lat, lng: SEOUL_CITY_HALL.lng });
      if (onLocationStatusChange) onLocationStatusChange("unsupported");
      setNotification("기기에서 위치 서비스를 지원하지 않아 서울시청 기준으로 검색합니다.");
      return;
    }

    if (onLocationStatusChange) onLocationStatusChange("loading");
    setNotification(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        if (onLocationStatusChange) onLocationStatusChange("success");
        setNotification("현재 위치를 확인했습니다. (반경 10km 설정)");
      },
      (error) => {
        console.warn("Geolocation request failed, falling back to Seoul City Hall:", error);
        onLocationChange({
          lat: SEOUL_CITY_HALL.lat,
          lng: SEOUL_CITY_HALL.lng,
        });
        if (onLocationStatusChange) onLocationStatusChange("denied");
        setNotification("위치 권한을 확인할 수 없어 서울시청 기준으로 거리를 안내합니다.");
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const isGpsActive =
    currentLocation !== null &&
    (currentLocation.lat !== SEOUL_CITY_HALL.lat || currentLocation.lng !== SEOUL_CITY_HALL.lng);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Large GPS Button */}
        <button
          type="button"
          onClick={handleRequestLocation}
          className={`px-4 py-2.5 rounded-xl text-[17px] font-bold min-h-[48px] transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm ${
            isGpsActive
              ? "bg-[#0f766e] text-white border border-[#0f766e]"
              : "bg-teal-50 text-teal-900 border border-teal-300 hover:bg-teal-100"
          }`}
          aria-label="내 위치 주변 10km로 검색"
        >
          <span aria-hidden="true" className="text-xl">📍</span>
          <span>내 위치 주변 (10km)</span>
        </button>

        {/* Distance Presets */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="거리 필터">
          <span className="text-[16px] font-bold text-slate-700 mx-1 hidden sm:inline">
            거리:
          </span>
          {DISTANCE_PRESETS.map((preset) => {
            const isActive = distanceKm === preset.value;
            return (
              <button
                key={preset.value ?? "all"}
                type="button"
                onClick={() => onDistanceChange(preset.value)}
                aria-pressed={isActive}
                className={`px-3.5 py-2.5 rounded-xl text-[17px] font-bold min-h-[48px] min-w-[56px] transition-all cursor-pointer inline-flex items-center justify-center ${
                  isActive
                    ? "bg-[#0f766e] text-white border border-[#0f766e] shadow-sm"
                    : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Friendly Notification Banner */}
      {notification && (
        <div
          role="status"
          className="mt-1 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[15px] font-medium flex items-center justify-between"
        >
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 text-amber-700 hover:text-amber-900 font-bold text-sm px-1.5 py-0.5"
            aria-label="알림 닫기"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}

export default DistanceFilterBar;

