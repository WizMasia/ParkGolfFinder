import { deleteExpiredStagingData } from "@parkgolf/db";
import { getConfig } from "../config.js";

/**
 * Cleans up expired staging records from database based on configuration.
 * 환경 설정된 보관 만료일에 맞춰 만료된 스테이징 레코드들을 일괄 삭제합니다.
 */
export async function runCleanupPipeline(): Promise<void> {
  const config = getConfig();
  console.log(`Starting cleanup pipeline, retention: ${config.retentionDays} days / 정리 파이프라인 시작 (보존 기간: ${config.retentionDays}일)`);

  try {
    await deleteExpiredStagingData(config.retentionDays);
    console.log("Successfully completed cleanup pipeline / 정리 파이프라인 정상 완료");
  } catch (error) {
    console.error("Failed to run cleanup pipeline / 정리 파이프라인 실행 중 오류:", error);
  }
}
