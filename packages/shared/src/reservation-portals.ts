/**
 * Regional Public Reservation Portal Rules
 * 전국 시·도 및 시·군·구 공공시설 예약 포털 매핑 규칙
 */
export interface RegionalReservationRule {
  province?: string;
  district?: string;
  nameKeyword?: string;
  url: string;
}

export const REGIONAL_RESERVATION_MAP: RegionalReservationRule[] = [
  // 서울특별시
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

  // 경기도
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
  { province: "경기", district: "여주", url: "https://www.yeojuuc.or.kr" },
  { province: "경기", district: "양평", url: "https://www.yp21.go.kr" },
  { province: "경기", district: "가평", url: "https://www.gpfmc.or.kr" },
  { province: "경기", district: "안성", url: "https://www.asimc.or.kr" },

  // 광역시 및 특별자치시
  { province: "대구", url: "https://dgpg.daegu.go.kr" },
  { province: "대전", url: "https://www.djsiseol.or.kr/res" },
  { province: "세종", url: "https://www.sejong.go.kr/res" },
  { province: "인천", url: "https://www.insiseol.or.kr" },

  // 경상남북도
  { province: "경남", district: "창원", url: "https://www.changwon.go.kr/res" },
  { province: "경남", district: "진주", url: "https://www.jinju.go.kr/res" },
  { province: "경남", district: "함안", url: "https://www.haman.go.kr/res" },
  { province: "경북", district: "포항", url: "https://www.phsisul.org" },
  { province: "경북", district: "구미", url: "https://www.gumi.go.kr/portal/main.do" },
  { province: "경북", district: "경주", url: "https://www.gyeongju.go.kr/reservation" },
  { province: "경북", district: "안동", url: "https://www.andong.go.kr" },
  { province: "경북", district: "상주", url: "https://www.sangju.go.kr" },
  { province: "경남", district: "김해", url: "https://www.gimhae.go.kr/yes" },

  // 전라남북도
  { province: "전북", district: "전주", url: "https://www.jjss.or.kr" },
  { province: "전북", district: "군산", url: "https://www.gunsan.go.kr/res" },
  { province: "전북", district: "익산", url: "https://www.iksan.go.kr/res" },
  { province: "전남", district: "목포", url: "https://www.mokpo.go.kr/res" },
  { province: "전남", district: "여수", url: "https://www.yeosu.go.kr/res" },
  { province: "전남", district: "순천", url: "https://www.suncheon.go.kr/res" },

  // 충청남북도
  { province: "충북", district: "청주", url: "https://www.cheongju.go.kr/res" },
  { province: "충북", district: "충주", url: "https://www.chungju.go.kr/rev" },
  { province: "충남", district: "천안", url: "https://www.cheonan.go.kr/res" },
  { province: "충남", district: "아산", url: "https://www.asan.go.kr/res" },

  // 강원특별자치도
  { province: "강원", district: "춘천", url: "https://www.chuncheon.go.kr/res" },
  { province: "강원", district: "원주", url: "https://www.wonju.go.kr/res" },
  { province: "강원", district: "강릉", url: "https://www.gn.go.kr/res" },
];

/**
 * Resolves verified regional reservation URL based on province, district, and facility name.
 * 지자체 및 구장명을 바탕으로 매핑된 공식 예약 사이트 주소를 도출합니다.
 */
export function resolveRegionalReservationUrl(facility: {
  province?: string | null;
  district?: string | null;
  name: string;
}): string | null {
  const prov = facility.province?.trim().toLowerCase() || "";
  const dist = facility.district?.trim().toLowerCase() || "";
  const name = facility.name;

  for (const rule of REGIONAL_RESERVATION_MAP) {
    if (rule.province && !prov.includes(rule.province.toLowerCase())) continue;
    if (rule.district && !dist.includes(rule.district.toLowerCase())) continue;
    if (rule.nameKeyword && !name.includes(rule.nameKeyword)) continue;
    return rule.url;
  }

  return null;
}
