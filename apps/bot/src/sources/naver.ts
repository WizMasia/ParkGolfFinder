import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";
import { SIGUNGU_LIST } from "./kakao.js";

export class NaverAdapter implements SourceAdapter {
  name = "naver";
  kind: SourceKind = "other";
  url = "https://openapi.naver.com/v1/search/local.json";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn("[NaverAdapter] Client ID or Secret is missing in environment variables.");
      return [];
    }

    const allRecords: SourceRecord[] = [];
    console.log(`[NaverAdapter] Starting Naver Local Search for ${SIGUNGU_LIST.length} districts...`);

    for (const sigungu of SIGUNGU_LIST) {
      const queries = [
        `${sigungu} 파크골프장`,
        `${sigungu} 스크린 파크골프장`,
      ];

      for (const query of queries) {
        try {
          const targetUrl = `${this.url}?query=${encodeURIComponent(query)}&display=5`;
          const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
              "X-Naver-Client-Id": clientId,
              "X-Naver-Client-Secret": clientSecret,
              "User-Agent": userAgent,
            },
          });

          if (!response.ok) {
            console.error(`[NaverAdapter] Error search query "${query}": ${response.status}`);
            continue;
          }

          const data: any = await response.json();
          const items = data.items || [];

          for (const item of items) {
            const rawText = JSON.stringify(item);
            const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

            const cleanName = item.title
              .replace(/<[^>]*>/g, "")
              .replace(/&amp;/gi, "&")
              .trim();

            const address = item.roadAddress || item.address || "";
            const addrParts = address.split(" ");
            const regionPrefix = addrParts.slice(0, 2).join(" ");
            const mapSearchQuery = `${regionPrefix} ${cleanName}`.trim();

            let naverPlaceId: string | null = null;
            if (item.link && item.link.includes("place.naver.com")) {
              const match = item.link.match(/place\/(\d+)/);
              if (match) {
                naverPlaceId = match[1];
              }
            }

            allRecords.push({
              sourceName: this.name,
              sourceUrl: item.link || targetUrl,
              sourceKind: this.kind,
              contentHash,
              rawText,
              extractedName: cleanName,
              extractedAddress: address,
              extractedOperatorName: null,
              extractedPhone: item.telephone || null,
              extractedReservationText: null,
              naverPlaceId,
              mapSearchQuery,
            });
          }
        } catch (error) {
          console.error(`[NaverAdapter] Failed query "${query}":`, error);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`[NaverAdapter] Finished crawling. Collected ${allRecords.length} records.`);
    return allRecords;
  }
}
