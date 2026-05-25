/**
 * Facility type options
 * 시설 종류 옵션
 */
export type FacilityType = "outdoor" | "indoor";

/**
 * Display status of facility
 * 시설 노출 상태
 */
export type FacilityStatus = "active" | "hidden";

/**
 * Ownership type of facility
 * 시설 소유권 구분
 */
export type Ownership = "public" | "private";

/**
 * Fee structure classification
 * 이용 요금 유형 구분
 */
export type FeeType = "free" | "paid" | "partial" | "inquiry";

/**
 * Reservation mechanism options
 * 예약 방법 종류 옵션
 */
export type ReservationMethodType =
  | "phone"
  | "internet_first_come"
  | "internet_lottery"
  | "visit"
  | "none";

/**
 * Facility data summary schema for UI display
 * UI 노출용 파크골프 시설 요약 데이터 스키마
 */
export interface FacilitySummary {
  id: string;
  name: string;
  address: string;
  province: string | null;
  district: string | null;
  regionKey: string;
  facilityType: FacilityType;
  status: FacilityStatus;
  ownership: Ownership;
  operatorName: string | null;
  phone?: string | null;
  lat: number;
  lng: number;
  baseFeeText: string;
  concessionFeeText?: string | null;
  distanceKm?: number;
}

/**
 * User search filter state
 * 사용자 검색 필터 상태
 */
export interface SearchState {
  query: string;
  regionGroup: "capital" | "gangwon" | "chungcheong" | "honam" | "yeongnam" | "jeju" | null;
  distanceKm: number;
  concessionOn: boolean;
  facilityType: FacilityType | null;
  feeFilter: FeeType | null;
  currentLocation: { lat: number; lng: number } | null;
}
