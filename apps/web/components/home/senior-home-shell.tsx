"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { FacilitySummary, FeeType } from "@parkgolf/shared";
import { ViewToggle, type ViewMode } from "./view-toggle";
import { SeniorFacilityCard } from "./facility-card";
import { RegionFilterTabs, type RegionGroupKey } from "./region-filter-tabs";
import { DistanceFilterBar, type DistancePreset } from "./distance-filter-bar";
import { FacilityMapView } from "../map/facility-map-view";
import type { MapFacility } from "../map/leaflet-map";
import { rankFacilities } from "../../lib/facility-search";
import { SEOUL_CITY_HALL } from "../../lib/seoul-fallback";

export interface SeniorHomeShellProps {
  initialFacilities: FacilitySummary[];
}

export function SeniorHomeShell({ initialFacilities }: SeniorHomeShellProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [facilities, setFacilities] = useState<FacilitySummary[]>(initialFacilities);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Search & Filter state (preserved across view mode toggles)
  const [query, setQuery] = useState("");
  const [regionGroup, setRegionGroup] = useState<RegionGroupKey>(null);
  const [distanceKm, setDistanceKm] = useState<DistancePreset>(null);
  const [feeFilter, setFeeFilter] = useState<FeeType | null>(null);
  const [concessionOn, setConcessionOn] = useState(false);

  // Geolocation state
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "denied" | "unsupported" | "idle">("idle");

  // Update facilities if initialFacilities change
  useEffect(() => {
    if (initialFacilities && initialFacilities.length > 0) {
      setFacilities(initialFacilities);
    }
  }, [initialFacilities]);

  // Compute filtered & ranked results
  const rankedFacilities = useMemo(() => {
    return rankFacilities({
      facilities,
      query,
      regionGroup,
      distanceKm,
      currentLocation,
      concessionOn,
      feeFilter,
    });
  }, [facilities, query, regionGroup, distanceKm, currentLocation, concessionOn, feeFilter]);

  // Selected facility preview for map mode
  const selectedFacility = useMemo(() => {
    if (!selectedFacilityId) return rankedFacilities[0] || null;
    return rankedFacilities.find((f) => f.id === selectedFacilityId) || rankedFacilities[0] || null;
  }, [selectedFacilityId, rankedFacilities]);

  // MapFacilities adapter
  const mapFacilities: MapFacility[] = useMemo(() => {
    return rankedFacilities.map((f) => ({
      id: f.id,
      name: f.name,
      lat: f.lat,
      lng: f.lng,
      holes: f.holes,
      feeSummary: f.feeSummary || f.baseFeeText,
      address: f.address,
      phone: f.phone,
      reservationUrl: f.reservationUrl,
    }));
  }, [rankedFacilities]);

  const isUsingCurrentLocation =
    currentLocation !== null &&
    (currentLocation.lat !== SEOUL_CITY_HALL.lat || currentLocation.lng !== SEOUL_CITY_HALL.lng);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 md:p-10">
      {/* Header */}
      <header className="mb-6 md:mb-8 text-center md:text-left">
        <div className="inline-block px-3 py-1 mb-3 text-sm font-bold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
          대한민국 공공 및 공인 파크골프장 안내
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
          파크골프<span className="text-teal-700">파인더</span>
        </h1>
        <p className="text-slate-700 text-[17px] max-w-xl">
          전국 실외 정규 파크골프장의 위치, 코스 규모(홀수), 이용 요금 및 예약 방법을 쉽게 찾아보세요.
        </p>
      </header>

      {/* Main View Toggle Switcher */}
      <div className="flex justify-center md:justify-start mb-6">
        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </div>

      {/* Search & Filter Bar */}
      <section className="mb-6 p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Row 1: Search Input + Fee Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-lg" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              placeholder="골프장 이름이나 지역 검색 (예: 잠실, 여의도, 송파)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-500 text-[17px] focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all min-h-[48px]"
              aria-label="골프장 이름이나 지역 검색"
            />
          </div>

          {/* Fee Filter Pills */}
          <div className="flex gap-2">
            {[
              { key: null, label: "전체 요금" },
              { key: "free", label: "무료만" },
            ].map((item) => (
              <button
                key={item.key ?? "all"}
                type="button"
                onClick={() => setFeeFilter(item.key as FeeType | null)}
                aria-pressed={feeFilter === item.key}
                className={`px-4 py-2.5 rounded-xl text-[17px] font-bold border transition-all cursor-pointer min-h-[48px] inline-flex items-center justify-center ${
                  feeFilter === item.key
                    ? "bg-[#0f766e] text-white border-[#0f766e] shadow-sm"
                    : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Region Tabs */}
        <div className="pt-3 border-t border-slate-200">
          <div className="mb-2 text-[15px] font-bold text-slate-700">
            지역 선택
          </div>
          <RegionFilterTabs
            selectedRegion={regionGroup}
            onSelectRegion={setRegionGroup}
          />
        </div>

        {/* Row 3: Distance Filter & GPS Control */}
        <div className="pt-3 border-t border-slate-200">
          <div className="mb-2 text-[15px] font-bold text-slate-700">
            거리 필터 (GPS 위치 기반)
          </div>
          <DistanceFilterBar
            distanceKm={distanceKm}
            onDistanceChange={setDistanceKm}
            currentLocation={currentLocation}
            onLocationChange={setCurrentLocation}
            locationStatus={locationStatus}
            onLocationStatusChange={setLocationStatus}
          />
        </div>
      </section>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-4 px-1">
        <p className="text-[17px] font-bold text-slate-900">
          검색 결과 <span className="text-teal-700 font-extrabold">{rankedFacilities.length}</span>곳
        </p>
        <span className="text-sm text-slate-600">
          {isUsingCurrentLocation ? "내 위치 기준 거리순" : "서울시청 기준 거리순"}
          {distanceKm ? ` (${distanceKm}km 이내)` : " (전체 거리)"}
        </span>
      </div>

      {/* Preserved View Containers: List and Map both stay mounted in DOM */}
      <div className={viewMode === "list" ? "block" : "hidden"}>
        <section aria-label="파크골프장 목록" className="space-y-4">
          {rankedFacilities.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {rankedFacilities.map((facility) => (
                <SeniorFacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center space-y-3">
              <div className="text-3xl">⛳</div>
              <h2 className="text-xl font-bold text-slate-900">해당 조건에 맞는 파크골프장이 없습니다.</h2>
              <p className="text-[16px] text-slate-600 max-w-sm mx-auto">
                검색어를 변경하거나 지역 및 거리 필터를 전체로 설정해 보세요.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className={viewMode === "map" ? "block" : "hidden"}>
        <section aria-label="파크골프장 지도" className="space-y-4">
          <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-md relative">
            <FacilityMapView
              facilities={mapFacilities}
              selectedFacilityId={selectedFacility?.id}
              onSelectFacility={(id) => setSelectedFacilityId(id)}
              className="w-full h-full"
            />
          </div>

          {/* Selected Facility Preview Card at Bottom of Map */}
          {selectedFacility && (
            <div className="mt-4">
              <div className="mb-2 text-[16px] font-bold text-teal-800 flex items-center gap-1.5">
                <span>📍</span>
                <span>선택된 파크골프장 미리보기</span>
              </div>
              <SeniorFacilityCard facility={selectedFacility} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default SeniorHomeShell;
