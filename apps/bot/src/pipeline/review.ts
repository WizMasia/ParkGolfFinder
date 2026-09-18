import { prisma, insertDuplicateCluster, insertDecision } from "@parkgolf/db";
import { deduplicateCandidates } from "../classification/dedupe.js";
import { NormalizedFacilityCandidate, isOutdoorParkGolf } from "@parkgolf/shared";

/**
 * Reviews facility records and writes deduplication clusters and decisions to staging.
 * 스테이징 데이터에 대한 중복 분석 및 최종 승급 의사결정을 기록합니다.
 */
export async function runReviewPipeline(runId: string): Promise<void> {
  console.log(`Starting review pipeline for run ID: ${runId} / 실행 ID ${runId}에 대한 리뷰 파이프라인 시작`);

  const records = await prisma.stagingFacilityRecord.findMany({
    where: { runId },
  });

  // Fetch staging source metadata to resolve sourceName and sourceKind
  // 소스 권위도(가중치) 계산을 위해 소스 메타데이터를 조회합니다.
  let sources: any[] = [];
  try {
    if (prisma.stagingSource?.findMany) {
      sources = (await prisma.stagingSource.findMany({
        where: { runId },
      })) || [];
    }
  } catch {
    sources = [];
  }
  if (!Array.isArray(sources)) {
    sources = [];
  }

  const sourceMapById = new Map<string, { sourceName: string; sourceUrl: string; sourceKind: string }>();
  const sourceMapByKey = new Map<string, { sourceName: string; sourceUrl: string; sourceKind: string }>();
  for (const s of sources) {
    sourceMapById.set(s.id, s);
    if (s.contentHash) {
      sourceMapByKey.set(s.contentHash, s);
    }
  }

  // Convert schema objects to NormalizedFacilityCandidate interface
  // 스키마 객체들을 NormalizedFacilityCandidate 인터페이스로 변환합니다.
  const candidates: NormalizedFacilityCandidate[] = records.map((r: any) => {
    const resolvedSource =
      r.source ||
      sourceMapById.get(r.sourceId) ||
      sourceMapByKey.get(r.sourceKey);

    const sourceName =
      resolvedSource?.sourceName ||
      r.sourceName ||
      r.sourceId ||
      r.sourceKey ||
      "";

    const sourceUrl = resolvedSource?.sourceUrl || r.sourceUrl || "";

    const rawKind = resolvedSource?.sourceKind || r.sourceKind;
    const sourceKind =
      rawKind === "official" || rawKind === "mcst" || rawKind === "parkgolf24" || rawKind === "kakao"
        ? rawKind
        : sourceName.includes("official")
        ? "official"
        : sourceName.includes("mcst")
        ? "mcst"
        : sourceName.includes("kakao")
        ? "kakao"
        : "other";

    return {
      id: r.id, // Ensure stable identification for clustering
      contentHash: r.contentHash,
      sourceName,
      sourceUrl,
      name: r.name,
      address: r.address,
      province: r.province,
      district: r.district,
      regionKey: r.regionKey,
      operatorName: r.normalizedOperatorName,
      phone: r.phone,
      lat: r.lat,
      lng: r.lng,
      rawText: r.rawText,
      normalizedName: r.normalizedName,
      normalizedAddress: r.normalizedAddress,
      normalizedOperatorName: r.normalizedOperatorName,
      sourceKind,
    };
  });

  // 1. Group duplicates into clusters
  // 1. 중복 대상들을 그룹으로 묶습니다.
  const clusters = deduplicateCandidates(candidates);

  const duplicateMemberKeys = new Set<string>();

  for (const cluster of clusters) {
    await insertDuplicateCluster({
      runId,
      duplicateStatus: cluster.duplicateStatus,
      canonicalKey: cluster.canonicalKey,
      memberKeys: cluster.memberKeys,
      reason: cluster.reason,
    });

    // Mark non-canonical members as duplicate to skip promotion
    // 대표 키가 아닌 멤버 키들은 중복으로 분류하여 승급 대상에서 제외합니다.
    cluster.memberKeys.forEach((key) => {
      if (key !== cluster.canonicalKey) {
        duplicateMemberKeys.add(key);
      }
    });
  }

  // 2. Make promotional decision for each facility candidate
  // 2. 각 시설 후보에 대한 승급 의사결정을 작성합니다.
  for (const record of records) {
    let decision = "confirmed";
    let reason = "Verified park golf venue / 검증된 파크골프장";

    const isOutdoor = isOutdoorParkGolf(record.name, record.rawText);
    if (!isOutdoor || record.parkGolfVerdict !== "confirmed") {
      decision = "hidden";
      reason = "Not verified as a park golf venue / 파크골프장 유효성 검증 실패";
    } else if (duplicateMemberKeys.has(record.id)) {
      decision = "hidden";
      reason = "Duplicate record (non-canonical) / 중복된 레코드 (비대표 항목)";
    }

    await insertDecision({
      runId,
      facilityRecordId: record.id,
      decision,
      reason,
    });
  }

  console.log(`Successfully completed review for run ID: ${runId} / 실행 ID ${runId} 리뷰 완료`);
}
