import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Interface representing raw records returned by Korea Park Golf Association API
 * 대한파크골프협회 API에서 반환받는 원시 데이터 구조 인터페이스
 */
interface KpgaRawRecord {
  id: string;
  name: string;
  status: string;
  cityProvince: string;
  holes: number;
  address: string;
  phone?: string;
  contact?: string;
  certified: boolean;
  usageInfo?: string;
  usageGuide?: string;
  region: string;
}

/**
 * Adapter for the Korea Park Golf Association official API
 * 대한파크골프협회 공식 API 수집 어댑터
 */
export class KpgaAdapter implements SourceAdapter {
  name = "kpga";
  kind: SourceKind = "official";
  url = "https://www.kpga7330.com/api/park-golf-courses";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    const records: SourceRecord[] = [];
    console.log("[KpgaAdapter] Fetching national park golf courses from KPGA API... / 대한파크골프협회 API로부터 전국 골프장 정보 수집 개시...");

    try {
      const response = await fetch(this.url, {
        method: "GET",
        headers: {
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) {
        console.error(`[KpgaAdapter] Failed to fetch KPGA API: Status ${response.status} / 대한파크골프협회 API 수집 실패: ${response.status}`);
        return [];
      }

      const body: any = await response.json();
      if (body.status !== "success" || !Array.isArray(body.data)) {
        console.error("[KpgaAdapter] API responded with non-success status or invalid data format / 협회 API 응답이 올바르지 않거나 데이터 형식이 유효하지 않습니다.");
        return [];
      }

      const rawList = body.data as KpgaRawRecord[];

      for (const item of rawList) {
        if (!item.name || !item.address) {
          continue;
        }

        const rawText = JSON.stringify(item);
        const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

        // Build descriptive metadata detailing holes and certification
        // 홀 규모 및 협회 공인인증 정보를 요약 텍스트로 보강합니다.
        let reservationText = `규모: ${item.holes}홀 / Capacity: ${item.holes} Holes`;
        if (item.certified) {
          reservationText += " | 대한파크골프협회 공인 인증구장 / Certified by KPGA";
        }
        if (item.usageGuide && item.usageGuide.trim() !== "") {
          reservationText += ` | 이용 안내: ${item.usageGuide.trim()}`;
        }

        records.push({
          sourceName: this.name,
          sourceUrl: `${this.url}?id=${item.id}`,
          sourceKind: this.kind,
          contentHash,
          rawText,
          extractedName: item.name.trim(),
          extractedAddress: item.address.trim(),
          extractedOperatorName: "대한파크골프협회",
          extractedPhone: item.phone?.trim() || item.contact?.trim() || null,
          extractedReservationText: reservationText,
        });
      }

      console.log(`[KpgaAdapter] Successfully parsed ${records.length} records from KPGA API. / 대한파크골프협회 수집 완료: 총 ${records.length}개 레코드 확보.`);
    } catch (error) {
      console.error("[KpgaAdapter] Error occurred during fetch operations: / 수집 루틴 실행 중 예외 발생:", error);
    }

    return records;
  }
}
