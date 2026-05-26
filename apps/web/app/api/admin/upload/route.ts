import { NextRequest, NextResponse } from "next/server";
import {
  createStagingRun,
  insertStagingSource,
  insertFacilityRecord,
  finishStagingRun
} from "@parkgolf/db";
import { isParkGolfVenue } from "@parkgolf/shared";
import { runNormalizePipeline } from "@parkgolf/bot/pipeline/normalize";
import { runReviewPipeline } from "@parkgolf/bot/pipeline/review";
import crypto from "crypto";

/**
 * CSV Upload Record Type Definition
 * CSV 업로드 레코드 타입 정의
 */
interface CsvUploadRecord {
  name: string;
  address: string;
  phone?: string;
  operatorName?: string;
}

/**
 * POST handler for Staging CSV Data and triggering pipelines
 * CSV 데이터를 스테이징에 적재하고 파이프라인을 구동하는 POST 핸들러
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { records, filename } = body as { records: CsvUploadRecord[]; filename: string };

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No records provided / 적재할 레코드가 없습니다." },
        { status: 400 }
      );
    }

    const scope = `upload_${filename || "unnamed"}_${Date.now()}`;
    
    // 1. Create a staging run for tracking
    // 1. 추적을 위한 스테이징 실행(Run) 레코드를 생성합니다.
    const run = await createStagingRun(scope);
    const runId = run.id;

    // 2. Create staging source record
    // 2. 스테이징 소스 메타데이터 레코드를 생성합니다.
    const fileHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(records) + Date.now().toString())
      .digest("hex");

    const source = await insertStagingSource({
      runId,
      sourceName: filename || "csv_upload",
      sourceUrl: "local_upload",
      sourceKind: "other",
      contentHash: fileHash,
    });

    let stagedCount = 0;

    // 3. Insert raw staging records
    // 3. 원시 스테이징 레코드들을 삽입합니다.
    for (const record of records) {
      if (!record.name || !record.address) {
        continue;
      }

      const rawText = JSON.stringify(record);
      const recordHash = crypto.createHash("sha256").update(rawText).digest("hex");

      // Check eligibility using shared library validator
      // 공통 검증 모듈을 통해 파크골프장 여부 임시 분류를 처리합니다.
      const isEligible = isParkGolfVenue({
        name: record.name,
        rawText,
        sourceName: "csv_upload",
        sourceUrl: "local_upload",
      });

      const parkGolfVerdict = isEligible ? "confirmed" : "hidden";

      await insertFacilityRecord({
        runId,
        sourceId: source.id,
        sourceKey: recordHash,
        name: record.name,
        address: record.address,
        rawText,
        normalizedName: "", // Standardized during normalization / 정제 파이프라인에서 채워집니다
        normalizedAddress: "", // Standardized during normalization / 정제 파이프라인에서 채워집니다
        contentHash: recordHash,
        parkGolfVerdict,
        duplicateStatus: "ambiguous",
        operatorName: record.operatorName || null,
        phone: record.phone || null,
      });

      stagedCount++;
    }

    // 4. Trigger the normalization pipeline (standardizes address and fetches coordinates)
    // 4. 정제 파이프라인을 실행합니다 (주소 표준화 및 좌표 조회 처리).
    await runNormalizePipeline(runId);

    // 5. Trigger the review pipeline (checks for duplication based on coordinates/names)
    // 5. 리뷰 파이프라인을 실행합니다 (좌표/명칭 기반 중복 검증 처리).
    await runReviewPipeline(runId);

    // 6. Complete staging run and save summary statistics
    // 6. 스테이징 실행을 완료하고 요약 통계를 기재합니다.
    await finishStagingRun(runId, "completed", {
      totalRecords: records.length,
      stagedRecords: stagedCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      runId,
      totalCount: records.length,
      stagedCount,
      message: "CSV successfully staged, normalized, and reviewed. / CSV 데이터 스테이징, 정제 및 리뷰가 완료되었습니다."
    });

  } catch (error) {
    console.error("[CSV_UPLOAD_API] Error processing upload: / 업로드 처리 중 오류 발생:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to process upload / 업로드 처리에 실패했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
