import { PrismaClient } from "@prisma/client";

/**
 * Global cache key for PrismaClient instance in development environment
 * 개발 환경에서 PrismaClient 인스턴스를 유지하기 위한 전역 캐시 키
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton instance of PrismaClient
 * PrismaClient 싱글톤 인스턴스
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
