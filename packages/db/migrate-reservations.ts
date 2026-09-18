import { prisma } from "./src/client.js";

async function main() {
  const data = [
    {
      facilityId: "cmpl2b8mz0002gamk202ojfez",
      summary: "인터넷 예약(선착순)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "인터넷 예약 (서울시 공공서비스예약)",
          priority: 1,
          ruleText: "매월 15일 13:30 다음 달 이용분 선착순 예약 개시 (월 2회 제한)",
          url: "https://yeyak.seoul.go.kr",
          notes: "이용 요금은 현장 카드 결제. 매주 월요일 및 우천 시 휴장."
        }
      ]
    },
    {
      facilityId: "cmpl2b9090006gamkmv2dbch6",
      summary: "당일 현장 접수 (선착순 번호표 배부)",
      methods: [
        {
          methodType: "visit",
          methodText: "현장 접수 (선착순)",
          priority: 1,
          ruleText: "사전 온라인 예약 불가. 당일 현장 선착순 접수. 각 회차 시작 10분 전 번호표 배부 (회차당 100명 제한).",
          url: "https://hangang.seoul.go.kr",
          notes: "4부제 운영 (1회: 07:00, 2회: 09:20, 3회: 11:40, 4회: 14:30). 매주 월요일 휴장."
        }
      ]
    },
    {
      facilityId: "cmplbtz6w001a1uzna7wqbe74",
      summary: "인터넷 예약 (영등포구시설관리공단)",
      methods: [
        {
          methodType: "internet_first_come",
          methodText: "인터넷 예약 (영등포구시설관리공단)",
          priority: 1,
          ruleText: "영등포구민 매월 25일, 타 지역민 매월 28일 대관 선착순 예약 개시.",
          url: "https://www.y-sisul.or.kr",
          notes: "본인 확인용 신분증 지참 필수."
        }
      ]
    }
  ];

  for (const item of data) {
    console.log(`Processing Facility ID: ${item.facilityId}`);
    
    let resInfo = await prisma.reservationInfo.findUnique({
      where: { facilityId: item.facilityId }
    });

    if (!resInfo) {
      resInfo = await prisma.reservationInfo.create({
        data: {
          facilityId: item.facilityId,
          summary: item.summary
        }
      });
    } else {
      resInfo = await prisma.reservationInfo.update({
        where: { id: resInfo.id },
        data: { summary: item.summary }
      });
    }

    await prisma.reservationMethod.deleteMany({
      where: { reservationInfoId: resInfo.id }
    });

    for (const method of item.methods) {
      await prisma.reservationMethod.create({
        data: {
          reservationInfoId: resInfo.id,
          methodType: method.methodType,
          methodText: method.methodText,
          priority: method.priority,
          ruleText: method.ruleText,
          url: method.url,
          notes: method.notes
        }
      });
    }
  }

  console.log("Migration completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
