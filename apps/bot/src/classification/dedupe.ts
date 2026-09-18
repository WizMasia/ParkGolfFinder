import { clusterDuplicates, NormalizedFacilityCandidate, DuplicateCluster } from "@parkgolf/shared";

/**
 * Executes clustering process to group duplicates from normalized candidate list.
 * 정규화된 후보군 중에서 중복 항목들을 찾아 클러스터로 그룹화합니다.
 */
export function deduplicateCandidates(candidates: NormalizedFacilityCandidate[]): DuplicateCluster[] {
  return clusterDuplicates(candidates);
}
