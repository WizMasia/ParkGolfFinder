import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * Adapter for official municipality park golf websites
 * 지방자치단체 공식 파크골프 웹사이트 어댑터
 */
export class OfficialAdapter implements SourceAdapter {
  name = "official";
  kind: SourceKind = "official";
  url = "https://example-municipality.go.kr/parkgolf";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    // Generate mockup data representing official sources
    // 공식 소스를 나타내는 모의(mockup) 데이터를 생성합니다.
    const mockRaw = [
      {
        name: "잠실 파크골프장",
        address: "서울특별시 송파구 잠실동 10",
        operatorName: "송파구청",
        phone: "02-423-0045",
        reservationText: "전화 예약 및 방문 접수 / Phone & Walk-in",
      },
      {
        name: "대저생태공원 파크골프장",
        address: "부산시 강서구 대저1동 1-5",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 90홀 / Capacity: 90 Holes",
      },
      {
        name: "신호파크골프장",
        address: "부산시 강서구 신호산단로 72번길 46",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "범방파크골프장",
        address: "부산시 강서구 범방동 1998",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 18홀 / Capacity: 18 Holes",
      },
      {
        name: "사암파크골프장",
        address: "부산시 강서구 신호동 194",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 18홀 / Capacity: 18 Holes",
      },
      {
        name: "삼락18 파크골프장",
        address: "부산시 사상구 삼락동 658-2",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "삼락9&9 파크골프장",
        address: "부산시 사상구 삼락동 658-1",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "삼락다이나믹 파크골프장",
        address: "부산시 사상구 삼락동 29-42",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 36홀 / Capacity: 36 Holes",
      },
      {
        name: "전포1배수지 파크골프장",
        address: "부산시 부산진구 진남로 472",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 6홀 / Capacity: 6 Holes",
      },
      {
        name: "화명생태공원 파크골프장",
        address: "부산시 북구 화명동 1718-14",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 45홀 / Capacity: 45 Holes",
      },
      {
        name: "남항체육공원 파크골프장",
        address: "부산시 서구 암남동 123-6",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 (인조잔디) / Capacity: 9 Holes (Artificial Turf)",
      },
      {
        name: "좌천파크골프장",
        address: "부산시 동구 증산서로 18",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 6홀 (구, 좌천초) / Capacity: 6 Holes",
      },
      {
        name: "강변파크골프장",
        address: "부산시 사하구 을숙도대로 466",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "오륜파크골프장",
        address: "부산시 금정구 오륜동 657-2",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "스포원 파크골프장",
        address: "부산시 금정구 체육공원로399번길 324",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "태종대 파크골프장",
        address: "부산시 영도구 동삼동 산 14-21",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "영도구 파크골프장",
        address: "부산시 영도구 동삼동 175-2",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "반여파크골프장",
        address: "부산시 해운대구 삼어로 94-141",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 / Capacity: 9 Holes",
      },
      {
        name: "해운대수목원 파크골프장",
        address: "부산시 해운대구 석대동 266",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 18홀 / Capacity: 18 Holes",
      },
      {
        name: "좌동파크골프장",
        address: "부산시 해운대구 좌동 1391",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 6홀 / Capacity: 6 Holes",
      },
      {
        name: "기장파크골프장",
        address: "부산시 기장군 정관읍 모전리 677",
        operatorName: "부산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 12홀 / Capacity: 12 Holes",
      },
      {
        name: "갑천 파크골프장 1구장",
        address: "대전광역시 유성구 탑립동 184-4",
        operatorName: "대전광역시시설관리공단",
        phone: "042-724-3236",
        reservationText: "무료 이용 (대전시민: 선착순 현장 입장 / 외지인: 4주~2일전 공단 통합인터넷예약 필수, 일 40명 제한) | 매주 월요일, 3~4월 잔디생육기, 우천 시 휴장 / Free (Daejeon residents: FCFS walk-in / Non-residents: Online booking 4w to 2d in advance, limit 40/day). Closed on Mondays, Mar-Apr, and rain.",
      },
      {
        name: "갑천 파크골프장 2구장",
        address: "대전광역시 유성구 용산동 51-2",
        operatorName: "대전광역시시설관리공단",
        phone: "070-8822-0129",
        reservationText: "무료 이용 (대전시민: 선착순 현장 입장 / 외지인: 4주~2일전 공단 통합인터넷예약 필수, 일 40명 제한) | 매주 월요일, 3~4월 잔디생육기, 우천 시 휴장 / Free (Daejeon residents: FCFS walk-in / Non-residents: Online booking 4w to 2d in advance, limit 40/day). Closed on Mondays, Mar-Apr, and rain.",
      },
      {
        name: "유등천 파크골프장",
        address: "대전광역시 서구 만년동 516",
        operatorName: "대전광역시시설관리공단",
        phone: "070-8822-0130",
        reservationText: "무료 이용 (대전시민: 선착순 현장 입장 / 외지인: 4주~2일전 공단 통합인터넷예약 필수, 일 40명 제한) | 매주 월요일, 3~4월 잔디생육기, 우천 시 휴장 / Free (Daejeon residents: FCFS walk-in / Non-residents: Online booking 4w to 2d in advance, limit 40/day). Closed on Mondays, Mar-Apr, and rain.",
      },
      {
        name: "그라운드 파크골프장",
        address: "대전광역시 유성구 봉명동 496-25",
        operatorName: "대전광역시시설관리공단",
        phone: "042-724-3232",
        reservationText: "무료 이용 (대전시민: 선착순 현장 입장 / 외지인: 4주~2일전 공단 통합인터넷예약 필수, 일 40명 제한) | 매주 월요일, 3~4월 잔디생육기, 우천 시 휴장 / Free (Daejeon residents: FCFS walk-in / Non-residents: Online booking 4w to 2d in advance, limit 40/day). Closed on Mondays, Mar-Apr, and rain.",
      },
      {
        name: "버드내-태평파크골프장",
        address: "대전광역시 중구 태평동 515-2",
        operatorName: "중구 파크골프협회",
        phone: "010-6469-2727",
        reservationText: "규모: 18홀 | 이용시간: 09:00~17:00 | 휴장일: 별도문의 / Capacity: 18 Holes | Hours: 09:00~17:00 | Closed: Contact operator.",
      },
      {
        name: "을미기파크골프장",
        address: "대전광역시 대덕구 대덕대로 1448 을미기공원 내",
        operatorName: "대덕구 파크골프협회",
        phone: "010-2456-1687",
        reservationText: "규모: 18홀 | 이용시간: 05:00~19:00 | 휴장일: 별도문의 / Capacity: 18 Holes | Hours: 05:00~19:00 | Closed: Contact operator.",
      },
      {
        name: "울산대공원 파크골프장",
        address: "울산광역시 남구 대공원로 94",
        operatorName: "울산시설공단",
        phone: "052-271-8816",
        reservationText: "유료 이용 (성인/청소년 4,000원, 어린이 3,000원 | 장비대여 1,000원) | 사용 7일 전 인터넷 대관시스템(ims.uic.or.kr) 예약제, 10세 이상 입장 / Paid (Adult 4,000 KRW, Child 3,000 KRW | Club rental 1,000 KRW). Online booking required 7 days in advance. Min age 10.",
      },
      {
        name: "동구 파크골프장",
        address: "울산광역시 동구 동부동 쇠평식물원",
        operatorName: "울산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 9홀 | 회원제 운영 / Capacity: 9 Holes | Membership only.",
      },
      {
        name: "중구동천 파크골프장",
        address: "울산광역시 중구 남외동 692-6",
        operatorName: "울산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 27홀 | 회원제 운영 / Capacity: 27 Holes | Membership only.",
      },
      {
        name: "울주 청량 파크골프장",
        address: "울산광역시 울주군 청량읍 삼남리 979-1",
        operatorName: "울산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 18홀 | 회원제 운영 / Capacity: 18 Holes | Membership only.",
      },
      {
        name: "북구 진장 파크골프장",
        address: "울산광역시 북구 진장동 400",
        operatorName: "울산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 27홀 | 회원제 운영 / Capacity: 27 Holes | Membership only.",
      },
      {
        name: "남구 태화강 파크골프장",
        address: "울산광역시 남구 신정동 391",
        operatorName: "울산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 36홀 | 회원제 운영 / Capacity: 36 Holes | Membership only.",
      },
      {
        name: "울주 범서 파크골프장",
        address: "울산광역시 울주군 범서읍 천상리 57-1",
        operatorName: "울산광역시파크골프협회",
        phone: "",
        reservationText: "규모: 18홀 | 회원제 운영 / Capacity: 18 Holes | Membership only.",
      },
    ];

    return mockRaw.map((item) => {
      const rawText = JSON.stringify(item);
      const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");

      return {
        sourceName: this.name,
        sourceUrl: this.url,
        sourceKind: this.kind,
        contentHash,
        rawText,
        extractedName: item.name,
        extractedAddress: item.address,
        extractedOperatorName: item.operatorName,
        extractedPhone: item.phone,
        extractedReservationText: item.reservationText,
      };
    });
  }
}
