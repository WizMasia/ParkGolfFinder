"use client";

import React, { useState, useCallback } from "react";

/**
 * CSV Row Data structure parsed from client-side
 * 클라이언트 사이드에서 파싱된 CSV 행 데이터 구조
 */
type CSVRow = string[];

/**
 * Interface mapping CSV columns to DB columns
 * CSV 열을 데이터베이스 컬럼에 매핑하는 인터페이스
 */
interface ColumnMapping {
  nameColIndex: number;
  addressColIndex: number;
  phoneColIndex: number;
  operatorColIndex: number;
}

/**
 * Standard CSV Parser supporting quotes and comma escaping
 * 큰따옴표 및 쉼표 이스케이프를 완벽히 지원하는 표준 CSV 파서
 */
function parseCSV(text: string): CSVRow[] {
  const lines: CSVRow[] = [];
  let row: string[] = [""];
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      row.push("");
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

/**
 * Premium Admin Page for Uploading CSV golf course records.
 * 파크골프장 CSV 레코드 업로드를 위한 프리미엄 어드민 페이지
 */
export default function AdminUploadPage() {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    nameColIndex: -1,
    addressColIndex: -1,
    phoneColIndex: -1,
    operatorColIndex: -1,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "info" | null>(null);
  const [uploadResult, setUploadResult] = useState<{ runId: string; stagedCount: number } | null>(null);

  // File Drag & Drop Handlers
  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const processFile = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setStatusType("error");
      setStatusMessage("CSV 파일만 업로드할 수 있습니다.");
      return;
    }

    setFile(selectedFile);
    setStatusMessage(null);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setStatusType("error");
        setStatusMessage("파일 내용이 비어 있습니다.");
        return;
      }

      // First row assumed as Header
      // 첫 행을 헤더(Header) 목록으로 간주합니다
      const csvHeaders = parsed[0].map((h, index) => h.trim() || `열 ${index + 1}`);
      const csvRows = parsed.slice(1).filter((r) => r.some((cell) => cell.trim() !== ""));

      setHeaders(csvHeaders);
      setRows(csvRows);

      // Auto-matching heuristics
      // 이름, 주소, 연락처, 운영사 컬럼을 자동 감지 매핑합니다
      const matchedMapping: ColumnMapping = {
        nameColIndex: csvHeaders.findIndex((h) => h.includes("이름") || h.includes("시설명") || h.includes("체육시설")),
        addressColIndex: csvHeaders.findIndex((h) => h.includes("주소") || h.includes("소재지")),
        phoneColIndex: csvHeaders.findIndex((h) => h.includes("전화번호") || h.includes("연락처") || h.includes("문의")),
        operatorColIndex: csvHeaders.findIndex((h) => h.includes("운영") || h.includes("관리기관") || h.includes("소관")),
      };

      setMapping(matchedMapping);
    };

    reader.readAsText(selectedFile, "UTF-8");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  // Submit to Server Action API
  // 매핑 완료 후 서버 적재 개시 핸들러
  const handleUpload = async () => {
    if (!file || rows.length === 0) return;
    if (mapping.nameColIndex === -1 || mapping.addressColIndex === -1) {
      setStatusType("error");
      setStatusMessage("필수 필드인 '시설명(이름)'과 '주소' 열을 매핑해야 합니다.");
      return;
    }

    setLoading(true);
    setStatusType("info");
    setStatusMessage("데이터를 서버에 적재하고 분석 파이프라인(정제 및 중복 판정)을 수행 중입니다. 잠시만 기다려주세요...");

    try {
      // Build normalized upload records matching database schema
      // 매핑 설정에 따라 업로드할 데이터 객체를 조립합니다.
      const formattedRecords = rows.map((row) => ({
        name: row[mapping.nameColIndex]?.trim() || "",
        address: row[mapping.addressColIndex]?.trim() || "",
        phone: mapping.phoneColIndex !== -1 ? row[mapping.phoneColIndex]?.trim() || undefined : undefined,
        operatorName: mapping.operatorColIndex !== -1 ? row[mapping.operatorColIndex]?.trim() || undefined : undefined,
      })).filter((r) => r.name !== "" && r.address !== "");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: formattedRecords,
          filename: file.name,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Unknown staging error");
      }

      setUploadResult({
        runId: resData.runId,
        stagedCount: resData.stagedCount,
      });
      setStatusType("success");
      setStatusMessage(`성공적으로 적재 및 정제가 완료되었습니다! (총 ${resData.stagedCount}개 시설 Staged)`);
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage(err instanceof Error ? err.message : "서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-slate-100">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
          파크골프장 CSV 데이터 수집기
        </h1>
        <p className="mt-2 text-slate-400 text-sm md:text-base">
          수동 수집된 CSV 파일을 업로드하여 주소 정형화, 카카오 맵/행안부 지오코딩 및 자동 중복 검사를 진행합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: File Dropzone & Mapping Form */}
        {/* 좌측 패널: 드롭존 및 열 매핑 양식 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping"></span>
              CSV 파일 업로드
            </h2>

            {/* Drag & Drop Box */}
            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? "border-emerald-400 bg-emerald-950/20"
                  : file
                  ? "border-slate-700 bg-slate-850/40"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
              }`}
            >
              <input
                type="file"
                id="csv-file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <label htmlFor="csv-file" className="cursor-pointer block">
                <svg
                  className="mx-auto h-12 w-12 text-slate-500 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {file ? (
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm truncate">{file.name}</p>
                    <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB ({rows.length}개 행 감지)</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 font-medium text-sm">드래그 앤 드롭하거나 클릭하여 선택</p>
                    <p className="text-slate-500 text-xs mt-1">지원 형식: UTF-8 인코딩 .csv</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Column Mapping Selector */}
          {/* 컬럼 매핑 선택기 */}
          {headers.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
              <h2 className="text-lg font-bold mb-4 flex items-center">
                열 매핑 설정
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    시설명 (필수)
                  </label>
                  <select
                    value={mapping.nameColIndex}
                    onChange={(e) => setMapping({ ...mapping, nameColIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                    disabled={loading}
                  >
                    <option value={-1}>-- 선택해주세요 --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    소재지 주소 (필수)
                  </label>
                  <select
                    value={mapping.addressColIndex}
                    onChange={(e) => setMapping({ ...mapping, addressColIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                    disabled={loading}
                  >
                    <option value={-1}>-- 선택해주세요 --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    전화번호 / 연락처 (선택)
                  </label>
                  <select
                    value={mapping.phoneColIndex}
                    onChange={(e) => setMapping({ ...mapping, phoneColIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                    disabled={loading}
                  >
                    <option value={-1}>-- 사용하지 않음 --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    운영사 / 관리주체 (선택)
                  </label>
                  <select
                    value={mapping.operatorColIndex}
                    onChange={(e) => setMapping({ ...mapping, operatorColIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                    disabled={loading}
                  >
                    <option value={-1}>-- 사용하지 않음 --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading || rows.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl mt-6 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-center"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    "스테이징 데이터 적재 개시"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right pane: CSV Data Preview */}
        {/* 우측 패널: CSV 데이터 미리보기 및 상태 피드백 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          {/* 상태 알림창 */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border text-sm flex items-start space-x-3 transition-all duration-300 ${
                statusType === "success"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : statusType === "error"
                  ? "bg-red-950/40 border-red-900/50 text-red-300"
                  : "bg-slate-900/70 border-slate-800 text-slate-300"
              }`}
            >
              {statusType === "success" && (
                <svg className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === "error" && (
                <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === "info" && (
                <svg className="h-5 w-5 text-teal-400 shrink-0 mt-0.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-semibold">{statusType === "success" ? "성공" : statusType === "error" ? "오류" : "상태 정보"}</p>
                <p className="mt-1 text-xs opacity-90 leading-relaxed whitespace-pre-wrap">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* Upload Result Details */}
          {/* 수집 완료 상세 결과 */}
          {uploadResult && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
                <svg className="h-5 w-5 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                데이터 적재 검증 결과
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-slate-500 text-xs">수집 Run ID</span>
                  <span className="block font-mono text-xs mt-1 text-slate-300 truncate">{uploadResult.runId}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-slate-500 text-xs">적재 성공 레코드</span>
                  <span className="block font-bold text-lg mt-0.5 text-emerald-400">{uploadResult.stagedCount}개</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 col-span-2 md:col-span-1">
                  <span className="block text-slate-500 text-xs">다음 절차</span>
                  <span className="block text-xs mt-1 text-slate-400">어드민 리뷰 승급 페이지에서 중복 체크 후 반영</span>
                </div>
              </div>
            </div>
          )}

          {/* Table Preview */}
          {/* 테이블 데이터 미리보기 */}
          {rows.length > 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-200">데이터 미리보기</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                  총 {rows.length}개 중 상위 10개 행 표시
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-800/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <th className="px-4 py-3 font-semibold border-r border-slate-800">시설명</th>
                      <th className="px-4 py-3 font-semibold border-r border-slate-800">주소</th>
                      <th className="px-4 py-3 font-semibold border-r border-slate-800">전화번호</th>
                      <th className="px-4 py-3 font-semibold">운영기관</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/20">
                    {rows.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-800/30 transition-colors">
                        <td className={`px-4 py-3 border-r border-slate-800 ${mapping.nameColIndex !== -1 ? "text-emerald-300 font-medium" : "text-slate-500"}`}>
                          {mapping.nameColIndex !== -1 ? row[mapping.nameColIndex] || "-" : "미지정"}
                        </td>
                        <td className={`px-4 py-3 border-r border-slate-800 ${mapping.addressColIndex !== -1 ? "text-slate-300" : "text-slate-500"}`}>
                          {mapping.addressColIndex !== -1 ? row[mapping.addressColIndex] || "-" : "미지정"}
                        </td>
                        <td className={`px-4 py-3 border-r border-slate-800 ${mapping.phoneColIndex !== -1 ? "text-slate-300" : "text-slate-500"}`}>
                          {mapping.phoneColIndex !== -1 ? row[mapping.phoneColIndex] || "-" : "미지정"}
                        </td>
                        <td className={`px-4 py-3 ${mapping.operatorColIndex !== -1 ? "text-slate-300" : "text-slate-500"}`}>
                          {mapping.operatorColIndex !== -1 ? row[mapping.operatorColIndex] || "-" : "미지정"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl p-16 text-center text-slate-500 shadow-inner">
              <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">데이터가 없습니다.</p>
              <p className="text-xs text-slate-600 mt-1">파일을 드롭하면 여기에 실시간 미리보기가 노출됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
