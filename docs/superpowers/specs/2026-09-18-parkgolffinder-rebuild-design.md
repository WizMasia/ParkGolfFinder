# ParkGolfFinder 재구축 설계 명세서 (Rebuild Architecture & Design Spec)

- **작성일자:** 2026-09-18
- **대상 브랜치:** `codex/rebuild-core`
- **관련 아카이브:** `archive-v1-legacy`
- **문서 상태:** 확정 (Approved by User)

---

## 1. 개요 및 목적 (Executive Summary)

ParkGolfFinder는 전국의 파크골프장 정보를 정확하게 수집하고, 시니어 사용자가 모바일 환경에서 가장 쉽고 명확하게 이용할 수 있도록 제공하는 파크골프 시설 정보 서비스입니다.

기존 v1 시스템에서 발생했던 **외부 크롤러 불안정성, 노이즈 데이터(스크린골프/일반 골프연습장 혼입), 데이터 중복 문제**를 해결하기 위해 다음과 같은 원칙으로 전면 재구축합니다:
1. **정확도 우선 수집 (Quality over Quantity)**: 
   - 1단계: 대한파크골프협회 공인 및 지자체 공공 실외 정규 파크골프장(9홀 이상) 중심 수집.
   - 스크린골프, 일반 골프연습장, 골프클럽(CC)은 원천 배제.
2. **시니어 친화적 UI/UX (Senior-Friendly Mobile Web)**:
   - 큰 글씨(기본 본문 17~19px 이상), 높은 명도 대비, 복잡한 뎁스 없는 단순 카드 구조.
   - 목록/지도 토글 지원, 상세 페이지는 외부 링크 대신 텍스트/표 중심의 명확한 예약·요금 안내.
3. **안정적인 데이터 분리 (Staging & Production)**:
   - 검증되지 않은 원천 데이터는 서비스 테이블에 직접 적재하지 않고, Staging을 거쳐 100% 검증(`confirmed`)된 데이터만 승격.

---

## 2. 타깃 사용자 및 UI/UX 명세 (Senior-Friendly UX)

### 2.1 디자인 시스템 가이드라인
- **타이포그래피**:
  - 기본 본문: 최소 17px~19px (가독성 높은 Pretendard/시스템 Sans-serif)
  - 강조 수치/타이틀: 20px~26px Bold
  - 버튼/뱃지 텍스트: 최소 16px 이상
  - 자간은 0 유지, 과도한 영문/약어 배제하고 명확한 순화 한글 사용
- **컬러 및 시인성**:
  - Primary: 딥 그린 (`#0F766E` / Tailwind `teal-700`) — 잔디와 신뢰감을 주는 시각 톤
  - 배경: 순백색 및 고대비 연회색 (`#FFFFFF`, `#F8FAFC`)
  - 텍스트: 고대비 흑색 계열 (`#0F172A`, `#1E293B`)
  - 보조 텍스트: 흐린 회색 지양, 시니어 가독성을 위해 최소 `#475569` 이상 유지
- **터치 영역 및 조작계**:
  - 모든 클릭/터치 타깃 최소 48px 이상 확보
  - 복잡한 햄버거 메뉴나 깊은 모달 구조 배제

### 2.2 메인 화면 (Home / List & Map Toggle)
1. **상단 네비게이션 & 권역 탭**:
   - 서비스 타이틀: **파크골프파인더**
   - 광역 권역 탭: **[전체] [수도권] [강원] [충청] [호남] [영남] [제주]**
2. **거리 및 정렬 제어바**:
   - 내 위치 기반 버튼 (위치 권한 획득 시 5km, 10km, 20km, 전체 거리 슬라이더/버튼)
   - 위치 미허용 시 '서울시청' 기본 기준점 및 권역 탭 기준 탐색
3. **보기 모드 전환 (View Toggle)**:
   - **[📋 목록으로 보기]** / **[🗺️ 지도로 모아보기]** 세그먼트 토글
4. **목록 화면 (List View)**:
   - 시설 카드 필수 노출 항목:
     - 시설명 (큰 글씨 볼드)
     - 현재 위치로부터의 거리 (예: `2.4 km`)
     - 코스 규모 (예: `18홀`, `36홀`)
     - 이용료 요약 (예: `무료`, `관내 2,000원 / 관외 5,000원`)
     - 기본 주소 (시/군/구 동까지 간결하게)
   - 목록 정렬: 거리순(가장 가까운 곳 우선), 거리 미확인 시 시설명순
5. **지도 화면 (Map View)**:
   - 카카오 지도 SDK 연동 (다중 마커 표시)
   - 마커 터치 시 하단에 간결한 시설 요약 카드 슬라이드 노출
   - 카드 터치 시 해당 시설 상세 페이지로 이동

### 2.3 상세 화면 (Detail View - Information First)
- 외부 앱 전환이나 불필요한 링크 아웃을 지양하고, **화면 안에서 모든 정보를 완결**하는 형태:
1. **헤더 요약**: 시설명, 코스 규모(홀수), 대표 연락처, 기본 도로명 주소
2. **예약 안내 표 (핵심)**:
   - 예약 방식: 전화 예약 / 인터넷(선착순) / 인터넷(추첨) / 당일 현장 선착순 / 예약 불필요
   - 접수 일정 및 방법 상세 설명
   - 관내 주민 우선 배정 여부 및 예약 팁
3. **이용 요금 및 우대 혜택 표**:
   - 일반 요금 (관내/관외 구분)
   - 경로우대(만 65세 이상) 감면 혜택 (예: 50% 할인, 무료 등)
   - 장애인/국가유공자 감면 조건
4. **시설 및 코스 정보**:
   - 홀수, 부대시설(휴게실, 주차장, 에어건, 화장실 등)
   - 정기 휴장일 (예: 매주 월요일 잔디 보호 휴장)
5. **위치 안내 지도**:
   - 해당 파크골프장 위치를 명확히 보여주는 보조 카카오 지도

---

## 3. 데이터 수집 봇 아키텍처 (Data Sourcing & Crawler)

### 3.1 수집 대상 및 단계적 범위
- **Phase 1 (우선 구현)**:
  - 전국 **실외 정규 파크골프장** (잔디 코스, 9홀 이상)
  - 지자체 공공체육시설 및 대한파크골프협회 공인 구장 위주
- **Phase 2 (향후 확장)**:
  - 실내/스크린 파크골프장 (단, 별도 `indoor` 플래그 및 필터로 실외 구장과 완전 분리)

### 3.2 노이즈 필터링 규칙 (Blacklist)
- 아래 단어가 포함된 곳은 자동 수집 단계에서 즉시 탈락 또는 `hidden` 처리:
  - `스크린골프`, `골프존`, `프렌즈스크린`, `SG골프`, `골프연습장`, `실내골프`, `골프클럽(CC)`, `드라이빙레인지`
- 시설명에 단순히 '파크'나 '골프'가 포함되어 있더라도, **파크골프장 전용 시설 명시**가 없는 일반 골프장은 원천 배제.

### 3.3 수집 소스 계층 구조
1. **1차 기준 소스 (Source of Truth)**:
   - **문체부 공공체육시설 (파크골프) API** 및 **공공데이터포털 전국 체육시설 데이터**
   - **대한파크골프협회(KPGA) 전국 공인/인증 구장 목록**
2. **2차 주소 정밀화 및 지오코딩**:
   - **카카오 로컬 키워드/주소 검색 REST API**: 도로명 주소, WGS84 좌표(위도/경도), 전화번호 확충
3. **3차 예약/요금 메타데이터 매핑**:
   - 서울시 공공서비스예약, 경기공유서비스 등 지자체 통합 예약 포털의 파크골프장 예약 안내문 구조화

### 3.4 Staging 파이프라인
```txt
[원천 API / 지자체 데이터]
       │
       ▼ (1. Fetch)
[StagingFacility 테이블 적재]
       │
       ▼ (2. Normalize)
[주소 정규화 (시도/시군구/권역) & 명칭 전처리]
       │
       ▼ (3. Review)
[중복 검사 (이름+좌표 클러스터링) & 파크골프 적격 판정]
   ├── Confirmed (검증 완료된 실외 정규 구장)
   ├── Candidate (정보 부족, 수동 확인 필요)
   └── Hidden    (노이즈, 중복, 폐장 구장)
       │
       ▼ (4. Promote)
[본 서비스 테이블 (Facility / Pricing / Reservation) 반영]
```

---

## 4. 데이터베이스 스키마 설계 (Database Schema)

### 4.1 본 서비스 테이블 (Production Tables)
```prisma
// 시설 기본 정보
model Facility {
  id           String   @id @default(cuid())
  name         String
  address      String   // 전체 도로명/지번 주소
  province     String   // 시/도 (예: 서울특별시, 경기도)
  district     String   // 시/군/구 (예: 송파구, 양평군)
  regionKey    String   // 권역 키 (capital, gangwon, chungcheong, honam, yeongnam, jeju)
  holes        Int      @default(18) // 홀수 (9, 18, 27, 36 등)
  facilityType String   @default("outdoor") // outdoor, indoor
  status       String   @default("active")  // active, hidden
  ownership    String   @default("public")  // public(공공), private(민간)
  operatorName String?  // 운영/관리 주체 (예: 송파구 시설관리공단)
  phone        String?  // 대표 전화번호
  lat          Float    // 위도 (WGS84)
  lng          Float    // 경도 (WGS84)
  closedDays   String?  // 휴장일 안내 (예: 매주 월요일)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  pricing      FacilityPricing?
  reservation  ReservationInfo?
}

// 요금 정보
model FacilityPricing {
  id                 String   @id @default(cuid())
  facilityId         String   @unique
  facility           Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  isFree             Boolean  @default(false)
  residentFeeText    String?  // 관내 주민 요금 (예: "2,000원")
  nonResidentFeeText String?  // 관외 주민 요금 (예: "5,000원")
  seniorDiscountText String?  // 경로우대 안내 (예: "만 65세 이상 50% 할인")
  notes              String?  // 기타 감면 혜택 (유공자, 장애인 등)
  updatedAt          DateTime @updatedAt
}

// 예약 정보 종합
model ReservationInfo {
  id               String              @id @default(cuid())
  facilityId       String              @unique
  facility         Facility            @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  summary          String              // 한 줄 요약 (예: "인터넷 사전 예약 필수 (관내 주민 우선)")
  ruleDetails      String              // 전체 예약 규칙 및 절차 안내
  openSchedule     String?             // 예약 오픈 일정 (예: "매월 25일 오전 9시 익월분 오픈")
  notice           String?             // 이용 유의사항
  methods          ReservationMethod[]
  updatedAt        DateTime            @updatedAt
}

// 개별 예약 방식
model ReservationMethod {
  id                String          @id @default(cuid())
  reservationInfoId String
  reservationInfo   ReservationInfo @relation(fields: [reservationInfoId], references: [id], onDelete: Cascade)
  methodType        String          // phone, internet_first_come, internet_lottery, visit, none
  methodName        String          // 표시 문구 (예: "전화 예약", "인터넷 선착순")
  description       String?         // 세부 설명
  priority          Int             @default(1)
}
```

---

## 5. 필요한 외부 API 키 및 계정 리스트 (Required API Keys)

구현 및 운영을 위해 필요한 API 키 목록입니다. 준비가 되는 대로 환경 변수(`.env`)에 세팅하여 사용합니다:

1. **카카오 개발자 센터 (Kakao Developers)**
   - 필요 키 1: **REST API 키** (수집 봇의 주소 검색, 지오코딩, 키워드 검색용)
   - 필요 키 2: **JavaScript 키** (웹앱 프론트엔드 카카오 지도 렌더링용)
   - 플랫폼 등록: 웹 플랫폼 도메인(`http://localhost:3000`, 배포 도메인) 등록 필요
2. **공공데이터포털 (data.go.kr)**
   - 필요 키: **일반 인증키 (Decoding/Encoding API Key)**
   - 필요 활용신청 API:
     - 문화체육관광부 - 전국 공공체육시설 현황 (파크골프)
     - 행정안전부 - 도로명주소 개발자센터 (선택: 주소 정제용)
3. **데이터베이스 (PostgreSQL)**
   - `DATABASE_URL` (기존 설정된 DB 계속 사용 가능)

---

## 6. 구현 마일스톤 및 단계별 계획

- **Step 1**: 저장소 아카이브 확인 및 작업 트리 클린업
- **Step 2**: 공통 패키지(`packages/shared`, `packages/db`) Prisma 스키마 재구성 및 마이그레이션
- **Step 3**: 1단계 실외 정규 구장 중심의 수집 봇(`apps/bot`) 정제 파이프라인 구현
- **Step 4**: 시니어 최적화 모바일 웹앱(`apps/web`) 구현 (목록/지도 토글, 권역 탭, 상세 정보 안내)
- **Step 5**: 검증 및 E2E 테스트

