import { resolveSources } from "../sources/source-registry.js";
import { SourceRecord } from "../sources/source-types.js";
import { getConfig } from "../config.js";

/**
 * Executes the fetch pipeline by collecting records from all resolved sources.
 * 활성화된 모든 데이터 소스로부터 레코드를 수집하는 fetch 파이프라인을 실행합니다.
 */
export async function runFetchPipeline(scope: string): Promise<SourceRecord[]> {
  const config = getConfig();
  const sources = resolveSources(scope);
  const allRecords: SourceRecord[] = [];

  console.log(`Starting fetch pipeline for scope: ${scope} / 스코프 ${scope}에 대한 fetch 파이프라인 시작`);

  for (const source of sources) {
    try {
      console.log(`Fetching from source: ${source.name} / 소스 수집 중: ${source.name}`);
      const records = await source.fetchRecords(config.userAgent);
      console.log(`Successfully fetched ${records.length} records / ${records.length}개 레코드 수집 성공`);
      allRecords.push(...records);
    } catch (error) {
      console.error(`Failed to fetch from ${source.name} / ${source.name} 수집 실패:`, error);
    }
  }

  return allRecords;
}
