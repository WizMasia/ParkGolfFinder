"use client";

import React from "react";

export type RegionGroupKey =
  | "capital"
  | "gangwon"
  | "chungcheong"
  | "honam"
  | "yeongnam"
  | "jeju"
  | null;

export interface RegionTabItem {
  key: RegionGroupKey;
  label: string;
}

export const REGION_TABS: RegionTabItem[] = [
  { key: null, label: "전체" },
  { key: "capital", label: "수도권" },
  { key: "gangwon", label: "강원" },
  { key: "chungcheong", label: "충청" },
  { key: "honam", label: "호남" },
  { key: "yeongnam", label: "영남" },
  { key: "jeju", label: "제주" },
];

export interface RegionFilterTabsProps {
  selectedRegion: RegionGroupKey;
  onSelectRegion: (region: RegionGroupKey) => void;
  className?: string;
}

/**
 * RegionFilterTabs component for senior-friendly regional filtering.
 * High-contrast pills with min-h-[48px], font-size >= 17px, active #0f766e text-white,
 * inactive border-slate-300 text-slate-800.
 */
export function RegionFilterTabs({
  selectedRegion,
  onSelectRegion,
  className = "",
}: RegionFilterTabsProps) {
  return (
    <nav
      aria-label="권역별 필터"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {REGION_TABS.map((tab) => {
        const isActive = selectedRegion === tab.key;
        return (
          <button
            key={tab.key ?? "all"}
            type="button"
            onClick={() => onSelectRegion(tab.key)}
            aria-pressed={isActive}
            className={`px-4 py-2.5 rounded-xl text-[17px] font-bold min-h-[48px] transition-all cursor-pointer inline-flex items-center justify-center ${
              isActive
                ? "bg-[#0f766e] text-white border border-[#0f766e] shadow-sm"
                : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export default RegionFilterTabs;

