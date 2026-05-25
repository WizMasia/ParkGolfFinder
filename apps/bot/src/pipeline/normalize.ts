import { prisma } from "@parkgolf/db";
import { normalizeName } from "../classification/normalize-name.js";
import { normalizeAddress, parseAddressRegion } from "../classification/normalize-address.js";

/**
 * Normalizes staged raw facilities for a given staging run.
 * 특정 스테이징 실행(run)에 대해 원시 시설 데이터를 표준 포맷으로 정제(normalize)합니다.
 */
export async function runNormalizePipeline(runId: string): Promise<void> {
  console.log(`Starting normalization pipeline for run ID: ${runId} / 실행 ID ${runId}에 대한 정제 파이프라인 시작`);

  // 1. Fetch raw facility records from staging
  // 1. 스테이징에서 원시 시설 레코드를 조회합니다.
  const records = await prisma.stagingFacilityRecord.findMany({
    where: { runId },
  });

  for (const record of records) {
    try {
      const normName = normalizeName(record.name);
      const normAddress = normalizeAddress(record.address);
      const regionData = parseAddressRegion(record.address);

      // 2. Update staging record with normalized values
      // 2. 정제된 값들로 스테이징 레코드를 업데이트합니다.
      await prisma.stagingFacilityRecord.update({
        where: { id: record.id },
        data: {
          normalizedName: normName,
          normalizedAddress: normAddress,
          province: regionData.province,
          district: regionData.district,
          regionKey: regionData.regionKey,
        },
      });
    } catch (error) {
      console.error(`Failed to normalize record ID: ${record.id} / 레코드 ID ${record.id} 정제 실패:`, error);
    }
  }

  console.log(`Successfully completed normalization for run ID: ${runId} / 실행 ID ${runId} 정제 완료`);
}
