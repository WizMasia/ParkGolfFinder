# 파크골프장 수집 봇 및 웹앱 데이터 기능 고도화 설계 (Crawler & Web App Data Feature Upgrade Spec)

본 설계 문서는 다중 공공데이터포털 REST API 연동, 주소 정보 표준화, 카카오 로컬 API 기반 전국 순회 크롤러 및 지오코딩, 중복 분석, 그리고 어드민용 CSV 업로드 기능의 설계 명세를 정의합니다.
This design document specifies the integration of multi-region public portal APIs, Juso address standardization, Kakao Local API geocoding and Si/Gun/Gu crawler, deduplication clusters, and the admin CSV upload page.

---

## 1. 수집 소스 통합 설정 (Integrated Portal Config)

다양한 공공 데이터 API들을 동적으로 수집하고 매핑할 수 있도록 `PortalDatasetConfig` 구조를 정의하고 설정값들을 관리합니다.

### 1.1 데이터 구조 정의 (Data Structures)
`apps/bot/src/sources/public-portal.ts`에 다음 타입들을 선언합니다.

```typescript
export interface PortalFieldMapping {
  name: string;              // 시설명 필드 (e.g. "시설명", "시 설 명")
  address: string;           // 주소 필드
  addressFallback?: string;  // 대체 지번 주소 필드
  operator?: string;         // 운영기관 필드
  phone?: string;            // 연락처 필드
  holes?: string;            // 홀수 필드
  size?: string;             // 규모/면적 필드
  lat?: string;              // 위도
  lng?: string;              // 경도
  sportsItem?: string;       // 가능 종목 필드 (Gyeonggi 전용)
}

export interface PortalDatasetConfig {
  name: string;
  url: string;
  endpoint: string;
  authKeyEnvVar?: string;    // 환경변수에서 키를 읽을 경우 사용
  defaultAuthKey?: string;   // 기본 인증키 값
  isCustomOpenApi?: boolean; // 공공데이터포털 Infuser 규격 외 API 여부
  fields: PortalFieldMapping;
}
```

### 1.2 수집 대상 API 설정 데이터 (PORTAL_DATASETS)
```typescript
export const PORTAL_DATASETS: PortalDatasetConfig[] = [
  {
    name: "seoul",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15113672/v1/uddi:79165a17-96e3-4d4e-9c5e-bec481767aa2",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시 설 명",
      address: "위 치",
      operator: "운영기관",
      holes: "홀수",
      size: "규 모"
    }
  },
  {
    name: "jeonbuk",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142226/v1/uddi:93a1de58-077c-4ffd-914b-b332c0def7f2",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "주소",
      operator: "시군",
      holes: "홀수",
      size: "면적(제곱미터)"
    }
  },
  {
    name: "jeonnam",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142153/v1/uddi:bfe56e8f-eee8-42b0-8435-dffc5117193f",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "파크골프장명",
      address: "주소",
      operator: "시군",
      holes: "홀수"
    }
  },
  {
    name: "gangwon",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142244/v1/uddi:700466fe-de6e-4a3b-8942-c9eed632d674",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "주소",
      phone: "연락처",
      holes: "홀 수",
      size: "규모(미터제곱)"
    }
  },
  {
    name: "gwangju",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142311/v1/uddi:3818ba97-807d-49c0-aa48-f06e0cf70647",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "위치",
      operator: "운영기관",
      phone: "연락처",
      holes: "홀수",
      size: "규모"
    }
  },
  {
    name: "gyeongbuk",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142265/v1/uddi:9a0a5066-7e1b-49b4-aa31-d3ffd94c8d9b",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "파크골프장명",
      address: "주소",
      operator: "운영기관",
      holes: "홀수"
    }
  },
  {
    name: "incheon",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142271/v1/uddi:d6406955-4d77-4920-b86b-d98e5c25e1d9",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "위치",
      operator: "운영기관",
      phone: "연락처",
      holes: "홀수",
      size: "규모"
    }
  },
  {
    name: "sejong",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142438/v1/uddi:3201ce12-2429-4fdd-ac85-e3d258ee7e31",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "주소",
      operator: "운영기관",
      phone: "연락처",
      holes: "홀수",
      size: "규모(제곱미터)"
    }
  },
  {
    name: "daegu",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15142224/v1/uddi:687af8b6-4bde-4830-8b6f-95625e9e5849",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "파크골프장명",
      address: "파크골프장 주소",
      operator: "운영기관",
      phone: "연락처",
      holes: "파크골프장 홀수",
      size: "파크골프장 규모(제곱미터)"
    }
  },
  {
    name: "gyeongnam-geochang",
    url: "https://api.odcloud.kr/api",
    endpoint: "/15113377/v1/uddi:3b4dbccc-7a72-468f-80bb-f92d85c2784f",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    fields: {
      name: "시설명",
      address: "소재지도로명주소",
      addressFallback: "소재지지번주소",
      operator: "관리기관",
      phone: "전화번호",
      holes: "규모(홀)",
      size: "면적(제곱미터)",
      lat: "위도",
      lng: "경도"
    }
  },
  {
    name: "gyeonggi-dream",
    url: "https://openapi.gg.go.kr",
    endpoint: "/PublicLivelihood",
    authKeyEnvVar: "GG_DREAM_API_KEY",
    defaultAuthKey: "sample",
    isCustomOpenApi: true,
    fields: {
      name: "FACLT_NM",
      address: "REFINE_ROADNM_ADDR",
      addressFallback: "REFINE_LOTNO_ADDR",
      operator: "MANAGE_MAINBD_NM",
      phone: "CONTCT_NO",
      lat: "REFINE_WGS84_LAT",
      lng: "REFINE_WGS84_LOGT",
      sportsItem: "GYM_POSBL_ITEM_CONT"
    }
  },
  {
    name: "eshare-portal",
    url: "https://www.eshare.go.kr",
    endpoint: "/eshare-openapi/rsrc/list/010500",
    authKeyEnvVar: "ESHARE_API_KEY",
    defaultAuthKey: "ee151322ffd13fe9af05130b433b9140",
    isCustomOpenApi: true,
    fields: {
      name: "rsrcNm",
      address: "addr",
      lat: "lat",
      lng: "lot"
    }
  },
  {
    name: "registered-sports",
    url: "https://apis.data.go.kr",
    endpoint: "/1741000/registered_sports_facilities/info",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    isCustomOpenApi: true,
    fields: {
      name: "FACLT_NM",
      address: "REFINE_ROADNM_ADDR",
      lat: "REFINE_WGS84_LAT",
      lng: "REFINE_WGS84_LOGT"
    }
  },
  {
    name: "comprehensive-sports",
    url: "https://apis.data.go.kr",
    endpoint: "/1741000/comprehensive_sports_facilities/info",
    defaultAuthKey: "02b2b602921841ca7c3e6e10f25f9235dea5f0a62424c1ea90ba36664127f7f1",
    isCustomOpenApi: true,
    fields: {
      name: "FACLT_NM",
      address: "REFINE_ROADNM_ADDR",
      lat: "REFINE_WGS84_LAT",
      lng: "REFINE_WGS84_LOGT"
    }
  }
];
```

---

## 2. 주소 정제 및 좌표 지오코딩 연동 (Standardization & Geocoding)

수집된 레코드의 정제 및 위치 기반 처리를 위해 행정안전부 도로명주소 API와 카카오 로컬 API를 통합 연동합니다.

### 2.1 도로명주소 검색 API를 활용한 주소 정제 (Juso Standardization)
*   **목적:** 지자체 원시 데이터 주소의 표기법 차이를 통일하고, 행정구역(`siNm`, `sggNm`)을 안정적으로 파싱합니다.
*   **연동 파일:** `apps/bot/src/classification/normalize-address.ts`
*   **동작 흐름:**
    1.  환경변수 `JUSO_CONFIRM_KEY`를 확인합니다. key가 존재하면 `https://business.juso.go.kr/addrlink/addrLinkApi.do`를 호출합니다.
    2.  검색 결과가 존재할 시, 표준화된 도로명주소(`roadAddrPart1`), 시도명(`siNm`), 시군구명(`sggNm`)을 반환받아 사용합니다.
    3.  네트워크 에러 또는 검색 실패 시, 기존 정규식 파서(`parseAddressRegion`)를 Fallback으로 구동합니다.

### 2.2 카카오 로컬 API 지오코더 & Fallback (Geocoding Fallback)
*   **연동 파일:** `apps/bot/src/classification/geocoder.ts`
*   **동작 흐름:**
    1.  데이터 소스가 위경도 값을 이미 가지고 있다면 그 값을 우선 차용합니다.
    2.  좌표가 누락된 경우 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`를 사용하여 카카오 로컬 주소 검색 API (`/v2/local/search/address.json`)를 통해 좌표를 조회합니다.
    3.  API 키 누락 또는 호출 에러 발생 시, 정제된 광역자치단체(`province`) 값을 기준으로 **도청/시청 소재지 대표 좌표**를 정적으로 설정한 Fallback 사전(Dictionary)을 조회하여 매핑합니다.

---

## 3. 카카오맵 전국 시군구 순회 크롤러 (Kakao Si/Gun/Gu Crawler)

카카오 로컬 API를 활용하여 전국 220여 개 기초자치단체(시/군/구)별 파크골프장을 누수 없이 전수 탐색합니다.

### 3.1 연동 파일 및 파라미터
*   **파일:** `apps/bot/src/sources/kakao.ts`
*   **순회 키워드 목록:** 대한민국 229개 시군구 명칭 (예: `"강원특별자치도 원주시"`, `"서울특별시 송파구"`)
*   **호출 제한(Throttling):** 과도한 트래픽으로 인한 차단을 방지하기 위해 시군구 루프마다 **100ms**의 `delay`를 적용합니다.
*   **API 미설정 처리:** API 키가 공란일 경우 크롤러 단계를 건너뛰고 오류 로그 대신 경고 로그를 발생시킵니다.

---

## 4. 중복 정합성 처리 및 파크골프 필터링 (Deduplication & Classification)

데이터 중복 유입 및 골프 종목 교차 혼선을 배제하는 비즈니스 규칙입니다.

### 4.1 중복 클러스터링 (`Exact` & `Probable`)
*   `exact` (완전 일치): 동일 원천 내 contentHash(이름/주소 기준) 또는 동일 주소 표준값이 있는 경우 1개만 승급 대상 설정.
*   `probable` (유사 일치): 다른 원천 간 표준화 주소(`roadAddrPart1`)가 완벽하게 일치하거나 위경도 좌표가 **100m 이내**에 인접하면서 시설명이 유사한 경우 중복 클러스터(`StagingDuplicateCluster`)로 병합.
*   **대표(Canonical) 선정 규칙:** `지자체 공식 API > 공유누리 > 일반 카카오 API 검색` 순으로 정보의 신뢰도에 가중치를 주어 대표 레코드를 선정함.

### 4.2 엄격한 파크골프 검증 (Screening)
*   **체육시설 필터:** 경기도 생활체육시설 API 등 종합 체육시설 API의 경우 종목명 필드(`sportsItem` 등)에 `"파크골프"`가 명시되어 있거나 시설명에 `"파크골프"`가 있는 경우에만 수집 대상으로 선정.
*   **일반 골프장 제외:** 이름 또는 원문에 `"스크린"`, `"연습장"`, `"인도어"`, `"아카데미"`, `"골프클럽"`(파크골프 명시가 없는 경우) 등이 혼용된 경우 기계적으로 제외(`hidden` 판정).

---

## 5. 어드민 CSV 드래그 앤 드롭 업로드 (`apps/web`)

변칙적인 원시 엑셀 파일을 Next.js 상에서 수동으로 정리하여 DB에 유입시키는 화면 및 API 기능입니다.

### 5.1 어드민 페이지 및 파일 파서 (Admin UI & PapaParse)
*   **페이지 경로:** `apps/web/app/admin/upload/page.tsx`
*   **테마:** 반응형 다크 모드 및 유리모피즘 디자인의 파일 업로드 컨테이너.
*   **CSV 파서:** 클라이언트단에서 `PapaParse` 라이브러리를 사용해 CSV 데이터를 파싱하고 미리보기 그리드를 노출합니다.
*   **매핑 마법사:** 헤더 행이 일치하지 않을 때 관리자가 각 열을 `시설명`, `주소`, `연락처`, `홀수`, `규모` 필드와 매핑할 수 있도록 선택창(Select)을 구성합니다.

### 5.2 어드민 업로드 API 엔드포인트
*   **API 경로:** `apps/web/app/api/admin/upload/route.ts`
*   **동작:** 파싱된 JSON 데이터를 전송받아 `StagingFacilityRecord`에 적재 후, 봇 파이프라인의 `normalize` -> `review` -> `promote` 단계를 내부 호출하여 프로덕션 테이블로 자동 반영하거나, 즉시 반영할 수 있는 옵션 선택 기능을 제공합니다.
