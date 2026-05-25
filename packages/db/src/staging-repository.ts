import { prisma } from "./client.js";

/**
 * Creates a new staging run record
 * 새로운 스테이징 실행 기록을 생성합니다.
 */
export async function createStagingRun(scope: string) {
  return prisma.stagingRun.create({
    data: {
      scope,
      status: "running",
    },
  });
}

/**
 * Marks a staging run as finished and saves summary stats
 * 스테이징 실행 단계를 마크하고 요약 통계를 저장합니다.
 */
export async function finishStagingRun(runId: string, status: string, statsJson?: any) {
  return prisma.stagingRun.update({
    where: { id: runId },
    data: {
      status,
      endedAt: new Date(),
      statsJson: statsJson ?? null,
    },
  });
}

/**
 * Inserts metadata about fetched data source
 * 수집한 데이터 소스 메타데이터를 삽입합니다.
 */
export async function insertStagingSource(data: {
  runId: string;
  sourceName: string;
  sourceUrl: string;
  sourceKind: string;
  contentHash: string;
}) {
  return prisma.stagingSource.create({
    data,
  });
}

/**
 * Inserts facility record to staging table
 * 시설 정보를 스테이징 테이블에 삽입합니다.
 */
export async function insertFacilityRecord(data: {
  runId: string;
  sourceId: string;
  sourceKey: string;
  name: string;
  address: string;
  province?: string | null;
  district?: string | null;
  regionKey?: string | null;
  operatorName?: string | null;
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
  rawText: string;
  normalizedName: string;
  normalizedAddress: string;
  normalizedOperatorName?: string | null;
  contentHash: string;
  parkGolfVerdict: string;
  duplicateStatus: string;
}) {
  return prisma.stagingFacilityRecord.create({
    data,
  });
}

/**
 * Inserts reservation details linked to facility record
 * 시설 레코드와 연계된 예약 방식을 삽입합니다.
 */
export async function insertReservationRecord(data: {
  facilityRecordId: string;
  methodType: string;
  methodText: string;
  priority: number;
  ruleText?: string | null;
  url?: string | null;
  notes?: string | null;
}) {
  return prisma.stagingReservationRecord.create({
    data,
  });
}

/**
 * Inserts temporary duplicate group decision
 * 임시 중복 그룹 판정 결과를 삽입합니다.
 */
export async function insertDuplicateCluster(data: {
  runId: string;
  duplicateStatus: string;
  canonicalKey: string;
  memberKeys: string[];
  reason: string;
}) {
  return prisma.stagingDuplicateCluster.create({
    data: {
      runId: data.runId,
      duplicateStatus: data.duplicateStatus,
      canonicalKey: data.canonicalKey,
      memberKeys: data.memberKeys as any,
      reason: data.reason,
    },
  });
}

/**
 * Inserts manual or pipeline classification decision
 * 수동 또는 자동 분류 결과를 삽입합니다.
 */
export async function insertDecision(data: {
  runId: string;
  facilityRecordId: string;
  decision: string;
  reason: string;
}) {
  return prisma.stagingDecision.upsert({
    where: { facilityRecordId: data.facilityRecordId },
    update: {
      decision: data.decision,
      reason: data.reason,
      reviewedAt: new Date(),
    },
    create: {
      runId: data.runId,
      facilityRecordId: data.facilityRecordId,
      decision: data.decision,
      reason: data.reason,
    },
  });
}

/**
 * Lists unfinished staging runs
 * 미완료된 스테이징 실행 목록을 조회합니다.
 */
export async function listOpenRuns() {
  return prisma.stagingRun.findMany({
    where: { status: "running" },
  });
}

/**
 * Deletes expired staging data outside retention window
 * 보존 기간이 지난 스테이징 데이터를 삭제합니다.
 */
export async function deleteExpiredStagingData(retentionDays: number): Promise<void> {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - retentionDays);

  // 1. Get runs to delete
  // 1. 삭제할 run 목록을 가져옵니다.
  const expiredRuns = await prisma.stagingRun.findMany({
    where: {
      startedAt: { lt: threshold },
    },
    select: { id: true },
  });

  const runIds = expiredRuns.map((r) => r.id);

  if (runIds.length === 0) return;

  // 2. Cascade delete records matching runIds
  // 2. runIds에 매칭되는 레코드를 순차 삭제합니다.
  await prisma.stagingDecision.deleteMany({
    where: { runId: { in: runIds } },
  });
  await prisma.stagingDuplicateCluster.deleteMany({
    where: { runId: { in: runIds } },
  });
  await prisma.stagingReservationRecord.deleteMany({
    where: {
      facilityRecord: { runId: { in: runIds } },
    },
  });
  await prisma.stagingFacilityRecord.deleteMany({
    where: { runId: { in: runIds } },
  });
  await prisma.stagingSource.deleteMany({
    where: { runId: { in: runIds } },
  });
  await prisma.stagingRun.deleteMany({
    where: { id: { in: runIds } },
  });
}
