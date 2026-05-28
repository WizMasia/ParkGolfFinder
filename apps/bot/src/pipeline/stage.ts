import {
  createStagingRun,
  insertStagingSource,
  insertFacilityRecord,
  insertReservationRecord,
} from "@parkgolf/db";
import { isParkGolfVenue } from "@parkgolf/shared";
import { SourceRecord } from "../sources/source-types.js";

/**
 * Stages the raw fetched source records into database staging tables.
 * 수집된 원시 소스 레코드를 데이터베이스 스테이징 테이블에 적재합니다.
 */
export async function runStagePipeline(scope: string, records: SourceRecord[]): Promise<string> {
  const run = await createStagingRun(scope);
  const runId = run.id;

  console.log(`Starting staging pipeline for run ID: ${runId} / 실행 ID ${runId}에 대한 스테이징 파이프라인 시작`);

  for (const record of records) {
    try {
      // 1. Insert source metadata
      // 1. 소스 메타데이터를 삽입합니다.
      const source = await insertStagingSource({
        runId,
        sourceName: record.sourceName,
        sourceUrl: record.sourceUrl,
        sourceKind: record.sourceKind,
        contentHash: record.contentHash,
      });

      // 2. Classify park golf eligibility tentatively
      // 2. 임시 파크골프장 여부 분류를 수행합니다.
      const isEligible = isParkGolfVenue({
        name: record.extractedName || "",
        rawText: record.rawText,
        sourceName: record.sourceName,
        sourceUrl: record.sourceUrl,
      });

      const parkGolfVerdict = isEligible ? "confirmed" : "hidden";

      // 3. Insert staging facility candidate record
      // 3. 임시 적재 시설 레코드를 삽입합니다.
      const facilityRecord = await insertFacilityRecord({
        runId,
        sourceId: source.id,
        sourceKey: record.contentHash,
        name: record.extractedName || "이름 없음",
        address: record.extractedAddress || "주소 없음",
        rawText: record.rawText,
        normalizedName: "", // Will be filled in the normalize pipeline / 정제 파이프라인에서 채워질 예정
        normalizedAddress: "", // Will be filled in the normalize pipeline / 정제 파이프라인에서 채워질 예정
        contentHash: record.contentHash,
        parkGolfVerdict,
        duplicateStatus: "ambiguous", // Initial state before dedupe / 중복 판정 전 초기 상태
        operatorName: record.extractedOperatorName,
        phone: record.extractedPhone,
        kakaoPlaceId: record.kakaoPlaceId,
        naverPlaceId: record.naverPlaceId,
        mapSearchQuery: record.mapSearchQuery,
      });

      // 4. Insert reservation method if extracted
      // 4. 예약 수단이 존재할 시 적재합니다.
      if (record.extractedReservationText) {
        await insertReservationRecord({
          facilityRecordId: facilityRecord.id,
          methodType: record.extractedReservationText.includes("인터넷") ? "internet_first_come" : "phone",
          methodText: record.extractedReservationText,
          priority: 1,
        });
      }
    } catch (error) {
      console.error(`Failed to stage record for ${record.extractedName} / ${record.extractedName} 레코드 적재 실패:`, error);
    }
  }

  return runId;
}
