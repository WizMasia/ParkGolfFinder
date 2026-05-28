import crypto from "crypto";
import { SourceAdapter, SourceRecord } from "./source-types.js";
import { SourceKind } from "@parkgolf/shared";

/**
 * List of South Korean Si/Gun/Gu municipalities (220+ districts)
 * 대한민국 전국 220여 개 시/군/구 기초자치단체 목록 (순회 수집용)
 */
export const SIGUNGU_LIST = [
  // Seoul / 서울특별시 (25)
  "서울특별시 강남구", "서울특별시 강동구", "서울특별시 강북구", "서울특별시 강서구", "서울특별시 관악구",
  "서울특별시 광진구", "서울특별시 구로구", "서울특별시 금천구", "서울특별시 노원구", "서울특별시 도봉구",
  "서울특별시 동대문구", "서울특별시 동작구", "서울특별시 마포구", "서울특별시 서대문구", "서울특별시 서초구",
  "서울특별시 성동구", "서울특별시 성북구", "서울특별시 송파구", "서울특별시 양천구", "서울특별시 영등포구",
  "서울특별시 용산구", "서울특별시 은평구", "서울특별시 종로구", "서울특별시 중구", "서울특별시 중랑구",
  
  // Busan / 부산광역시 (16)
  "부산광역시 강서구", "부산광역시 금정구", "부산광역시 기장군", "부산광역시 남구", "부산광역시 동구",
  "부산광역시 동래구", "부산광역시 부산진구", "부산광역시 북구", "부산광역시 사상구", "부산광역시 사하구",
  "부산광역시 서구", "부산광역시 수영구", "부산광역시 연제구", "부산광역시 영도구", "부산광역시 중구", "부산광역시 해운대구",
  
  // Daegu / 대구광역시 (9)
  "대구광역시 남구", "대구광역시 달서구", "대구광역시 달성군", "대구광역시 동구", "대구광역시 북구",
  "대구광역시 서구", "대구광역시 수성구", "대구광역시 중구", "대구광역시 군위군",
  
  // Incheon / 인천광역시 (10)
  "인천광역시 강화군", "인천광역시 계양구", "인천광역시 남동구", "인천광역시 동구", "인천광역시 미추홀구",
  "인천광역시 부평구", "인천광역시 서구", "인천광역시 연수구", "인천광역시 옹진군", "인천광역시 중구",
  
  // Gwangju / 광주광역시 (5)
  "광주광역시 광산구", "광주광역시 남구", "광주광역시 동구", "광주광역시 북구", "광주광역시 서구",
  
  // Daejeon / 대전광역시 (5)
  "대전광역시 대덕구", "대전광역시 동구", "대전광역시 서구", "대전광역시 유성구", "대전광역시 중구",
  
  // Ulsan / 울산광역시 (5)
  "울산광역시 남구", "울산광역시 동구", "울산광역시 북구", "울산광역시 울주군", "울산광역시 중구",
  
  // Sejong / 세종특별자치시 (1)
  "세종특별자치시",
  
  // Gyeonggi / 경기도 (31)
  "경기도 가평군", "경기도 고양시 덕양구", "경기도 고양시 일산동구", "경기도 고양시 일산서구", "경기도 과천시",
  "경기도 광명시", "경기도 광주시", "경기도 구리시", "경기도 군포시", "경기도 김포시", "경기도 남양주시",
  "경기도 동두천시", "경기도 부천시", "경기도 성남시 분당구", "경기도 성남시 수정구", "경기도 성남시 중원구",
  "경기도 수원시 권선구", "경기도 수원시 영통구", "경기도 수원시 장안구", "경기도 수원시 팔달구", "경기도 시흥시",
  "경기도 안산시 단원구", "경기도 안산시 상록구", "경기도 안성시", "경기도 안양시 동안구", "경기도 안양시 만안구",
  "경기도 양주시", "경기도 양평군", "경기도 여주시", "경기도 연천군", "경기도 오산시", "경기도 용인시 기흥구",
  "경기도 용인시 수지구", "경기도 용인시 처인구", "경기도 의왕시", "경기도 의정부시", "경기도 이천시",
  "경기도 파주시", "경기도 평택시", "경기도 포천시", "경기도 하남시", "경기도 화성시",
  
  // Gangwon / 강원특별자치도 (18)
  "강원특별자치도 강릉시", "강원특별자치도 고성군", "강원특별자치도 동해시", "강원특별자치도 삼척시",
  "강원특별자치도 속초시", "강원특별자치도 양구군", "강원특별자치도 양양군", "강원특별자치도 영월군",
  "강원특별자치도 원주시", "강원특별자치도 인제군", "강원특별자치도 정선군", "강원특별자치도 철원군",
  "강원특별자치도 춘천시", "강원특별자치도 태백시", "강원특별자치도 평창군", "강원특별자치도 홍천군",
  "강원특별자치도 화천군", "강원특별자치도 횡성군",
  
  // Chungbuk / 충청북도 (11)
  "충청북도 괴산군", "충청북도 단양군", "충청북도 보은군", "충청북도 영동군", "충청북도 옥천군",
  "충청북도 음성군", "충청북도 제천시", "충청북도 증평군", "충청북도 진천군", "충청북도 청주시", "충청북도 충주시",
  
  // Chungnam / 충청남도 (15)
  "충청남도 계룡시", "충청남도 공주시", "충청남도 금산군", "충청남도 논산시", "충청남도 당진시",
  "충청남도 부여군", "충청남도 서산시", "충청남도 서천군", "충청남도 아산시", "충청남도 예산군",
  "충청남도 천안시", "충청남도 청양군", "충청남도 태안군", "충청남도 홍성군", "충청남도 보령시",
  
  // Jeonbuk / 전북특별자치도 (14)
  "전북특별자치도 고창군", "전북특별자치도 군산시", "전북특별자치도 김제시", "전북특별자치도 남원시",
  "전북특별자치도 무주군", "전북특별자치도 부안군", "전북특별자치도 순창군", "전북특별자치도 완주군",
  "전북특별자치도 익산시", "전북특별자치도 임실군", "전북특별자치도 장수군", "전북특별자치도 전주시",
  "전북특별자치도 정읍시", "전북특별자치도 진안군",
  
  // Jeonnam / 전라남도 (22)
  "전라남도 강진군", "전라남도 고흥군", "전라남도 곡성군", "전라남도 광양시", "전라남도 구례군",
  "전라남도 나주시", "전라남도 담양군", "전라남도 목포시", "전라남도 무안군", "전라남도 보성군",
  "전라남도 순천시", "전라남도 신안군", "전라남도 여수시", "전라남도 영광군", "전라남도 영암군",
  "전라남도 완도군", "전라남도 장성군", "전라남도 장흥군", "전라남도 진도군", "전라남도 함평군",
  "전라남도 해남군", "전라남도 화순군",
  
  // Gyeongbuk / 경상북도 (22)
  "경상북도 경산시", "경상북도 경주시", "경상북도 고령군", "경상북도 구미시", "경상북도 김천시",
  "경상북도 문경시", "경상북도 봉화군", "경상북도 상주시", "경상북도 성주군", "경상북도 안동시",
  "경상북도 영덕군", "경상북도 영양군", "경상북도 영주시", "경상북도 영천시", "경상북도 예천군",
  "경상북도 울릉군", "경상북도 울진군", "경상북도 의성군", "경상북도 청도군", "경상북도 청송군",
  "경상북도 칠곡군", "경상북도 포항시",
  
  // Gyeongnam / 경상남도 (18)
  "경상남도 거제시", "경상남도 거창군", "경상남도 고성군", "경상남도 김해시", "경상남도 남해군",
  "경상남도 밀양시", "경상남도 사천시", "경상남도 산청군", "경상남도 양산시", "경상남도 의령군",
  "경상남도 진주시", "경상남도 창녕군", "경상남도 창원시", "경상남도 통영시", "경상남도 하동군",
  "경상남도 함안군", "경상남도 함양군", "경상남도 합천군",
  
  // Jeju / 제주특별자치도 (2)
  "제주특별자치도 서귀포시", "제주특별자치도 제주시"
];

/**
 * Adapter for Kakao Map Search Keyword API
 * 카카오 맵 키워드 검색 API를 이용해 전국 지자체 순회 크롤링을 수행하는 어댑터
 */
export class KakaoAdapter implements SourceAdapter {
  name = "kakao";
  kind: SourceKind = "kakao";
  url = "https://dapi.kakao.com/v2/local/search/keyword.json";

  async fetchRecords(userAgent: string): Promise<SourceRecord[]> {
    const apiKey = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      console.warn("Kakao API key is not configured. Skipping Kakao loop crawler. / 카카오 API 키가 설정되지 않아 카카오 순회 크롤러를 건너뜁니다.");
      return [];
    }

    const allRecords: SourceRecord[] = [];
    console.log(`[KakaoAdapter] Starting Kakao Si/Gun/Gu loop search for ${SIGUNGU_LIST.length} districts... / 전국 ${SIGUNGU_LIST.length}개 시군구 순회 키워드 검색 시작...`);

    // Loop through all Si/Gun/Gu municipalities
    // 전국 시군구 목록을 순회하며 검색 요청을 전송합니다.
    for (const sigungu of SIGUNGU_LIST) {
      const queries = [
        `${sigungu} 파크골프장`,
        `${sigungu} 스크린 파크골프장`,
      ];

      for (const query of queries) {
        try {
          const urlWithQuery = `${this.url}?query=${encodeURIComponent(query)}&page=1&size=15`;
          const response = await fetch(urlWithQuery, {
            method: "GET",
            headers: {
              "Authorization": `KakaoAK ${apiKey}`,
              "User-Agent": userAgent,
            },
          });

          if (!response.ok) {
            console.error(`[KakaoAdapter] Failed fetching Kakao keyword for "${query}": Status ${response.status} / "${query}" 검색 실패: ${response.status}`);
            continue;
          }

          const data: any = await response.json();
          const documents = data.documents || [];

          for (const item of documents) {
            const rawText = JSON.stringify(item);
            const contentHash = crypto.createHash("sha256").update(rawText).digest("hex");
            
             const lat = parseFloat(item.y);
             const lng = parseFloat(item.x);
             
             const address = item.road_address_name || item.address_name || "";
             const addrParts = address.split(" ");
             const regionPrefix = addrParts.slice(0, 2).join(" ");
             const mapSearchQuery = `${regionPrefix} ${item.place_name}`.trim();

             allRecords.push({
               sourceName: this.name,
               sourceUrl: item.place_url || urlWithQuery,
               sourceKind: this.kind,
               contentHash,
               rawText,
               extractedName: item.place_name,
               extractedAddress: address,
               extractedOperatorName: null,
               extractedPhone: item.phone || null,
               extractedReservationText: null,
               kakaoPlaceId: item.id || null,
               mapSearchQuery,
             });
          }
        } catch (error) {
          console.error(`[KakaoAdapter] Error fetching Kakao keyword search for "${query}": / "${query}" 검색 중 오류 발생:`, error);
        }

        // Add a 100ms throttle delay to prevent API blocks
        // 카카오 API 차단 방지를 위해 100ms 대기 딜레이 적용
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`[KakaoAdapter] Finished Kakao loop crawler. Collected ${allRecords.length} records. / 카카오 순회 크롤러 완료: 총 ${allRecords.length}개 레코드 수집.`);
    return allRecords;
  }
}
