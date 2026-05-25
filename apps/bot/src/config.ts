/**
 * Bot Configuration interface
 * 봇 설정 인터페이스
 */
export interface BotConfig {
  databaseUrl: string;
  scope: string;
  retentionDays: number;
  concurrency: number;
  userAgent: string;
}

/**
 * Parses and validates raw environment variables
 * 원시 환경 변수를 파싱하고 유효성을 검증합니다.
 */
export function parseBotConfig(env: Record<string, string | undefined>): BotConfig {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required. / DATABASE_URL 환경 변수가 필요합니다.");
  }

  const scope = env.BOT_SCOPE || "national";
  const retentionDays = parseInt(env.BOT_RETENTION_DAYS || "7", 10);
  const concurrency = parseInt(env.BOT_CONCURRENCY || "2", 10);
  const userAgent = env.BOT_USER_AGENT || "ParkGolfFinderBot/1.0";

  if (isNaN(retentionDays) || retentionDays < 0) {
    throw new Error("BOT_RETENTION_DAYS must be a non-negative number. / BOT_RETENTION_DAYS는 0 이상의 숫자여야 합니다.");
  }

  if (isNaN(concurrency) || concurrency <= 0) {
    throw new Error("BOT_CONCURRENCY must be a positive number. / BOT_CONCURRENCY는 양수여야 합니다.");
  }

  return {
    databaseUrl,
    scope,
    retentionDays,
    concurrency,
    userAgent,
  };
}

let memoizedConfig: BotConfig | null = null;

/**
 * Get the loaded configuration instance (lazy loading)
 * 로드된 설정 인스턴스를 가져옵니다 (지연 로딩)
 */
export function getConfig(): BotConfig {
  if (!memoizedConfig) {
    memoizedConfig = parseBotConfig(process.env);
  }
  return memoizedConfig;
}
