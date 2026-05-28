import { SourceKind } from "@parkgolf/shared";

/**
 * Raw record format fetched from external data source
 * 외부 데이터 소스로부터 가져온 원시 레코드 형식
 */
export interface SourceRecord {
  sourceName: string;
  sourceUrl: string;
  sourceKind: SourceKind;
  contentHash: string;
  rawText: string;
  extractedName: string | null;
  extractedAddress: string | null;
  extractedOperatorName: string | null;
  extractedPhone: string | null;
  extractedReservationText: string | null;
  kakaoPlaceId?: string | null;
  naverPlaceId?: string | null;
  mapSearchQuery?: string | null;
}

/**
 * Adapter interface for parsing and fetching raw data
 * 원시 데이터를 가져오고 파싱하기 위한 어댑터 인터페이스
 */
export interface SourceAdapter {
  name: string;
  kind: SourceKind;
  url: string;
  fetchRecords(userAgent: string): Promise<SourceRecord[]>;
}
