"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { FacilitySummary, FeeType } from "@parkgolf/shared";
import { ViewToggle, type ViewMode } from "../components/home/view-toggle";
import { SeniorFacilityCard } from "../components/home/facility-card";
import { FacilityMapView } from "../components/map/facility-map-view";
import type { MapFacility } from "../components/map/leaflet-map";
import { rankFacilities } from "../lib/facility-search";
import { MOCK_FACILITIES } from "../lib/mock-data";

/**
 * Parses holes count from string (e.g. "18홀", "36홀", "규모: 18홀") or number
 */
function extractHolesCount(textOrNum: any): number | null {
  if (typeof textOrNum === "number" && !isNaN(textOrNum)) return textOrNum;
  if (!textOrNum) return null;
  const str = String(textOrNum).trim();
  const match = str.match(/(\d+)\s*홀/);
  if (match) return parseInt(match[1], 10);
  const num = parseInt(str, 10);
  return !isNaN(num) ? num : null;
}

/**
 * Normalizes raw/mock facility into FacilitySummary with holes and feeSummary
 */
function normalizeFacilitySummary(f: any): FacilitySummary {
  const reservationUrl = f.reservation?.methods?.find((m: any) => m.url)?.url;
  const bestUrl =
    reservationUrl ||
    f.sourceUrl ||
    (f.kakaoPlaceId ? `https://place.map.kakao.com/${f.kakaoPlaceId}` : null);

  // Extract holes from reservation summary or direct holes property
  const extractedHoles =
    f.holes !== undefined && f.holes !== null
      ? f.holes
      : extractHolesCount(f.reservation?.summary) ||
        extractHolesCount(f.rawText) ||
        extractHolesCount(f.name);

  return {
    id: f.id,
    name: f.name,
    address: f.address,
    province: f.province || null,
    district: f.district || null,
    regionKey: f.regionKey || "capital",
    facilityType: (f.facilityType as any) || "outdoor",
    status: (f.status as any) || "active",
    ownership: (f.ownership as any) || "public",
    operatorName: f.operatorName || null,
    phone: f.phone || null,
    lat: f.lat,
    lng: f.lng,
    holes: extractedHoles,
    feeSummary: f.pricing?.baseFeeText || f.feeSummary || "무료",
    baseFeeText: f.pricing?.baseFeeText || f.baseFeeText || "무료",
    concessionFeeText: f.pricing?.concessionFeeText || f.concessionFeeText || null,
    kakaoPlaceId: f.kakaoPlaceId || null,
    naverPlaceId: f.naverPlaceId || null,
    mapSearchQuery: f.mapSearchQuery || null,
    reservationSummary: f.reservation?.summary || f.reservationSummary || "예약 정보 확인 필요",
    homepageUrl: bestUrl || null,
  };
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Search & Filter state (preserved across view mode toggles)
  const [query, setQuery] = useState("");
  const [regionGroup, setRegionGroup] = useState<
    "capital" | "gangwon" | "chungcheong" | "honam" | "yeongnam" | "jeju" | null
  >(null);
  const [distanceKm, setDistanceKm] = useState<number>(50);
  const [feeFilter, setFeeFilter] = useState<FeeType | null>(null);
  const [concessionOn, setConcessionOn] = useState(false);

  // Geolocation state
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "denied" | "unsupported">("loading");

  // Load initial facilities from mock / api
  useEffect(() => {
    // Map mock facilities by default
    const normalized = (MOCK_FACILITIES as any[]).map(normalizeFacilitySummary);
    setFacilities(normalized);
  }, []);

  // Geolocation lookup
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("success");
      },
      (error) => {
        console.warn("Geolocation denied or failed:", error);
        setLocationStatus("denied");
      }
    );
  }, []);

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
    }));
  }, [rankedFacilities]);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 md:p-10">
      {/* Header */}
      <header className="mb-6 md:mb-8 text-center md:text-left">
        <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
          대한민국 공공 및 공인 파크골프장 안내
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          파크골프<span className="text-teal-400">파인더</span>
        </h1>
        <p className="text-slate-300 text-[17px] max-w-xl">
          전국 실외 정규 파크골프장의 위치, 코스 규모(홀수), 이용 요금 및 예약 방법을 쉽게 찾아보세요.
        </p>
      </header>

      {/* Main View Toggle Switcher */}
      <div className="flex justify-center md:justify-start mb-6">
        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </div>

      {/* Search & Filter Bar */}
      <section className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-lg" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              placeholder="골프장 이름이나 지역 검색 (예: 잠실, 여의도, 송파)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-400 text-[17px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all min-h-[48px]"
              aria-label="골프장 이름이나 지역 검색"
            />
          </div>

          {/* Fee Filter Pills */}
          <div className="flex gap-2">
            {[
              { key: null, label: "전체" },
              { key: "free", label: "무료만" },
            ].map((item) => (
              <button
                key={item.key ?? "all"}
                type="button"
                onClick={() => setFeeFilter(item.key as FeeType | null)}
                className={`px-4 py-2.5 rounded-xl text-[16px] font-bold border transition-all cursor-pointer min-h-[48px] ${
                  feeFilter === item.key
                    ? "bg-teal-500 text-white border-teal-500 shadow-md"
                    : "bg-slate-950/60 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-slate-800">
          {[
            { key: null, label: "전체 지역" },
            { key: "capital", label: "수도권" },
            { key: "gangwon", label: "강원" },
            { key: "chungcheong", label: "충청" },
            { key: "honam", label: "호남" },
            { key: "yeongnam", label: "영남" },
            { key: "jeju", label: "제주" },
          ].map((tab) => (
            <button
              key={tab.key ?? "all"}
              type="button"
              onClick={() => setRegionGroup(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-[15px] font-bold transition-all cursor-pointer min-h-[40px] ${
                regionGroup === tab.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-950/40 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <p className="text-[17px] font-bold text-slate-200">
          검색 결과 <span className="text-teal-400 font-extrabold">{rankedFacilities.length}</span>곳
        </p>
        <span className="text-sm text-slate-400">
          {currentLocation ? "내 위치 기준 거리순" : "서울시청 기준 거리순"}
        </span>
      </div>

      {/* Conditional View: List vs Map */}
      {viewMode === "list" ? (
        <section aria-label="파크골프장 목록" className="space-y-4">
          {rankedFacilities.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {rankedFacilities.map((facility) => (
                <SeniorFacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 py-16 text-center space-y-3">
              <div className="text-3xl">⛳</div>
              <h2 className="text-xl font-bold text-white">해당 조건에 맞는 파크골프장이 없습니다.</h2>
              <p className="text-[16px] text-slate-400 max-w-sm mx-auto">
                검색어를 변경하거나 지역 필터를 전체로 설정해 보세요.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section aria-label="파크골프장 지도" className="space-y-4">
          <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-700 shadow-xl relative">
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
              <div className="mb-2 text-sm font-bold text-teal-400 flex items-center gap-1.5">
                <span>📍</span>
                <span>선택된 파크골프장 미리보기</span>
              </div>
              <SeniorFacilityCard facility={selectedFacility} />
            </div>
          )}
        </section>
      )}
    </main>
  );
}
