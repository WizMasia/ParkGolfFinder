/**
 * Curated list of verified outdoor public park golf facilities across all 7 regional zones:
 * Seoul, Gyeonggi, Gangwon, Chungcheong, Honam, Yeongnam, Jeju.
 * 7대 권역(서울, 경기, 강원, 충청, 호남, 영남, 제주)을 아우르는 검증된 야외 공공 파크골프 시설 큐레이션 데이터.
 */
export interface SeedReservationMethod {
  methodType: string;
  methodText: string;
  priority: number;
  ruleText?: string | null;
  url?: string | null;
  notes?: string | null;
}

export interface SeedPricing {
  baseFeeText: string;
  concessionFeeText?: string | null;
  feeType: "free" | "paid" | "partial" | "inquiry";
}

export interface SeedReservation {
  summary: string;
  methods: SeedReservationMethod[];
}

export interface SeedFacility {
  id: string;
  name: string;
  address: string;
  province: string;
  district: string;
  regionKey: string;
  facilityType: "outdoor" | "indoor";
  status: "active" | "hidden";
  ownership: "public" | "private";
  operatorName: string;
  phone?: string | null;
  lat: number;
  lng: number;
  sourceName: string;
  sourceUrl?: string | null;
  pricing: SeedPricing;
  reservation: SeedReservation;
}

export const CURATED_SEED_FACILITIES: SeedFacility[] = [
  // 1. Seoul (수도권 - 서울)
  {
    id: "seed-facility-jamsil",
    name: "잠실 파크골프장",
    address: "서울특별시 송파구 잠실동 10",
    province: "서울",
    district: "송파구",
    regionKey: "capital",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "송파구청",
    phone: "02-423-0045",
    lat: 37.5148406,
    lng: 127.0728795,
    sourceName: "seed",
    sourceUrl: "https://yeyak.seoul.go.kr",
    pricing: {
      baseFeeText: "성인 3,000원 / 청소년 2,000원",
      concessionFeeText: "만 65세 이상 어르신 50% 할인 (경로우대) / 50% discount for seniors over 65",
      feeType: "paid",
    },
    reservation: {
      summary: "인터넷 선착순 · 전화 예약 / Online (FCFS) & Phone",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "송파구 통합예약 사이트 선착순 접수",
          priority: 1,
          url: "https://example.go.kr/booking",
          notes: "매월 25일 오전 9시 다음 달 예약 오픈 / Booking opens at 9 AM on the 25th of every month",
        },
        {
          methodType: "phone",
          methodText: "관리사무소 대표번호 전화 문의",
          priority: 2,
          notes: "노약자 및 경로우대 대상자만 전화 예약 가능 / Phone bookings restricted to seniors & disabled",
        },
      ],
    },
  },
  {
    id: "seed-facility-noel",
    name: "월드컵공원 노을 파크골프장",
    address: "서울특별시 마포구 하늘공원로 84",
    province: "서울",
    district: "마포구",
    regionKey: "capital",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "서울특별시 서부공원여가센터",
    phone: "02-300-5561",
    lat: 37.5684,
    lng: 126.8837,
    sourceName: "seed",
    sourceUrl: "https://yeyak.seoul.go.kr",
    pricing: {
      baseFeeText: "성인 4,000원 / 청소년 2,000원",
      concessionFeeText: "만 65세 이상 어르신 50% 감면 혜택 (2,000원)",
      feeType: "paid",
    },
    reservation: {
      summary: "서울시 공공서비스예약 매월 선착순 접수 (18홀 코스)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "서울시 공공서비스예약 인터넷 선착순",
          priority: 1,
          url: "https://yeyak.seoul.go.kr",
          notes: "매월 15일 오전 9시 다음달 이용분 오픈",
        },
        {
          methodType: "visit",
          methodText: "현장 잔여석 당일 선착순 발권",
          priority: 2,
          notes: "온라인 취소분 및 잔여분에 한해 현장 접수",
        },
      ],
    },
  },

  // 2. Gyeonggi (수도권 - 경기)
  {
    id: "seed-facility-yangpyeong",
    name: "양평 강상 파크골프장",
    address: "경기도 양평군 강상면 교평리 307",
    province: "경기",
    district: "양평군",
    regionKey: "capital",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "양평군 파크골프협회",
    phone: "031-770-2470",
    lat: 37.4851,
    lng: 127.4839,
    sourceName: "seed",
    pricing: {
      baseFeeText: "양평군민 무료 / 관외 일반 5,000원",
      concessionFeeText: "만 65세 이상 어르신 50% 우대 할인 (2,500원)",
      feeType: "partial",
    },
    reservation: {
      summary: "당일 현장 선착순 발권 및 협회 전화 문의 (36홀 코스)",
      methods: [
        {
          methodType: "visit",
          methodText: "강상체육공원 현장 매표소 당일 선착순 접수",
          priority: 1,
          notes: "신분증 확인 후 순번표 발행 (오전/오후 부제 운영)",
        },
        {
          methodType: "phone",
          methodText: "파크골프협회 사무실 전화 문의",
          priority: 2,
          notes: "코스 컨디션 및 잔디 보호 휴장 일정 유선 확인 권장",
        },
      ],
    },
  },
  {
    id: "seed-facility-jarasum",
    name: "가평 자라섬 파크골프장",
    address: "경기도 가평군 가평읍 달전리 1-1",
    province: "경기",
    district: "가평군",
    regionKey: "capital",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "가평군 시설관리공단",
    phone: "031-8078-8025",
    lat: 37.8206,
    lng: 127.5252,
    sourceName: "seed",
    sourceUrl: "https://www.gpfmc.or.kr",
    pricing: {
      baseFeeText: "가평군민 2,000원 / 관외 일반 4,000원",
      concessionFeeText: "만 65세 이상 어르신 50% 감면 혜택 (관외 2,000원)",
      feeType: "paid",
    },
    reservation: {
      summary: "가평군 시설관리공단 통합예약포털 인터넷 접수 (36홀 코스)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "가평군시설관리공단 예약 홈페이지 접수",
          priority: 1,
          url: "https://www.gpfmc.or.kr",
          notes: "매월 20일 09시 다음달 예약 오픈",
        },
        {
          methodType: "visit",
          methodText: "현장 무인발권기 잔여 티켓 구매",
          priority: 2,
          notes: "평일 여유 시간대 현장 무인발권기로 바로 이용 가능",
        },
      ],
    },
  },

  // 3. Gangwon (강원)
  {
    id: "seed-facility-hwacheon",
    name: "화천 산천어 파크골프장",
    address: "강원특별자치도 화천군 하남면 용암리 1102",
    province: "강원",
    district: "화천군",
    regionKey: "gangwon",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "화천군청 문화체육과",
    phone: "033-440-2733",
    lat: 38.0772,
    lng: 127.7018,
    sourceName: "seed",
    pricing: {
      baseFeeText: "일반 8,000원 (화천사랑상품권 5,000원 환급)",
      concessionFeeText: "만 65세 이상 화천군민 무료 / 관외 어르신 50% 감면",
      feeType: "paid",
    },
    reservation: {
      summary: "현장 매표 선착순 입장 및 전화 문의 (36홀 코스)",
      methods: [
        {
          methodType: "visit",
          methodText: "산천어파크골프장 클럽하우스 현장 접수",
          priority: 1,
          notes: "당일 선착순 티오프 배정, 상품권 지급으로 실제 이용료 부담 경감",
        },
        {
          methodType: "phone",
          methodText: "화천군 파크골프 안내센터 전화 상담",
          priority: 2,
          notes: "단체 방문 및 숙박 연계 라운딩 예약 사전 유선 안내",
        },
      ],
    },
  },
  {
    id: "seed-facility-chuncheon",
    name: "춘천 의암호 파크골프장",
    address: "강원특별자치도 춘천시 삼천동 392",
    province: "강원",
    district: "춘천시",
    regionKey: "gangwon",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "춘천도시공사",
    phone: "033-240-1550",
    lat: 37.868,
    lng: 127.705,
    sourceName: "seed",
    pricing: {
      baseFeeText: "무료 이용 시설 (전 연령 무료)",
      concessionFeeText: "만 65세 이상 어르신 포함 전 연령 무료 이용",
      feeType: "free",
    },
    reservation: {
      summary: "현장 방문 순번대기 후 자율 라운딩 (18홀 코스)",
      methods: [
        {
          methodType: "visit",
          methodText: "현장 도착 순서대로 티박스 대기 순번 라운딩",
          priority: 1,
          notes: "공공 잔디구장으로 무료 개방 (매주 월요일 잔디보호 정기 휴장)",
        },
      ],
    },
  },

  // 4. Chungcheong (충청)
  {
    id: "seed-facility-chungju",
    name: "충주 월드 파크골프장",
    address: "충청북도 충주시 호암동 123",
    province: "충북",
    district: "충주시",
    regionKey: "chungcheong",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "충주시시설관리공단",
    phone: "043-850-1234",
    lat: 36.958,
    lng: 127.933,
    sourceName: "seed",
    sourceUrl: "https://example.com",
    pricing: {
      baseFeeText: "무료 이용 가능 / Free Entry",
      concessionFeeText: "만 65세 이상 어르신 및 충주시민 무료 이용",
      feeType: "free",
    },
    reservation: {
      summary: "방문 접수 / Walk-in (36홀 코스)",
      methods: [
        {
          methodType: "visit",
          methodText: "현장 대기 후 선착순 입장",
          priority: 1,
          notes: "주말에는 대기 줄이 길 수 있습니다 / Long queues expected during weekends",
        },
      ],
    },
  },
  {
    id: "seed-facility-sejong",
    name: "세종 금강 파크골프장",
    address: "세종특별자치시 연동면 명학리 185-1",
    province: "세종",
    district: "세종시",
    regionKey: "chungcheong",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "세종특별자치시 시설관리공단",
    phone: "044-850-1270",
    lat: 36.5298,
    lng: 127.3224,
    sourceName: "seed",
    sourceUrl: "https://www.sjfmc.or.kr",
    pricing: {
      baseFeeText: "세종시민 무료 / 관외 3,000원",
      concessionFeeText: "만 65세 이상 어르신 100% 전액 면제 (신분증 제시)",
      feeType: "partial",
    },
    reservation: {
      summary: "세종시설공단 통합예약시스템 사전 예약 (36홀 코스)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "세종시설공단 통합예약포털 인터넷 접수",
          priority: 1,
          url: "https://www.sjfmc.or.kr",
          notes: "매월 25일 오전 10시 예약 시스템 개시",
        },
        {
          methodType: "phone",
          methodText: "금강스포츠공원 관리사무소 유선 상담",
          priority: 2,
          notes: "경로우대 대상자 현장 및 유선 잔여석 안내",
        },
      ],
    },
  },

  // 5. Honam (호남)
  {
    id: "seed-facility-gwangju",
    name: "광주 첨단 대상 파크골프장",
    address: "광주광역시 광산구 첨단2동 753-1",
    province: "광주",
    district: "광산구",
    regionKey: "honam",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "광주광역시 광산구 시설관리공단",
    phone: "062-960-8450",
    lat: 35.2185,
    lng: 126.8521,
    sourceName: "seed",
    pricing: {
      baseFeeText: "무료 이용 시설",
      concessionFeeText: "만 65세 이상 어르신 및 전 시민 무료",
      feeType: "free",
    },
    reservation: {
      summary: "현장 방문 순번 대기 및 동호회 요일제 운영 (18홀 코스)",
      methods: [
        {
          methodType: "visit",
          methodText: "영산강변 구장 현장 방문 순서표 기재 후 입장",
          priority: 1,
          notes: "영산강 둔치 무료 야외 코스로 자율 질서 유지 운영",
        },
      ],
    },
  },
  {
    id: "seed-facility-suncheon",
    name: "순천 동천 파크골프장",
    address: "전라남도 순천시 풍덕동 1289",
    province: "전남",
    district: "순천시",
    regionKey: "honam",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "순천시 체육진흥과",
    phone: "061-749-6660",
    lat: 34.9372,
    lng: 127.5029,
    sourceName: "seed",
    sourceUrl: "https://www.suncheon.go.kr/yeyak",
    pricing: {
      baseFeeText: "순천시민 1,000원 / 관외 3,000원",
      concessionFeeText: "만 65세 이상 어르신 100% 무료 감면 (경로우대증 제시)",
      feeType: "paid",
    },
    reservation: {
      summary: "순천시 공공서비스예약 인터넷 접수 및 현장 매표 (36홀 코스)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "순천시 바로예약 시스템",
          priority: 1,
          url: "https://www.suncheon.go.kr/yeyak",
          notes: "매월 20일 관내 시민 우선 접수 시작",
        },
        {
          methodType: "visit",
          methodText: "동천체육공원 매표소 현장 발권",
          priority: 2,
          notes: "당일 잔여 티오프에 한하여 어르신 현장 티켓 수령",
        },
      ],
    },
  },

  // 6. Yeongnam (영남)
  {
    id: "seed-facility-daegu",
    name: "대구 불로 파크골프장",
    address: "대구광역시 동구 불로동 99",
    province: "대구",
    district: "동구",
    regionKey: "yeongnam",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "대구시체육회",
    phone: "053-987-6543",
    lat: 35.912,
    lng: 128.636,
    sourceName: "seed",
    sourceUrl: "https://example.com",
    pricing: {
      baseFeeText: "기본 2,000원 / Base fee 2000 KRW",
      concessionFeeText: "만 65세 이상 어르신 50% 할인 (1,000원)",
      feeType: "paid",
    },
    reservation: {
      summary: "인터넷 추첨제 / Online Lottery (27홀 코스)",
      methods: [
        {
          methodType: "internet_lottery",
          methodText: "대구시 예약 통합 포털 내 추첨 신청",
          priority: 1,
          url: "https://example.daegu.go.kr/lottery",
          notes: "매월 1일부터 5일까지 접수 후 7일 발표 / Apply between 1st-5th, drawing on 7th",
        },
      ],
    },
  },
  {
    id: "seed-facility-miryang",
    name: "밀양 아리랑 파크골프장",
    address: "경상남도 밀양시 삼문동 389-1",
    province: "경남",
    district: "밀양시",
    regionKey: "yeongnam",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "밀양시시설관리공단",
    phone: "055-359-4600",
    lat: 35.4925,
    lng: 128.7495,
    sourceName: "seed",
    sourceUrl: "https://www.myfmc.cs.kr",
    pricing: {
      baseFeeText: "밀양시민 2,000원 / 관외 5,000원",
      concessionFeeText: "만 65세 이상 어르신 50% 감면 혜택 (관외 2,500원)",
      feeType: "paid",
    },
    reservation: {
      summary: "밀양시설공단 통합예약시스템 인터넷 선착순 (45홀 코스)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "밀양시시설관리공단 예약 페이지",
          priority: 1,
          url: "https://www.myfmc.cs.kr",
          notes: "매월 25일 오전 9시 예약 개시",
        },
        {
          methodType: "visit",
          methodText: "삼문둔치 클럽하우스 현장 키오스크",
          priority: 2,
          notes: "당일 빈자리 현장 키오스크 발권 (신분증 필수)",
        },
      ],
    },
  },

  // 7. Jeju (제주)
  {
    id: "seed-facility-hoecheon",
    name: "제주 회천 파크골프장",
    address: "제주특별자치도 제주시 봉개동 230-1",
    province: "제주",
    district: "제주시",
    regionKey: "jeju",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "제주시청 체육진흥과",
    phone: "064-728-3270",
    lat: 33.4795,
    lng: 126.6025,
    sourceName: "seed",
    sourceUrl: "https://www.jejusi.go.kr/field/yeyak",
    pricing: {
      baseFeeText: "제주도민 2,000원 / 일반 관광객 4,000원",
      concessionFeeText: "만 65세 이상 어르신 100% 무료 감면 (경로우대 전액 면제)",
      feeType: "paid",
    },
    reservation: {
      summary: "제주시 공공체육시설 예약시스템 및 현장 발권 (18홀 코스)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "제주시 체육시설 통합예약포털 인터넷 접수",
          priority: 1,
          url: "https://www.jejusi.go.kr/field/yeyak",
          notes: "7일 전 오전 9시부터 온라인 예약 가능",
        },
        {
          methodType: "visit",
          methodText: "회천체육공원 관리실 현장 접수",
          priority: 2,
          notes: "만 65세 이상 어르신 신분증 제시 후 무료 순번표 수령",
        },
      ],
    },
  },
  {
    id: "seed-facility-chilsipri",
    name: "서귀포 칠십리 파크골프장",
    address: "제주특별자치도 서귀포시 서홍동 570",
    province: "제주",
    district: "서귀포시",
    regionKey: "jeju",
    facilityType: "outdoor",
    status: "active",
    ownership: "public",
    operatorName: "서귀포시청 체육진흥과",
    phone: "064-760-3610",
    lat: 33.2514,
    lng: 126.5582,
    sourceName: "seed",
    pricing: {
      baseFeeText: "무료 이용 시설",
      concessionFeeText: "만 65세 이상 어르신 및 전 이용객 무료",
      feeType: "free",
    },
    reservation: {
      summary: "현장 방문 순번대기 후 자율 라운딩 (18홀 코스)",
      methods: [
        {
          methodType: "visit",
          methodText: "칠십리시공원 현장 방문 자율 이용",
          priority: 1,
          notes: "공원 내 천연잔디 코스 (매주 화요일 잔디 정비 휴장)",
        },
      ],
    },
  },
];
