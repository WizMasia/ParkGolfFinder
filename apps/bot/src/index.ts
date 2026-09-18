import { executePipeline } from "./pipeline/run.js";
import { runFetchPipeline } from "./pipeline/fetch.js";
import { runStagePipeline } from "./pipeline/stage.js";
import { runNormalizePipeline } from "./pipeline/normalize.js";
import { runReviewPipeline } from "./pipeline/review.js";
import { runPromotePipeline } from "./pipeline/promote.js";
import { runCleanupPipeline } from "./pipeline/cleanup.js";
import { getConfig } from "./config.js";

/**
 * Run the entire data collection and promotion pipeline.
 * 데이터 수집 및 승급 전체 파이프라인을 실행합니다.
 */
export async function runCommand(): Promise<void> {
  const config = getConfig();
  await executePipeline(config.scope);
}

/**
 * Fetch raw data from external park golf sources.
 * 외부 파크골프 데이터 소스에서 원시 데이터를 가져옵니다.
 */
export async function fetchCommand(): Promise<void> {
  const config = getConfig();
  await runFetchPipeline(config.scope);
}

/**
 * Stage raw fetched data into intermediate staging tables.
 * 수집된 원시 데이터를 임시 적재 테이블에 저장합니다.
 */
export async function stageCommand(): Promise<void> {
  const config = getConfig();
  const records = await runFetchPipeline(config.scope);
  await runStagePipeline(config.scope, records);
}

/**
 * Normalize staged data (cleaning up names, addresses, etc.).
 * 적재된 데이터를 정제합니다 (이름, 주소 정형화 등).
 */
export async function normalizeCommand(): Promise<void> {
  console.log("Normalizing staged data... (use run command for full pipeline) / 정제 파이프라인 실행 중... (전체 실행은 run을 이용하세요)");
}

/**
 * Review normalized candidates for duplicates and eligibility.
 * 정제된 대상의 중복 여부 및 파크골프장 적합성을 검토합니다.
 */
export async function reviewCommand(): Promise<void> {
  console.log("Reviewing candidates... (use run command for full pipeline) / 검토 파이프라인 실행 중... (전체 실행은 run을 이용하세요)");
}

/**
 * Promote confirmed candidates to production tables.
 * 검증이 완료된 후보를 프로덕션 테이블로 승급(반영)시킵니다.
 */
export async function promoteCommand(): Promise<void> {
  console.log("Promoting confirmed... (use run command for full pipeline) / 승급 파이프라인 실행 중... (전체 실행은 run을 이용하세요)");
}

/**
 * Clean up expired staging data and old runs.
 * 만료된 스테이징 데이터 및 이전 수집 실행 기록을 정리합니다.
 */
export async function cleanupCommand(): Promise<void> {
  await runCleanupPipeline();
}
