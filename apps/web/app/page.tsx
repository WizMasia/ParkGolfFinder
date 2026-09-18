import React from "react";
import type { FacilitySummary, FeeType } from "@parkgolf/shared";
import { findFacilitiesByQuery } from "@parkgolf/db";
import { SeniorHomeShell } from "../components/home/senior-home-shell";
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
    feeSummary: f.pricing?.baseFeeText || f.feeSummary || null,
    baseFeeText: f.pricing?.baseFeeText || f.baseFeeText || "",
    concessionFeeText: f.pricing?.concessionFeeText || f.concessionFeeText || null,
    kakaoPlaceId: f.kakaoPlaceId || null,
    naverPlaceId: f.naverPlaceId || null,
    mapSearchQuery: f.mapSearchQuery || null,
    reservationSummary: f.reservation?.summary || f.reservationSummary || "예약 정보 확인 필요",
    homepageUrl: bestUrl || null,
    reservationUrl: reservationUrl || null,
  };
}

/**
 * Server Component for the Home Page.
 * Fetches facilities from PostgreSQL database via findFacilitiesByQuery,
 * falling back to MOCK_FACILITIES if DB returns 0 rows or query fails.
 */
export default async function HomePage() {
  let initialFacilities: FacilitySummary[] = [];

  try {
    const dbRows = await findFacilitiesByQuery("");
    if (dbRows && dbRows.length > 0) {
      initialFacilities = dbRows.map(normalizeFacilitySummary);
    }
  } catch (error) {
    console.warn("Database query failed in HomePage Server Component, falling back to mock data:", error);
  }

  // Fallback to mock facilities if 0 rows returned
  if (initialFacilities.length === 0) {
    initialFacilities = (MOCK_FACILITIES as any[]).map(normalizeFacilitySummary);
  }

  return (
    <SeniorHomeShell initialFacilities={initialFacilities} />
  );
}
