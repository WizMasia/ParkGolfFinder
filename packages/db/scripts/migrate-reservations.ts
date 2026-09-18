import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA = [
  {
    facilityId: "cmpl2b98i000agamkjmpvl2lc",
    name: "화랑유원지 파크골프장",
    summary: "안산시 통합예약시스템을 통한 인터넷 선착순 예약 방식입니다.",
    methods: [
      {
        methodType: "internet_first_come",
        methodText: "인터넷 예약 (선착순)",
        priority: 1,
        ruleText: "안산시 통합예약시스템을 통해 매월 선착순으로 대관 예약을 신청할 수 있습니다. 예약 신청 시작 시간은 일반적으로 오전 9:00입니다.",
        url: "https://www.ansan.go.kr/res",
        notes: "안산시민 할인 혜택 등을 위해 사전 본인인증이 필요할 수 있습니다."
      }
    ]
  },
  {
    facilityId: "cmplbu5sl003e1uznqcbw9ibx",
    name: "안산신길파크골프장",
    summary: "안산시 통합예약시스템 또는 안산도시공사 홈페이지를 통한 인터넷 선착순 예약 방식입니다.",
    methods: [
      {
        methodType: "internet_first_come",
        methodText: "인터넷 예약 (선착순)",
        priority: 1,
        ruleText: "안산시 통합예약시스템을 통해 사전 온라인 선착순 대관 예약이 가능합니다. 예약 접수 시작 시간은 일반적으로 오전 9:00입니다.",
        url: "https://www.ansan.go.kr/res",
        notes: "안산시민 할인 혜택이 주어질 수 있으므로 예약 및 방문 시 신분증 지참을 권장합니다."
      }
    ]
  },
  {
    facilityId: "cmplbu652003i1uzn4wzpvajm",
    name: "양지파인리조트파크골프장",
    summary: "용인특례시 공공체육시설 통합예약을 통한 처인구민/용인시민 우선 및 일반 인터넷 선착순 예약 방식입니다.",
    methods: [
      {
        methodType: "internet_first_come",
        methodText: "인터넷 예약 (선착순)",
        priority: 1,
        ruleText: "용인특례시 공공체육시설 통합예약 시스템을 통해 예약이 가능합니다. 처인구민 우선예약(매월 15일 09:00), 용인시민 우선예약(매월 17일 09:00), 일반예약(매월 18일 09:00) 일정에 따라 선착순으로 접수합니다.",
        url: "https://www.yongin.go.kr/res",
        notes: "용인시민 우선 예약을 위해 비대면 자격확인 서비스 기반 본인인증 및 거주지 확인이 필요합니다."
      }
    ]
  }
];

async function main() {
  console.log("Starting Gyeonggi-do Park Golf Reservation Migration...");

  for (const item of DATA) {
    console.log(`\nProcessing: ${item.name} (${item.facilityId})`);
    
    const facility = await prisma.facility.findUnique({
      where: { id: item.facilityId }
    });

    if (!facility) {
      console.warn(`[WARNING] Facility with ID ${item.facilityId} not found in DB!`);
      continue;
    }

    console.log(`Found facility: ${facility.name} (Address: ${facility.address})`);

    const reservationInfo = await prisma.reservationInfo.upsert({
      where: { facilityId: item.facilityId },
      update: { summary: item.summary },
      create: {
        facilityId: item.facilityId,
        summary: item.summary
      }
    });

    console.log(`ReservationInfo record upserted: ID ${reservationInfo.id}`);

    const deleteCount = await prisma.reservationMethod.deleteMany({
      where: { reservationInfoId: reservationInfo.id }
    });
    console.log(`Deleted ${deleteCount.count} existing ReservationMethod records.`);

    for (const method of item.methods) {
      const createdMethod = await prisma.reservationMethod.create({
        data: {
          reservationInfoId: reservationInfo.id,
          methodType: method.methodType,
          methodText: method.methodText,
          priority: method.priority,
          ruleText: method.ruleText,
          url: method.url,
          notes: method.notes
        }
      });
      console.log(`Created ReservationMethod: ${createdMethod.methodText} (Type: ${createdMethod.methodType})`);
    }
  }

  console.log("\nMigration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
