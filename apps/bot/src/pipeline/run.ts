import { runFetchPipeline } from "./fetch.js";
import { runStagePipeline } from "./stage.js";
import { runNormalizePipeline } from "./normalize.js";
import { runReviewPipeline } from "./review.js";
import { runPromotePipeline } from "./promote.js";
import { runCleanupPipeline } from "./cleanup.js";
import { finishStagingRun } from "@parkgolf/db";

/**
 * Runs the complete data harvesting, processing, and promotion pipeline.
 * 데이터 수집, 정제, 의사결정 및 프로덕션 승급 전체 파이프라인 단계를 차례대로 실행합니다.
 */
export async function executePipeline(scope: string): Promise<void> {
  console.log(`=== Starting ParkGolfFinder Pipeline Run (scope: ${scope}) ===`);
  let runId = "";

  try {
    // 1. Fetch raw data
    // 1. 원시 데이터를 수집합니다.
    const records = await runFetchPipeline(scope);

    if (records.length === 0) {
      console.log("No records fetched. Exiting pipeline. / 수집된 레코드가 없어 파이프라인을 종료합니다.");
      return;
    }

    // 2. Stage to DB
    // 2. 임시 테이블에 적재합니다.
    runId = await runStagePipeline(scope, records);

    // 3. Normalize name and addresses
    // 3. 이름 및 주소를 표준 형식으로 정제합니다.
    await runNormalizePipeline(runId);

    // 4. Cluster duplicates and make review verdicts
    // 4. 중복을 정리하고 승급 여부를 검토(리뷰)합니다.
    await runReviewPipeline(runId);

    // 5. Promote verified candidates to production
    // 5. 검증된 후보들을 프로덕션 테이블로 승급(Upsert)합니다.
    await runPromotePipeline(runId);

    // 6. Complete staging run
    // 6. 스테이징 완료 상태를 기록합니다.
    await finishStagingRun(runId, "completed", { recordsProcessed: records.length });

    // 7. Cleanup old records
    // 7. 만료된 이전 수집 데이터를 정리합니다.
    await runCleanupPipeline();

    console.log(`=== Successfully Completed Pipeline Run (ID: ${runId}) ===`);
  } catch (error) {
    console.error("Pipeline run failed with error: / 파이프라인 실행 실패:", error);
    if (runId) {
      try {
        await finishStagingRun(runId, "failed");
      } catch (dbErr) {
        console.error("Failed to mark run as failed in database / DB에 실패 상태 기록 실패:", dbErr);
      }
    }
  }
}
