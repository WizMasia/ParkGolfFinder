import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed initial mock data for production environment verification.
 * 프로덕션 환경 검증용 초기 모의 데이터를 데이터베이스에 시딩합니다.
 */
async function main() {
  console.log("Starting database seeding... / 데이터베이스 시딩 시작...");

  // 1. Jamsil Park Golf (Capital / Jamsil)
  // 1. 잠실 파크골프장 (수도권 / 잠실)
  const JAMSIL_ID = "seed-facility-jamsil";
  await prisma.facility.upsert({
    where: { id: JAMSIL_ID },
    update: {},
    create: {
      id: JAMSIL_ID,
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
      sourceUrl: "https://example.com",
    },
  });

  await prisma.facilityPricing.upsert({
    where: { facilityId: JAMSIL_ID },
    update: {},
    create: {
      facilityId: JAMSIL_ID,
      baseFeeText: "성인 3,000원 / 청소년 2,000원",
      concessionFeeText: "만 65세 이상 어르신 50% 할인 (경로우대) / 50% discount for seniors over 65",
      feeType: "paid",
    },
  });

  const jamsilRes = await prisma.reservationInfo.upsert({
    where: { facilityId: JAMSIL_ID },
    update: {
      summary: "인터넷 선착순 · 전화 예약 / Online (FCFS) & Phone",
    },
    create: {
      facilityId: JAMSIL_ID,
      summary: "인터넷 선착순 · 전화 예약 / Online (FCFS) & Phone",
    },
  });

  await prisma.reservationMethod.deleteMany({
    where: { reservationInfoId: jamsilRes.id },
  });

  await prisma.reservationMethod.createMany({
    data: [
      {
        reservationInfoId: jamsilRes.id,
        methodType: "internet_first_come",
        methodText: "송파구 통합예약 사이트 선착순 접수",
        priority: 1,
        url: "https://example.go.kr/booking",
        notes: "매월 25일 오전 9시 다음 달 예약 오픈 / Booking opens at 9 AM on the 25th of every month",
      },
      {
        reservationInfoId: jamsilRes.id,
        methodType: "phone",
        methodText: "관리사무소 대표번호 전화 문의",
        priority: 2,
        notes: "노약자 및 경로우대 대상자만 전화 예약 가능 / Phone bookings restricted to seniors & disabled",
      },
    ],
  });

  // 2. Chungju World Park Golf (Chungcheong / Chungju)
  // 2. 충주 월드 파크골프장 (충청권 / 충주)
  const CHUNGJU_ID = "seed-facility-chungju";
  await prisma.facility.upsert({
    where: { id: CHUNGJU_ID },
    update: {},
    create: {
      id: CHUNGJU_ID,
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
    },
  });

  await prisma.facilityPricing.upsert({
    where: { facilityId: CHUNGJU_ID },
    update: {},
    create: {
      facilityId: CHUNGJU_ID,
      baseFeeText: "무료 이용 가능 / Free Entry",
      feeType: "free",
    },
  });

  const chungjuRes = await prisma.reservationInfo.upsert({
    where: { facilityId: CHUNGJU_ID },
    update: {
      summary: "방문 접수 / Walk-in",
    },
    create: {
      facilityId: CHUNGJU_ID,
      summary: "방문 접수 / Walk-in",
    },
  });

  await prisma.reservationMethod.deleteMany({
    where: { reservationInfoId: chungjuRes.id },
  });

  await prisma.reservationMethod.create({
    data: {
      reservationInfoId: chungjuRes.id,
      methodType: "visit",
      methodText: "현장 대기 후 선착순 입장",
      priority: 1,
      notes: "주말에는 대기 줄이 길 수 있습니다 / Long queues expected during weekends",
    },
  });

  // 3. Daegu Bullo Park Golf (Yeongnam / Daegu)
  // 3. 대구 불로 파크골프장 (영남권 / 대구)
  const DAEGU_ID = "seed-facility-daegu";
  await prisma.facility.upsert({
    where: { id: DAEGU_ID },
    update: {},
    create: {
      id: DAEGU_ID,
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
    },
  });

  await prisma.facilityPricing.upsert({
    where: { facilityId: DAEGU_ID },
    update: {},
    create: {
      facilityId: DAEGU_ID,
      baseFeeText: "기본 2,000원 / Base fee 2000 KRW",
      feeType: "paid",
    },
  });

  const daeguRes = await prisma.reservationInfo.upsert({
    where: { facilityId: DAEGU_ID },
    update: {
      summary: "인터넷 추첨제 / Online Lottery",
    },
    create: {
      facilityId: DAEGU_ID,
      summary: "인터넷 추첨제 / Online Lottery",
    },
  });

  await prisma.reservationMethod.deleteMany({
    where: { reservationInfoId: daeguRes.id },
  });

  await prisma.reservationMethod.create({
    data: {
      reservationInfoId: daeguRes.id,
      methodType: "internet_lottery",
      methodText: "대구시 예약 통합 포털 내 추첨 신청",
      priority: 1,
      url: "https://example.daegu.go.kr/lottery",
      notes: "매월 1일부터 5일까지 접수 후 7일 발표 / Apply between 1st-5th, drawing on 7th",
    },
  });

  console.log("Database seeding completed successfully! / 데이터베이스 시딩 완료!");
}

main()
  .catch((e) => {
    console.error("Error seeding database: / 시딩 중 에러 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
