"use client";

import React from "react";

export type ViewMode = "list" | "map";

export interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * Senior-Friendly View Toggle Component
 * High contrast segmented toggle between 'list' (📋 목록으로 보기) and 'map' (🗺️ 지도로 모아보기)
 * Large touch targets (min 48px height), bold text (>= 17px), active background #0f766e
 */
export function ViewToggle({ mode, onModeChange, className = "" }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="보기 모드 전환"
      className={`inline-flex w-full max-w-md p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => onModeChange("list")}
        aria-pressed={mode === "list"}
        className={`flex-1 flex items-center justify-center gap-2.5 min-h-[48px] py-3 px-4 rounded-xl text-[17px] font-bold transition-all duration-200 cursor-pointer ${
          mode === "list"
            ? "text-white shadow-md bg-[#0f766e]"
            : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
        }`}
      >
        <span className="text-xl" aria-hidden="true">📋</span>
        <span>목록으로 보기</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("map")}
        aria-pressed={mode === "map"}
        className={`flex-1 flex items-center justify-center gap-2.5 min-h-[48px] py-3 px-4 rounded-xl text-[17px] font-bold transition-all duration-200 cursor-pointer ${
          mode === "map"
            ? "text-white shadow-md bg-[#0f766e]"
            : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
        }`}
      >
        <span className="text-xl" aria-hidden="true">🗺️</span>
        <span>지도로 모아보기</span>
      </button>
    </div>
  );
}

export default ViewToggle;
