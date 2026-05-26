import { prisma } from "@parkgolf/db";
import { getConfig } from "../config.js";
import { normalizeName } from "../classification/normalize-name.js";
import { normalizeAddress, normalizeAddressAndRegion } from "../classification/normalize-address.js";
import { geocodeAddress, getFallbackCoords } from "../classification/geocoder.js";

/**
 * Normalizes staged raw facilities for a given staging run.
 * 특정 스테이징 실행(run)에 대해 원시 시설 데이터를 표준 포맷으로 정제(normalize) 및 좌표 지오코딩을 수행합니다.
 */
export async function runNormalizePipeline(runId: string): Promise<void> {
  console.log(`Starting normalization pipeline for run ID: ${runId} / 실행 ID ${runId}에 대한 정제 파이프라인 시작`);

  const config = getConfig();

  // 1. Fetch raw facility records from staging
  // 1. 스테이징에서 원시 시설 레코드를 조회합니다.
  const records = await prisma.stagingFacilityRecord.findMany({
    where: { runId },
  });

  for (const record of records) {
    try {
      // 2. Perform Juso Address API check to standardize the address and region elements
      // 2. 행안부 도로명주소 API를 호출하여 주소를 표준화하고 지역 정보(시도/시군구)를 추출합니다.
      const regionData = await normalizeAddressAndRegion(record.address, config.userAgent);
      
      const finalAddress = regionData.standardizedAddress || record.address;
      const normName = normalizeName(record.name);
      const normAddress = normalizeAddress(finalAddress);

      // 3. Resolve coordinates (Geocoding) if not already provided by the raw source
      // 3. 소스 데이터에 위경도가 공란인 경우 카카오 API 지오코딩 및 Fallback 대표 좌표 매핑을 수행합니다.
      let lat = record.lat;
      let lng = record.lng;

      if (lat === null || lng === null) {
        const coords = await geocodeAddress(finalAddress, config.userAgent);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        } else {
          // Fallback to province centroids
          const fallback = getFallbackCoords(finalAddress);
          lat = fallback.lat;
          lng = fallback.lng;
        }
      }

      // 4. Update staging record with normalized and geocoded values
      // 4. 정제되고 좌표가 채워진 값들로 스테이징 레코드를 업데이트합니다.
      await prisma.stagingFacilityRecord.update({
        where: { id: record.id },
        data: {
          address: finalAddress,
          normalizedName: normName,
          normalizedAddress: normAddress,
          province: regionData.province,
          district: regionData.district,
          regionKey: regionData.regionKey,
          lat,
          lng,
        },
      });
    } catch (error) {
      console.error(`Failed to normalize record ID: ${record.id} / 레코드 ID ${record.id} 정제 실패:`, error);
    }
  }

  console.log(`Successfully completed normalization for run ID: ${runId} / 실행 ID ${runId} 정제 완료`);
}
