# ParkGolfFinder Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI-first ParkGolfFinder collection bot that fetches external park golf sources, normalizes them into DB staging tables, classifies duplicates and park-golf eligibility conservatively, and promotes only confirmed records into the production tables.

**Architecture:** The bot is a separate Node/TypeScript workspace under `apps/bot` that talks only to the shared Prisma/PostgreSQL layer and shared domain utilities. Source adapters convert external pages into normalized staging rows, review logic classifies duplicates and park-golf eligibility, and promotion writes only approved records into the production tables that the web app reads.

**Tech Stack:** Node 20, TypeScript, Prisma, PostgreSQL, Vitest, a lightweight source parsing layer for external pages

---

## File structure to create

- `apps/bot/` — CLI worker entrypoint, commands, pipeline, tests
- `packages/db/` — extend the Prisma schema with staging tables and staging repositories
- `packages/shared/` — extend shared bot-domain types and classification helpers
- `.env.example` — add bot-specific runtime variables if needed

---

### Task 1: Bootstrap the bot workspace and CLI shell

**Files:**
- Create: `apps/bot/package.json`
- Create: `apps/bot/tsconfig.json`
- Modify: `.env.example`
- Create: `apps/bot/src/index.ts`
- Create: `apps/bot/src/cli.ts`
- Create: `apps/bot/src/config.ts`
- Create: `apps/bot/src/commands/run.ts`
- Create: `apps/bot/src/commands/fetch.ts`
- Create: `apps/bot/src/commands/stage.ts`
- Create: `apps/bot/src/commands/normalize.ts`
- Create: `apps/bot/src/commands/review.ts`
- Create: `apps/bot/src/commands/promote.ts`
- Create: `apps/bot/src/commands/cleanup.ts`
- Create: `apps/bot/test/cli.test.ts`

- [ ] **Step 1: Add the bot workspace package and scripts**

Use a dedicated bot package that does not start a web server. The package should expose the operational commands the plan uses:

```json
{
  "name": "@parkgolf/bot",
  "private": true,
  "type": "module",
  "scripts": {
    "run": "tsx src/cli.ts run",
    "fetch": "tsx src/cli.ts fetch",
    "stage": "tsx src/cli.ts stage",
    "normalize": "tsx src/cli.ts normalize",
    "review": "tsx src/cli.ts review",
    "promote": "tsx src/cli.ts promote",
    "cleanup": "tsx src/cli.ts cleanup",
    "lint": "eslint src test",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

Add a root script for convenience:

```json
{
  "scripts": {
    "bot:run": "npm --workspace apps/bot run run",
    "bot:fetch": "npm --workspace apps/bot run fetch",
    "bot:stage": "npm --workspace apps/bot run stage",
    "bot:normalize": "npm --workspace apps/bot run normalize",
    "bot:review": "npm --workspace apps/bot run review",
    "bot:promote": "npm --workspace apps/bot run promote",
    "bot:cleanup": "npm --workspace apps/bot run cleanup"
  }
}
```

Install only the dependencies needed for a CLI worker:

- `apps/bot`: `tsx`, `typescript`, `vitest`, `@types/node`

`.env.example` should include the bot runtime variables alongside the shared database URL:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parkgolffinder"
NEXT_PUBLIC_KAKAO_MAP_API_KEY=""
BOT_SCOPE="national"
BOT_RETENTION_DAYS="7"
BOT_CONCURRENCY="2"
BOT_USER_AGENT="ParkGolfFinderBot/1.0"
```

- [ ] **Step 2: Create the CLI entrypoint and command router**

Keep the CLI small and explicit. `apps/bot/src/cli.ts` should parse one positional command and dispatch to a command module:

```ts
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
    console.error("Usage: bot <run|fetch|stage|normalize|review|promote|cleanup>");
    process.exit(1);
}
```

`apps/bot/src/index.ts` should export the command functions so the CLI and tests share the same implementation.

- [ ] **Step 3: Add config loading**

Implement `apps/bot/src/config.ts` so the bot reads:
- `DATABASE_URL`
- `BOT_SCOPE` with default `national`
- `BOT_RETENTION_DAYS` with default `7`
- `BOT_CONCURRENCY` with default `2`
- `BOT_USER_AGENT` with a safe default string

Use a tiny validated config object so bad environment variables fail fast before any network or DB work starts.

- [ ] **Step 4: Write the first CLI smoke test**

Add tests for:
- `bot run` dispatches the full pipeline
- an unknown command exits with usage text
- config defaults load when optional variables are missing

Example:

```ts
import { describe, expect, it } from "vitest";
import { parseBotConfig } from "../src/config";

it("uses a national default scope", () => {
  expect(parseBotConfig({ DATABASE_URL: "postgres://x" }).scope).toBe("national");
});
```

- [ ] **Step 5: Verify the bot shell boots**

Run:

```bash
npm install
npm --workspace apps/bot run run
```

Expected:
- the package resolves
- the command dispatcher starts cleanly and reaches the pipeline entrypoint

- [ ] **Step 6: Commit**

```bash
git add apps/bot package.json
git commit -m "chore: bootstrap the bot CLI shell"
```

---

### Task 2: Extend the shared domain with bot verdicts and normalized records

**Files:**
- Create: `packages/shared/src/bot-domain.ts`
- Update: `packages/shared/src/index.ts`
- Create: `packages/shared/test/bot-domain.test.ts`

- [ ] **Step 1: Define the bot-specific shared types**

Add the types the bot and DB staging layer need in one place so the rest of the implementation uses the same vocabulary:

```ts
export type SourceKind = "official" | "mcst" | "parkgolf24" | "kakao" | "other";
export type ParkGolfVerdict = "confirmed" | "candidate" | "hidden";
export type DuplicateStatus = "exact" | "probable" | "ambiguous";
export type ReviewDecision = "confirmed" | "candidate" | "hidden";

export interface NormalizedFacilityCandidate {
  contentHash: string;
  sourceName: string;
  sourceUrl: string;
  name: string;
  address: string;
  province: string | null;
  district: string | null;
  regionKey: string | null;
  operatorName: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  rawText: string;
  normalizedName: string;
  normalizedAddress: string;
  normalizedOperatorName: string | null;
  sourceKind: SourceKind;
}
```

Add duplicate cluster and review decision shapes:

```ts
export interface DuplicateCluster {
  duplicateStatus: DuplicateStatus;
  canonicalKey: string;
  memberKeys: string[];
  reason: string;
}

export interface ReviewVerdict {
  parkGolfVerdict: ParkGolfVerdict;
  decision: ReviewDecision;
  reason: string;
}

export function isParkGolfVenue(input: {
  name: string;
  rawText: string;
  sourceName: string;
  sourceUrl: string;
}): boolean;

export function clusterDuplicates(inputs: NormalizedFacilityCandidate[]): DuplicateCluster[];
```

- [ ] **Step 2: Export the bot domain surface**

Re-export these types from `packages/shared/src/index.ts` so the bot, DB package, and tests import from a single stable entrypoint.

- [ ] **Step 3: Write the shared classification tests**

Add tests for:
- exact duplicate clustering by normalized URL or content hash
- probable duplicate clustering by normalized name/address/operator similarity
- park-golf rejection when the source only says `골프장`
- park-golf confirmation when official text says `파크골프장`

Example:

```ts
import { describe, expect, it } from "vitest";
import { isParkGolfVenue } from "../src/bot-domain";

it("rejects ordinary golf venues without park golf evidence", () => {
  expect(
    isParkGolfVenue({
      name: "OO파크골프클럽",
      rawText: "골프장 안내",
      sourceName: "example",
      sourceUrl: "https://example.com",
    }),
  ).toBe(false);
});
```

- [ ] **Step 4: Verify the shared package**

Run:

```bash
npm --workspace packages/shared test
npm --workspace packages/shared run typecheck
```

Expected:
- bot-domain tests pass
- the package compiles

- [ ] **Step 5: Commit**

```bash
git add packages/shared
git commit -m "feat: add shared bot verdict and normalization types"
```

---

### Task 3: Extend the Prisma schema with staging tables and retention metadata

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/staging-repository.ts`
- Create: `packages/db/test/staging-schema.test.ts`

- [ ] **Step 1: Add staging models to the schema**

Extend the schema with these tables:
- `StagingRun`
- `StagingSource`
- `StagingFacilityRecord`
- `StagingReservationRecord`
- `StagingDecision`
- `StagingDuplicateCluster`

Use explicit relations and indexes so the bot can query by run, source, and canonical record quickly.

Suggested fields:

```prisma
model StagingRun {
  id        String   @id @default(cuid())
  scope     String
  status    String
  startedAt DateTime @default(now())
  endedAt   DateTime?
  statsJson Json?
}

model StagingSource {
  id         String   @id @default(cuid())
  runId      String
  sourceName String
  sourceUrl  String
  sourceKind String
  contentHash String
  fetchedAt  DateTime @default(now())
}
```

The record tables should store only the extracted fields needed for review and promotion, not full HTML snapshots.

Add the record tables with these core fields:

```prisma
model StagingFacilityRecord {
  id                   String   @id @default(cuid())
  runId                String
  sourceId             String
  sourceKey            String
  name                 String
  address              String
  province             String?
  district             String?
  regionKey            String?
  operatorName         String?
  phone                String?
  lat                  Float?
  lng                  Float?
  rawText              String
  normalizedName       String
  normalizedAddress    String
  normalizedOperatorName String?
  contentHash          String
  parkGolfVerdict      String
  duplicateStatus      String
}

model StagingReservationRecord {
  id                   String   @id @default(cuid())
  facilityRecordId     String
  methodType           String
  methodText           String
  priority             Int
  ruleText             String?
  url                  String?
  notes                String?
}
```

- [ ] **Step 2: Add the staging repository helpers**

Implement helper functions in `packages/db/src/staging-repository.ts`:
- `createStagingRun()`
- `finishStagingRun()`
- `insertStagingSource()`
- `insertFacilityRecord()`
- `insertReservationRecord()`
- `insertDuplicateCluster()`
- `insertDecision()`
- `listOpenRuns()`
- `deleteExpiredStagingData()`

These should stay small and return plain data objects for the bot pipeline.

- [ ] **Step 3: Add schema validation tests**

Write tests that verify:
- every staging table has the expected foreign keys
- run metadata can be created and closed
- `contentHash` is indexed for dedupe checks
- retention deletion only touches staging tables

- [ ] **Step 4: Verify the schema**

Run:

```bash
npm --workspace packages/db run prisma:validate
npm --workspace packages/db test
```

Expected:
- Prisma validates
- staging repository tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/src/staging-repository.ts packages/db/test
git commit -m "feat: add staging tables for the collection bot"
```

---

### Task 4: Implement source adapters and the fetch pipeline

**Files:**
- Create: `apps/bot/src/sources/source-registry.ts`
- Create: `apps/bot/src/sources/source-types.ts`
- Create: `apps/bot/src/sources/official.ts`
- Create: `apps/bot/src/sources/mcst.ts`
- Create: `apps/bot/src/sources/parkgolf24.ts`
- Create: `apps/bot/src/sources/kakao.ts`
- Create: `apps/bot/src/pipeline/fetch.ts`
- Create: `apps/bot/src/pipeline/stage.ts`
- Create: `apps/bot/test/fetch.test.ts`
- Create: `apps/bot/test/stage.test.ts`

- [ ] **Step 1: Define the source contract**

Each source adapter should produce a list of raw source entries with only the fields required by staging:

```ts
export interface SourceRecord {
  sourceName: string;
  sourceUrl: string;
  sourceKind: SourceKind;
  contentHash: string;
  rawText: string;
  extractedName: string | null;
  extractedAddress: string | null;
  extractedOperatorName: string | null;
  extractedPhone: string | null;
  extractedReservationText: string | null;
}
```

- [ ] **Step 2: Build a source registry**

`source-registry.ts` should map source names to adapters and expose a `resolveSources(scope)` helper. The scope input should support:
- `national`
- a single region group
- a source-only refresh

- [ ] **Step 3: Implement the fetch command**

The fetch step should:
- resolve active sources from the registry
- fetch each source with the configured user agent
- compute a stable content hash
- keep a short plain-text extraction
- store only the extracted record fields in staging

Do not store full HTML or screenshots.

`stage.ts` should convert the fetch output into `StagingSource` and `StagingFacilityRecord` writes so the next pipeline stage can normalize from the database instead of from transient in-memory objects.

- [ ] **Step 4: Write fetch tests**

Use fixture-based tests to verify:
- a source adapter returns the expected source kind
- duplicate source URLs collapse to the same content hash
- the fetch pipeline stores only extracted text, not full HTML
- source resolution obeys the selected scope
- the stage step turns fetch output into `StagingSource` and `StagingFacilityRecord` rows without adding extra raw payload columns

- [ ] **Step 5: Verify the fetch path**

Run:

```bash
npm --workspace apps/bot test
npm --workspace apps/bot run typecheck
```

Expected:
- source adapter tests pass
- the fetch pipeline compiles

- [ ] **Step 6: Commit**

```bash
git add apps/bot/src/sources apps/bot/src/pipeline/fetch.ts apps/bot/test
git commit -m "feat: add source fetch adapters for the bot"
```

---

### Task 5: Implement normalization, duplicate clustering, and park-golf classification

**Files:**
- Create: `apps/bot/src/pipeline/normalize.ts`
- Create: `apps/bot/src/pipeline/review.ts`
- Create: `apps/bot/src/classification/normalize-name.ts`
- Create: `apps/bot/src/classification/normalize-address.ts`
- Create: `apps/bot/src/classification/dedupe.ts`
- Create: `apps/bot/src/classification/park-golf.ts`
- Create: `apps/bot/test/classification.test.ts`

- [ ] **Step 1: Normalize names, addresses, and operator text**

Implement canonical normalization helpers:
- trim and collapse whitespace
- normalize full-width punctuation
- strip noisy bracket suffixes
- produce stable lowercase comparison keys

The normalize step should emit `NormalizedFacilityCandidate` rows that include:
- original text
- normalized text
- parsed region fields
- geocode hints if present

- [ ] **Step 2: Implement duplicate clustering**

Use the general rule order from the bot design:
1. exact duplicate removal by URL or hash
2. probable duplicate clustering by normalized name/address/operator similarity
3. ambiguous cases stay in candidate state

Store the result in `StagingDuplicateCluster` with:
- `duplicateStatus`
- `canonicalKey`
- `memberKeys`
- `reason`

The dedupe code should treat `OO파크골프클럽` and `OO골프클럽` as different unless the surrounding evidence confirms they are the same facility and both are actually park golf.

- [ ] **Step 3: Implement park-golf classification**

The classifier should require positive evidence. A venue is confirmed only when the source text or official page explicitly indicates park golf, such as:
- `파크골프`
- `파크골프장`
- `park golf`
- public/official category data that says park golf

Explicitly reject:
- ordinary golf venues
- screen golf
- golf course / golf club text without park-golf evidence
- name-only matches where `파크` appears in the title but the source text does not confirm park golf

The classifier should emit:
- `confirmed`
- `candidate`
- `hidden`

- [ ] **Step 4: Write the classification tests**

Test cases must cover:
- name-only false positives like `OO파크골프클럽`
- official park-golf confirmation from source text
- ordinary golf rejection
- exact duplicate collapsing
- probable duplicate grouping
- ambiguous cases staying unresolved

- [ ] **Step 5: Verify classification**

Run:

```bash
npm --workspace apps/bot test
npm --workspace apps/bot run typecheck
```

Expected:
- duplicate and park-golf classifier tests pass
- the package compiles

- [ ] **Step 6: Commit**

```bash
git add apps/bot/src/pipeline apps/bot/src/classification apps/bot/test
git commit -m "feat: add normalization and park golf classification"
```

---

### Task 6: Implement review, promotion, cleanup, and the end-to-end bot run

**Files:**
- Create: `apps/bot/src/pipeline/promote.ts`
- Create: `apps/bot/src/pipeline/cleanup.ts`
- Create: `apps/bot/src/pipeline/run.ts`
- Create: `apps/bot/test/pipeline.test.ts`

- [ ] **Step 1: Wire the review step**

The review step should:
- read normalized candidates
- apply duplicate cluster results
- apply park-golf verdicts
- write a staging decision for every candidate
- only mark records as `confirmed` when both classification and operational rules are satisfied

Operational rules:
- `status` must be active for promotion
- records with unclear address or non-park-golf evidence stay out of promotion
- reservation info may be incomplete, but the record must still be park golf and active

- [ ] **Step 2: Wire the promotion step**

Promotion should upsert only approved records into:
- `Facility`
- `FacilityPricing`
- `ReservationInfo`
- `ReservationMethod`

Promotion must:
- preserve existing production rows when the staged record is not stronger
- keep reservation methods ordered by `priority`
- write `sourceName`, `sourceUrl`, and `lastCheckedAt`

- [ ] **Step 3: Wire the cleanup step**

Cleanup should:
- delete staging runs older than the configured retention window
- remove expired staging rows across source, facility, reservation, decision, and duplicate tables
- keep the production tables untouched

Use the default 7-day retention for staging data and keep run metadata long enough to debug recent bot executions.

- [ ] **Step 4: Wire the full run command**

The `run` command should execute:
1. `fetch`
2. `stage`
3. `normalize`
4. `review`
5. `promote`
6. `cleanup`

Support a dry-run mode in tests so the command can be verified without mutating the production tables.

- [ ] **Step 5: Add the end-to-end pipeline tests**

Cover these cases:
- a confirmed park-golf facility is promoted
- a non-park-golf golf club is rejected
- a duplicate exact source entry does not create two production rows
- cleanup removes old staging rows but leaves production rows intact
- `bot run` executes the full pipeline in order

- [ ] **Step 6: Verify the bot**

Run:

```bash
npm run bot:run
npm run bot:cleanup
npm run test
npm run lint
npm run typecheck
```

Expected:
- the CLI executes
- the pipeline tests pass
- the workspace typechecks and lints cleanly

- [ ] **Step 7: Commit**

```bash
git add apps/bot/src/pipeline apps/bot/test
git commit -m "feat: add the end-to-end collection bot pipeline"
```

---

## Spec coverage check

- CLI-first bot execution: Task 1
- Shared bot domain types: Task 2
- Staging tables and retention: Task 3
- Source adapters and fetch: Task 4
- Normalization and duplicate clustering: Task 5
- Park-golf classification including name-only false positives: Task 5
- Review, promotion, and cleanup: Task 6
- End-to-end run command: Task 6

## Plan-level risks
- Source parsing may need a single lightweight HTML parsing dependency if the source pages cannot be extracted safely with the minimal runtime tooling; keep that dependency isolated to `apps/bot`.
- The staging schema and the production schema must stay aligned; change both in the same task when a field is promoted from staging to production.
- Park-golf classification must stay conservative; if the source evidence is weak, prefer `candidate` or `hidden` over promotion.
- The bot must not start writing large raw snapshots to disk because local storage is limited.
