import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MappingRule {
  province?: string;
  district?: string;
  nameKeyword?: string;
  url: string;
}

const REGIONAL_RESERVATION_MAP: MappingRule[] = [
  { province: "서울", district: "송파구", url: "https://www.songpashisul.or.kr" },
  { province: "서울", district: "영등포구", url: "https://www.y-sisul.or.kr" },
  { province: "서울", district: "강남구", url: "https://www.gangnam.go.kr/office/gnsports/main.do" },
  { province: "서울", district: "노원구", url: "https://www.nowonsc.kr" },
  { province: "서울", district: "성동구", url: "https://www.sdmc.go.kr" },
  { province: "서울", district: "강동구", url: "https://www.gdws.or.kr" },
  { province: "서울", district: "동작구", url: "https://www.idongjak.or.kr" },
  { province: "서울", district: "중랑구", url: "https://www.jungnangmc.or.kr" },
  { province: "서울", district: "광진구", url: "https://www.gwangjin.or.kr" },
  { province: "서울", nameKeyword: "잠실", url: "https://yeyak.seoul.go.kr" },
  { province: "서울", nameKeyword: "서남센터", url: "https://yeyak.seoul.go.kr" },
  { province: "서울", nameKeyword: "한강", url: "https://yeyak.seoul.go.kr" },
  { province: "서울", nameKeyword: "양평누리", url: "https://www.y-sisul.or.kr" },
  { province: "서울", district: "관악구", url: "https://booking.gwanakgongdan.or.kr/booking/1512" },
  
  { province: "경기", district: "성남", url: "https://www.seongnam.go.kr/rsv" },
  { province: "경기", district: "고양", url: "https://www.goyang.go.kr/res" },
  { province: "경기", district: "남양주", url: "https://www.nyj.go.kr/res" },
  { province: "경기", district: "수원", url: "https://www.suwon.go.kr/web/reserve" },
  { province: "경기", district: "용인", url: "https://www.yongin.go.kr/res" },
  { province: "경기", district: "파주", url: "https://www.paju.go.kr/res" },
  { province: "경기", district: "안산", url: "https://www.ansan.go.kr/res" },
  { province: "경기", district: "안양", url: "https://www.anyang.go.kr/res" },
  { province: "경기", district: "화성", url: "https://www.hscity.go.kr/res" },
  { province: "경기", district: "평택", url: "https://www.pyeongtaek.go.kr/res" },
  { province: "경기", district: "의정부", url: "https://www.uimj.or.kr" },
  { province: "경기", district: "김포", url: "https://www.gimpo.go.kr/res" },
  { province: "경기", district: "양주", url: "https://www.yangju.go.kr/res" },
  { province: "경기", district: "포천", url: "https://www.pocheon.go.kr/res" },

  { province: "대구", url: "https://dgpg.daegu.go.kr" },
  { province: "대전", url: "https://www.djsiseol.or.kr/res" },
  { province: "세종", url: "https://www.sejong.go.kr/res" },
  { province: "인천", url: "https://www.insiseol.or.kr" },
  
  { province: "경남", district: "창원", url: "https://www.changwon.go.kr/res" },
  { province: "경남", district: "진주", url: "https://www.jinju.go.kr/res" },
  { province: "경남", district: "함안", url: "https://www.haman.go.kr/res" },
  { province: "경북", district: "포항", url: "https://www.phsisul.org" },
  { province: "경북", district: "구미", url: "https://www.gumi.go.kr/portal/main.do" },
  { province: "전북", district: "전주", url: "https://www.jjss.or.kr" },
  { province: "전북", district: "군산", url: "https://www.gunsan.go.kr/res" },
  { province: "전북", district: "익산", url: "https://www.iksan.go.kr/res" },
  { province: "전남", district: "목포", url: "https://www.mokpo.go.kr/res" },
  { province: "전남", district: "여수", url: "https://www.yeosu.go.kr/res" },
  { province: "전남", district: "순천", url: "https://www.suncheon.go.kr/res" },
  { province: "충북", district: "청주", url: "https://www.cheongju.go.kr/res" },
  { province: "충북", district: "충주", url: "https://www.chungju.go.kr/rev" },
  { province: "충남", district: "천안", url: "https://www.cheonan.go.kr/res" },
  { province: "충남", district: "아산", url: "https://www.asan.go.kr/res" },
  { province: "강원", district: "춘천", url: "https://www.chuncheon.go.kr/res" },
  { province: "강원", district: "원주", url: "https://www.wonju.go.kr/res" },
  { province: "강원", district: "강릉", url: "https://www.gn.go.kr/res" },
];

function isRealHomepageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  const blacklistedDomains = [
    "parkgolflist.com",
    "djpkgolf.kr",
    "api.odcloud.kr",
    "data.go.kr",
    "openapi.gg.go.kr",
    "eshare.go.kr",
    "local_upload"
  ];
  return !blacklistedDomains.some(domain => lowercaseUrl.includes(domain));
}

function matchPartial(val: string | null | undefined, ruleVal: string): boolean {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  const r = ruleVal.toLowerCase().trim();
  return v.includes(r) || r.includes(v);
}

async function main() {
  console.log("=== [Starting Public Reservation Deep-link Mapping Migration] ===");
  
  const facilities = await prisma.facility.findMany({
    include: {
      reservation: {
        include: {
          methods: true
        }
      }
    }
  });
  
  let mappedCount = 0;
  
  for (const f of facilities) {
    const bookingUrl = f.reservation?.methods?.find((m: any) => m.url)?.url;
    const currentBest = bookingUrl || f.sourceUrl;
    
    if (currentBest && isRealHomepageUrl(currentBest)) {
      continue;
    }
    
    let matchedRule: MappingRule | null = null;
    
    for (const rule of REGIONAL_RESERVATION_MAP) {
      if (rule.province && !matchPartial(f.province, rule.province)) continue;
      if (rule.district && !matchPartial(f.district, rule.district)) continue;
      if (rule.nameKeyword && !f.name.includes(rule.nameKeyword)) continue;
      
      matchedRule = rule;
      break;
    }
    
    if (matchedRule) {
      await prisma.facility.update({
        where: { id: f.id },
        data: { sourceUrl: matchedRule.url }
      });
      mappedCount++;
      console.log(`Mapped: "${f.name}" (${f.province || ""} ${f.district || ""}) -> ${matchedRule.url}`);
    }
  }
  
  console.log("\n=== [Deep-link Mapping Migration Completed] ===");
  console.log(`- Total Facilities Scanned: ${facilities.length}`);
  console.log(`- Successfully Remapped to Public Portals: ${mappedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
