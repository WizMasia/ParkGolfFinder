import { isParkGolfVenue } from "@parkgolf/shared";

/**
 * Classifies if the candidate record represents a valid park golf venue.
 * 후보 레코드가 유효한 파크골프장인지 분류합니다.
 */
export function classifyParkGolfVenue(input: {
  name: string;
  rawText: string;
  sourceName: string;
  sourceUrl: string;
}): boolean {
  return isParkGolfVenue(input);
}
