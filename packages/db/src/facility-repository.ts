import { prisma } from "./client";

/**
 * Searches facilities matching a text query in name, address, or operatorName.
 * 시설명, 주소, 또는 운영 주체명에 쿼리 텍스트가 매칭되는 프로덕션 시설 리스트를 조회합니다.
 */
export async function findFacilitiesByQuery(query: string, regionKeys?: string[]) {
  const whereClause: any = {
    status: "active",
  };

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { operatorName: { contains: query, mode: "insensitive" } },
    ];
  }

  if (regionKeys && regionKeys.length > 0) {
    whereClause.regionKey = { in: regionKeys };
  }

  return prisma.facility.findMany({
    where: whereClause,
    include: {
      pricing: true,
      reservation: {
        include: {
          methods: {
            orderBy: { priority: "asc" },
          },
        },
      },
    },
  });
}

/**
 * Retrieves a single facility with all related details.
 * 단일 시설에 대한 요금, 예약 방식 및 모든 관련 정보를 상세히 가져옵니다.
 */
export async function findFacilityById(id: string) {
  return prisma.facility.findFirst({
    where: {
      id,
      status: "active",
    },
    include: {
      pricing: true,
      reservation: {
        include: {
          methods: {
            orderBy: { priority: "asc" },
          },
        },
      },
    },
  });
}

/**
 * Lists all active facilities within given regionKeys.
 * 제공된 광역권역 키 목록(regionKeys)에 포함된 활성 시설 리스트를 반환합니다.
 */
export async function listFacilitiesByRegionGroup(regionKeys: string[]) {
  return prisma.facility.findMany({
    where: {
      status: "active",
      regionKey: { in: regionKeys },
    },
    include: {
      pricing: true,
      reservation: {
        include: {
          methods: {
            orderBy: { priority: "asc" },
          },
        },
      },
    },
  });
}
