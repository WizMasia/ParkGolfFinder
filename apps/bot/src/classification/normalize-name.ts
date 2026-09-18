/**
 * Normalizes facility name by trimming, collapsing spaces, and stripping noisy suffixes.
 * 공백을 없애고 노이즈 접미사를 제거하여 시설명을 정규화합니다.
 */
export function normalizeName(name: string): string {
  if (!name) return "";

  let result = name.trim().toLowerCase();

  // Strip brackets and content inside them (e.g. [공공], (임시))
  // 괄호 및 괄호 안의 내용 제거 (예: [공공], (임시))
  result = result.replace(/[\(\[\{].*?[\)\}\]]/g, "");

  // Collapse spaces and punctuation
  // 공백 및 구두점 제거
  result = result.replace(/[\s\-_,\.]/g, "");

  // Strip common suffixes
  // 공통 접미사 제거
  result = result.replace(/(파크골프장|파크골프클럽|파크골프|골프장|골프클럽)$/, "");

  return result;
}
