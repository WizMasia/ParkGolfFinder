import { SourceAdapter } from "./source-types.js";
import { KakaoAdapter } from "./kakao.js";
import { NaverAdapter } from "./naver.js";
import { PORTAL_DATASETS, PublicPortalAdapter } from "./public-portal.js";
import { KpgaAdapter } from "./kpga.js";
import { OfficialAdapter } from "./official.js";
import { DjpkgolfAdapter } from "./djpkgolf.js";
import { ParkGolfListAdapter } from "./parkgolflist.js";

/**
 * Global registry of active source adapters
 * 활성화된 소스 어댑터의 전역 레지스트리
 */
const registry: SourceAdapter[] = [
  ...PORTAL_DATASETS.map((config) => new PublicPortalAdapter(config)),
  new KakaoAdapter(),
  new NaverAdapter(),
  new KpgaAdapter(),
  new OfficialAdapter(),
  new DjpkgolfAdapter(),
  new ParkGolfListAdapter(),
];

/**
 * Resolves active source adapters based on run scope
 * 실행 범위(scope)에 맞춰 활성화할 소스 어댑터 목록을 반환합니다.
 */
export function resolveSources(scope: string): SourceAdapter[] {
  if (scope === "national") {
    return registry;
  }
  // Filter by scope name if specific source scope is given
  // 특정 소스 범위가 지정된 경우 스코프 이름으로 필터링합니다.
  return registry.filter((adapter) => adapter.name.toLowerCase() === scope.toLowerCase());
}
