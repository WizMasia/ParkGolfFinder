import { describe, expect, it } from "vitest";
import { parseBotConfig } from "../src/config.js";

describe("Bot Configuration Parser / 봇 설정 파서", () => {
  it("should parse valid configuration successfully / 올바른 설정이 성공적으로 파싱되어야 합니다", () => {
    const env = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/parkgolffinder",
      BOT_SCOPE: "national",
      BOT_RETENTION_DAYS: "5",
      BOT_CONCURRENCY: "3",
      BOT_USER_AGENT: "TestBot/1.0",
    };

    const config = parseBotConfig(env);

    expect(config.databaseUrl).toBe("postgresql://postgres:postgres@localhost:5432/parkgolffinder");
    expect(config.scope).toBe("national");
    expect(config.retentionDays).toBe(5);
    expect(config.concurrency).toBe(3);
    expect(config.userAgent).toBe("TestBot/1.0");
  });

  it("should apply default configurations when optional variables are missing / 옵션 변수가 없을 때 기본 설정이 적용되어야 합니다", () => {
    const env = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/parkgolffinder",
    };

    const config = parseBotConfig(env);

    expect(config.scope).toBe("national");
    expect(config.retentionDays).toBe(7);
    expect(config.concurrency).toBe(2);
    expect(config.userAgent).toBe("ParkGolfFinderBot/1.0");
  });

  it("should throw an error when DATABASE_URL is missing / DATABASE_URL이 없을 때 에러가 발생해야 합니다", () => {
    const env = {
      BOT_SCOPE: "national",
    };

    expect(() => parseBotConfig(env)).toThrow("DATABASE_URL");
  });

  it("should throw an error for invalid retention days / 유효하지 않은 보관 일수인 경우 에러가 발생해야 합니다", () => {
    const env = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/parkgolffinder",
      BOT_RETENTION_DAYS: "-1",
    };

    expect(() => parseBotConfig(env)).toThrow("BOT_RETENTION_DAYS");
  });

  it("should throw an error for invalid concurrency / 유효하지 않은 병렬 수인 경우 에러가 발생해야 합니다", () => {
    const env = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/parkgolffinder",
      BOT_CONCURRENCY: "0",
    };

    expect(() => parseBotConfig(env)).toThrow("BOT_CONCURRENCY");
  });
});
