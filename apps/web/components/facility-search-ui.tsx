"use client";

import { useState, useEffect } from "react";
import { FacilitySummary, FeeType, REGION_GROUPS } from "@parkgolf/shared";
import { rankFacilities } from "../lib/facility-search";
import { SEOUL_CITY_HALL } from "../lib/seoul-fallback";
import { FacilityCard } from "./facility-card";

interface FacilitySearchUiProps {
  initialFacilities: FacilitySummary[];
}

/**
 * Client-side interactive search, filtering, and sorting UI.
 * 클라이언트 사이드 대화형 검색, 필터링 및 거리순 정렬 UI 컴포넌트입니다.
 */
export function FacilitySearchUi({ initialFacilities }: FacilitySearchUiProps) {
  // 1. Search filter states
  // 1. 검색 필터 상태 변수들
  const [query, setQuery] = useState("");
  const [regionGroup, setRegionGroup] = useState<
    "capital" | "gangwon" | "chungcheong" | "honam" | "yeongnam" | "jeju" | null
  >(null);
  const [distanceKm, setDistanceKm] = useState<number>(50); // Default to 50km / 기본 50km
  const [feeFilter, setFeeFilter] = useState<FeeType | null>(null);
  const [concessionOn, setConcessionOn] = useState(false);

  // 2. Geolocation states
  // 2. 사용자 위치 상태 변수들
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "denied" | "unsupported">("loading");

  // Fetch geolocation on client mount
  // 클라이언트 마운트 시 브라우저 Geolocation API 호출
  useEffect(() => {
    if (!navigator.geolocation) {
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
        console.warn("Geolocation permission denied or failed / 위치 정보 취득 실패:", error);
        setLocationStatus("denied");
      }
    );
  }, []);

  // 3. Compute ranked results
  // 3. 필터링 및 랭킹 정렬 계산
  const searchInput = {
    facilities: initialFacilities,
    query,
    regionGroup,
    distanceKm,
    currentLocation,
    concessionOn,
    feeFilter,
  };

  const results = rankFacilities(searchInput);

  // Helper for region Korean label
  // 권역 한글명 헬퍼
  const getRegionLabel = (key: string | null) => {
    switch (key) {
      case "capital":
        return "수도권 / Capital";
      case "gangwon":
        return "강원권 / Gangwon";
      case "chungcheong":
        return "충청권 / Chungcheong";
      case "honam":
        return "호남권 / Honam";
      case "yeongnam":
        return "영남권 / Yeongnam";
      case "jeju":
        return "제주권 / Jeju";
      default:
        return "전체 지역 / All Regions";
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] items-start">
      {/* 4. Filter Controls Sidebar */}
      {/* 4. 필터 컨트롤 사이드바 */}
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            검색 및 필터 / Search & Filter
          </h2>
          
          {/* Location status badge */}
          {/* 위치 권한 및 탐색 상태 표시 배지 */}
          <div className="mb-4 text-xs p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1">
            <span className="font-semibold text-slate-300">위치 기준점 / Location Basis:</span>
            {locationStatus === "loading" && (
              <span className="text-amber-400">⏳ 위치 정보 불러오는 중... (서울시청 기준 설정) / Loading...</span>
            )}
            {locationStatus === "success" && (
              <span className="text-emerald-400">🟢 사용자 현재 위치 활성화 / User Current Location</span>
            )}
            {locationStatus === "denied" && (
              <span className="text-slate-400">⚪ 위치 권한 비활성화 (서울시청 기준 Fallback) / Denied (Seoul City Hall)</span>
            )}
            {locationStatus === "unsupported" && (
              <span className="text-slate-400">⚪ 브라우저 지원 불가 (서울시청 기준) / Unsupported</span>
            )}
          </div>
        </div>

        {/* Search Query Input */}
        {/* 키워드 검색 입력창 */}
        <div className="space-y-2">
          <label htmlFor="search-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            키워드 검색 / Search Keyword
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="시설명, 주소, 운영주체 등..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Distance Range Slider */}
        {/* 거리 반경 선택 슬라이더 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>최대 거리 반경 / Distance Radius</span>
            <span className="text-emerald-400 font-bold">{distanceKm} km</span>
          </div>
          <input
            id="distance-slider"
            type="range"
            min="5"
            max="300"
            step="5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>5 km</span>
            <span>150 km</span>
            <span>300 km</span>
          </div>
        </div>

        {/* Fee Type Selectors */}
        {/* 요금 조건 유형 필터 필 */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            요금 조건 / Pricing Type
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: null, label: "전체 / All" },
              { key: "free", label: "무료 / Free" },
              { key: "paid", label: "유료 / Paid" },
              { key: "partial", label: "일부 유료 / Partial" },
            ].map((item) => (
              <button
                key={item.key ?? "all"}
                onClick={() => setFeeFilter(item.key as FeeType | null)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  feeFilter === item.key
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Concession Toggle */}
        {/* 우대 정보 노출 여부 토글 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300">경로우대 요금 강조</span>
            <span className="text-[10px] text-slate-500">Concession Rate Focus</span>
          </div>
          <button
            onClick={() => setConcessionOn(!concessionOn)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              concessionOn ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                concessionOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </aside>

      {/* 5. Main Results Area */}
      {/* 5. 메인 결과 리스트 영역 */}
      <section className="space-y-6">
        {/* Region Tabs Navigation */}
        {/* 권역 탭 네비게이션 */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { key: null, label: "전체 / All" },
            { key: "capital", label: "수도권" },
            { key: "gangwon", label: "강원" },
            { key: "chungcheong", label: "충청" },
            { key: "honam", label: "호남" },
            { key: "yeongnam", label: "영남" },
            { key: "jeju", label: "제주" },
          ].map((tab) => (
            <button
              key={tab.key ?? "all"}
              onClick={() => setRegionGroup(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                regionGroup === tab.key
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Info Summary */}
        {/* 조회 결과 수량 및 기준 요약 */}
        <div className="flex justify-between items-center text-xs text-slate-400">
          <p>
            현재 조건 조회 결과: <span className="text-emerald-400 font-bold">{results.length}</span>개 시설
          </p>
          <p className="text-[10px]">
            정렬 기준: {currentLocation ? "내 위치 기준 가까운 순 / Nearest first" : "서울시청 기준 가까운 순 / Nearest to City Hall"}
          </p>
        </div>

        {/* Results grid */}
        {/* 결과 카드 그리드 */}
        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((facility) => {
              // Optionally customize the display if concessionOn is active
              // 만약 concessionOn 활성화 시 요금 정보를 경로우대로 조작하여 UI 전달
              const displayFacility = { ...facility };
              if (concessionOn && facility.concessionFeeText) {
                displayFacility.baseFeeText = `[우대] ${facility.concessionFeeText.split("/")[0].trim()}`;
              }
              return <FacilityCard key={facility.id} facility={displayFacility} />;
            })}
          </div>
        ) : (
          /* Empty State Fallback */
          /* 결과가 없을 때의 Fallback */
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-500 text-xl font-bold">
              ?
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-lg">조건에 맞는 파크골프장이 없습니다.</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">
                검색 키워드를 지우거나, 거리 반경 한도를 더 늘려서 조회해 보세요.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
