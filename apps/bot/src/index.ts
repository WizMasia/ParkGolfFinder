/**
 * Run the entire data collection and promotion pipeline.
 * 데이터 수집 및 승급 전체 파이프라인을 실행합니다.
 */
export async function runCommand(): Promise<void> {
  console.log("Running bot pipeline... / 봇 파이프라인을 실행하는 중...");
}

/**
 * Fetch raw data from external park golf sources.
 * 외부 파크골프 데이터 소스에서 원시 데이터를 가져옵니다.
 */
export async function fetchCommand(): Promise<void> {
  console.log("Fetching sources... / 소스를 가져오는 중...");
}

/**
 * Stage raw fetched data into intermediate staging tables.
 * 수집된 원시 데이터를 임시 적재 테이블에 저장합니다.
 */
export async function stageCommand(): Promise<void> {
  console.log("Staging raw data... / 원시 데이터를 스테이징 테이블에 적재하는 중...");
}

/**
 * Normalize staged data (cleaning up names, addresses, etc.).
 * 적재된 데이터를 정제합니다 (이름, 주소 정형화 등).
 */
export async function normalizeCommand(): Promise<void> {
  console.log("Normalizing staged data... / 스테이징된 데이터를 정제하는 중...");
}

/**
 * Review normalized candidates for duplicates and eligibility.
 * 정제된 대상의 중복 여부 및 파크골프장 적합성을 검토합니다.
 */
export async function reviewCommand(): Promise<void> {
  console.log("Reviewing facility candidates... / 정제된 시설 후보들을 검토하는 중...");
}

/**
 * Promote confirmed candidates to production tables.
 * 검증이 완료된 후보를 프로덕션 테이블로 승급(반영)시킵니다.
 */
export async function promoteCommand(): Promise<void> {
  console.log("Promoting confirmed facilities... / 확정된 시설 정보를 프로덕션으로 승급하는 중...");
}

/**
 * Clean up expired staging data and old runs.
 * 만료된 스테이징 데이터 및 이전 수집 실행 기록을 정리합니다.
 */
export async function cleanupCommand(): Promise<void> {
  console.log("Cleaning up expired data... / 만료된 데이터를 정리하는 중...");
}
