import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB update for reservation details...");

  const jungnangRes = await prisma.reservationInfo.upsert({
    where: { facilityId: "cmplbtyu600161uznjew7qdco" },
    update: {
      summary: "노원구민 우선 인터넷 선착순 예약제",
    },
    create: {
      facilityId: "cmplbtyu600161uznjew7qdco",
      summary: "노원구민 우선 인터넷 선착순 예약제",
    },
  });

  await prisma.reservationMethod.deleteMany({
    where: { reservationInfoId: jungnangRes.id },
  });

  await prisma.reservationMethod.createMany({
    data: [
      {
        reservationInfoId: jungnangRes.id,
        methodType: "internet_first_come",
        methodText: "노원구청 홈페이지 온라인 선착순 접수",
        priority: 1,
        ruleText: "매월 이용 당월 2주 전 월요일부터 금요일까지 순차적으로 예약이 진행됩니다. 노원구민 우선 예약 기간이 부여된 후 잔여분에 대해 타 지역 주민 접수가 가능합니다.",
        url: "https://www.nowonsc.kr",
        notes: "매주 월요일 정기 휴무, 운영 기간은 매년 5월부터 12월까지입니다.",
      },
    ],
  });
  console.log("Updated 중랑천파크골프장 (cmplbtyu600161uznjew7qdco)");

  const seongnamRes = await prisma.reservationInfo.upsert({
    where: { facilityId: "cmplbu424002u1uznno4enzj5" },
    update: {
      summary: "성남시민 대상 현장 선착순 대기 또는 온라인 사전 예약",
    },
    create: {
      facilityId: "cmplbu424002u1uznno4enzj5",
      summary: "성남시민 대상 현장 선착순 대기 또는 온라인 사전 예약",
    },
  });

  await prisma.reservationMethod.deleteMany({
    where: { reservationInfoId: seongnamRes.id },
  });

  await prisma.reservationMethod.createMany({
    data: [
      {
        reservationInfoId: seongnamRes.id,
        methodType: "visit",
        methodText: "현장 선착순 대기 (수내 파크골프장 등)",
        priority: 1,
        ruleText: "성남시민 전용으로 운영되며, 별도 예약 없이 신분증을 지참하여 현장 방문 후 선착순 입장합니다.",
        url: "https://www.seongnam.go.kr/rsv",
        notes: "매주 월요일 및 법정 공휴일 휴장, 이용 요금 무료 (장비 대여는 유료)",
      },
      {
        reservationInfoId: seongnamRes.id,
        methodType: "internet_first_come",
        methodText: "성남도시개발공사 체육시설 통합예약 시스템 사전 예약",
        priority: 2,
        ruleText: "성남도시개발공사 통합예약 시스템을 통해 100% 온라인 사전 예약 진행. 성남시민 우선 예약 혜택이 적용될 수 있습니다.",
        url: "https://www.seongnam.go.kr/rsv",
        notes: "이용 시 본인 확인을 위해 신분증 지참 필수",
      },
    ],
  });
  console.log("Updated 성남시파크골프장 (cmplbu424002u1uznno4enzj5)");

  const seongjeoRes = await prisma.reservationInfo.upsert({
    where: { facilityId: "cmplbu4el002y1uznzlqct41h" },
    update: {
      summary: "고양시민 우선 인터넷 선착순 예약 및 일부 현장 선착순 접수",
    },
    create: {
      facilityId: "cmplbu4el002y1uznzlqct41h",
      summary: "고양시민 우선 인터넷 선착순 예약 및 일부 현장 선착순 접수",
    },
  });

  await prisma.reservationMethod.deleteMany({
    where: { reservationInfoId: seongjeoRes.id },
  });

  await prisma.reservationMethod.createMany({
    data: [
      {
        reservationInfoId: seongjeoRes.id,
        methodType: "internet_first_come",
        methodText: "고양도시관리공사 통합예약 시스템 선착순 접수",
        priority: 1,
        ruleText: "매월 15일 14:00 고양시민 우선 온라인 예약 오픈. 관외 거주자는 매월 20일 14:00부터 잔여석 예약 가능.",
        url: "https://www.goyang.go.kr/res",
        notes: "이용일별 날짜 선택 후 결제 완료 시 예약 확정. 3부제 운영 (1부: 09~11시, 2부: 12~14시, 3부: 15~17시)",
      },
      {
        reservationInfoId: seongjeoRes.id,
        methodType: "visit",
        methodText: "현장 선착순 접수",
        priority: 2,
        ruleText: "온라인 예약 잔여 인원 및 일부 현장 배정 인원에 대해 현장 선착순 접수 및 입장을 운영합니다.",
        url: "https://www.goyang.go.kr/res",
        notes: "매주 화요일 및 명절, 우천 시 정기 휴장. 동절기 휴장 및 잔디 보호 기간 휴장 확인 필요.",
      },
    ],
  });
  console.log("Updated 성저파크골프장 (cmplbu4el002y1uznzlqct41h)");

  console.log("DB update completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
