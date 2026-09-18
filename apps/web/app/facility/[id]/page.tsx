import React from "react";
import { findFacilityById } from "@parkgolf/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReservationTable } from "../../../components/detail/reservation-table";
import { PricingTable } from "../../../components/detail/pricing-table";
import { FacilitySpecTable } from "../../../components/detail/facility-spec-table";
import { FacilityMapView } from "../../../components/map/facility-map-view";
import { MOCK_FACILITIES } from "../../../lib/mock-data";

function extractHoles(facility: any): number | null {
  if (typeof facility.holes === "number" && !isNaN(facility.holes)) {
    return facility.holes;
  }
  const target =
    facility.reservation?.summary ||
    facility.name ||
    facility.rawText ||
    "";
  const match = String(target).match(/(\d+)\s*홀/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (!isNaN(n)) return n;
  }
  return null;
}

export interface FacilityDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Structured Information-First Facility Detail Page.
 * Senior-friendly high contrast layout (18px text, clear tables, zero external redirects).
 */
export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { id } = await params;
  let facility: any = null;

  try {
    facility = await findFacilityById(id);
  } catch (error) {
    console.warn("Database query failed, falling back to mock data:", error);
  }

  if (!facility) {
    facility = MOCK_FACILITIES.find((f) => f.id === id) || null;
  }

  if (!facility) {
    notFound();
  }

  const holes = extractHoles(facility);
  const feeSummary = facility.pricing?.baseFeeText || "무료";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 sm:px-6 shadow-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="시설 목록으로 돌아가기"
          >
            <span className="text-lg">←</span>
            <span>목록으로 돌아가기</span>
          </Link>
          <span className="text-sm font-semibold text-slate-500 hidden sm:inline-block">
            전국 파크골프 시설 정보
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8 space-y-6">
        {/* 1. Summary Header Card */}
        <section
          aria-labelledby="facility-title"
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {facility.facilityType === "indoor" ? "실내 코스" : "야외 잔디 구장"}
            </span>
            {holes && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {holes}홀
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
              {facility.ownership === "private" ? "민간" : "공공"}
            </span>
          </div>

          <h1
            id="facility-title"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug"
          >
            {facility.name}
          </h1>

          <div className="mt-4 space-y-2 text-base md:text-lg text-slate-700">
            <div className="flex items-start gap-2.5">
              <span className="text-slate-400 select-none">📍</span>
              <span className="font-medium">{facility.address}</span>
            </div>
            {facility.phone && (
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 select-none">📞</span>
                <a
                  href={`tel:${facility.phone.replace(/[^0-9]/g, "")}`}
                  className="font-bold text-teal-700 hover:text-teal-900 underline underline-offset-4"
                  aria-label={`${facility.phone} 전화걸기`}
                >
                  {facility.phone}
                </a>
                <span className="text-xs text-slate-500 font-normal">(터치 시 바로 통화)</span>
              </div>
            )}
            {facility.operatorName && (
              <div className="flex items-center gap-2.5 text-sm md:text-base text-slate-600">
                <span className="text-slate-400 select-none">🏢</span>
                <span>운영 주체: <strong>{facility.operatorName}</strong></span>
              </div>
            )}
          </div>
        </section>

        {/* 2. Structured Reservation Table */}
        <ReservationTable
          summary={facility.reservation?.summary}
          methods={facility.reservation?.methods}
        />

        {/* 3. Structured Pricing Table */}
        <PricingTable pricing={facility.pricing} />

        {/* 4. Course Specifications Table */}
        <FacilitySpecTable
          facility={{
            holes,
            facilityType: facility.facilityType,
            operatorName: facility.operatorName,
            phone: facility.phone,
            address: facility.address,
            ownership: facility.ownership,
          }}
        />

        {/* 5. Course Location Mini Leaflet Map */}
        <section
          aria-labelledby="map-heading"
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 text-xl font-bold">
              🗺️
            </span>
            <div>
              <h2 id="map-heading" className="text-xl md:text-2xl font-bold text-slate-900">
                구장 위치 지도
              </h2>
              <p className="text-sm md:text-base text-slate-600 mt-0.5">
                파크골프장의 상세 위치를 지도에서 확인하세요.
              </p>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full overflow-hidden rounded-xl border border-slate-200">
            <FacilityMapView
              facilities={[
                {
                  id: facility.id,
                  name: facility.name,
                  lat: facility.lat,
                  lng: facility.lng,
                  holes: holes,
                  feeSummary: feeSummary,
                  address: facility.address,
                 phone: facility.phone,
               },
             ]}
              center={
                Number.isFinite(facility.lat) && Number.isFinite(facility.lng)
                  ? [facility.lat, facility.lng]
                  : undefined
              }
             zoom={15}
             selectedFacilityId={facility.id}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
            <span>📌 {facility.address}</span>
            {facility.phone && (
              <a
                href={`tel:${facility.phone.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800 transition-colors w-full sm:w-auto justify-center"
              >
                <span>📞 전화 문의하기</span>
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
