import {
  runCommand,
  fetchCommand,
  stageCommand,
  normalizeCommand,
  reviewCommand,
  promoteCommand,
  cleanupCommand,
} from "./index.js";

/**
 * Main entry point for the Command Line Interface
 * 커맨드 라인 인터페이스(CLI) 기본 진입점
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case "run":
      await runCommand();
      break;
    case "fetch":
      await fetchCommand();
      break;
    case "stage":
      await stageCommand();
      break;
    case "normalize":
      await normalizeCommand();
      break;
    case "review":
      await reviewCommand();
      break;
    case "promote":
      await promoteCommand();
      break;
    case "cleanup":
      await cleanupCommand();
      break;
    default:
      console.error(
        "Usage: bot <run|fetch|stage|normalize|review|promote|cleanup>\n" +
        "사용법: bot <run|fetch|stage|normalize|review|promote|cleanup>"
      );
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error: / 처리되지 않은 에러:", error);
  process.exit(1);
});
