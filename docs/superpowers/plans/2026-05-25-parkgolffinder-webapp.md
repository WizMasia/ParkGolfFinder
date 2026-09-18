# ParkGolfFinder Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app that lets users search park golf facilities by name, region, and distance, then inspect reservation and fee details in a lightweight facility-first UI.

**Architecture:** A single Next.js app serves the user-facing UI, backed by a shared Prisma/PostgreSQL data layer and a small shared domain package for region, distance, and filtering rules. Search and ranking logic stays in pure TypeScript utilities so it can be tested independently of the UI and reused by the bot later.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, Tailwind CSS, Vitest

---

## File structure to create

- `package.json` — root workspace scripts and shared tooling entrypoints
- `apps/web/` — Next.js user-facing app
- `packages/db/` — Prisma schema, DB client, and repository helpers
- `packages/shared/` — enums, region mapping, distance math, and search/filter logic
- `.env.example` — local environment variable template
- `docs/superpowers/plans/2026-05-25-parkgolffinder-bot-design.md` — existing bot design reference

---

### Task 1: Bootstrap the workspace and the web app shell

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.env.example`
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/facilities/[id]/page.tsx`
- Create: `apps/web/components/`
- Create: `apps/web/lib/`
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`

- [ ] **Step 1: Add the workspace entrypoints and scripts**

Use a root `package.json` with workspaces for `apps/web`, `packages/db`, and `packages/shared`. Add scripts that will be used later by every task:

```json
{
  "name": "parkgolffinder",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:web": "npm --workspace apps/web run dev",
    "build:web": "npm --workspace apps/web run build",
    "dev:db": "npm --workspace packages/db run prisma:studio",
    "lint": "npm --workspaces run lint",
    "test": "npm --workspaces run test",
    "typecheck": "npm --workspaces run typecheck"
  }
}
```

The workspace installation must place these packages in the matching workspaces:

- `apps/web`: `next`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`
- `packages/db`: `prisma`, `@prisma/client`
- `packages/shared`: `vitest`, `typescript`, `@types/node`
- root tooling: `eslint`, `eslint-config-next`, `prettier`

`tsconfig.base.json` should define workspace aliases so imports are stable from day one:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@parkgolf/shared": ["packages/shared/src/index.ts"],
      "@parkgolf/shared/*": ["packages/shared/src/*"],
      "@parkgolf/db": ["packages/db/src/index.ts"],
      "@parkgolf/db/*": ["packages/db/src/*"]
    }
  }
}
```

`.env.example` should contain exactly the variables the web app and DB package need:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parkgolffinder"
NEXT_PUBLIC_KAKAO_MAP_API_KEY=""
```

`apps/web/package.json` should expose `dev`, `build`, `lint`, `test`, and `typecheck`.
`packages/shared/package.json` should expose `lint`, `test`, and `typecheck`.

- [ ] **Step 2: Create the web app shell**

Use `apps/web/app/layout.tsx` and `apps/web/app/page.tsx` to render a minimal shell with a header, a search area, a results region, and a detail panel placeholder. Keep the first version static so the later data layer can be wired in cleanly.

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">ParkGolfFinder</h1>
        <p className="text-sm text-slate-600">시설 목록과 예약정보를 먼저 보여주는 웹앱</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-xl border p-4">
          <h2 className="mb-3 text-sm font-semibold">검색 / 필터</h2>
          <p className="text-sm text-slate-600">시설명, 권역, 거리, 경로우대</p>
        </aside>
        <div className="rounded-xl border p-4">
          <h2 className="mb-3 text-sm font-semibold">목록 / 상세</h2>
          <p className="text-sm text-slate-600">거리 순 목록과 선택 시설 상세를 표시</p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify the app boots**

Run:

```bash
npm install
npm run dev:web
```

Expected:
- Next.js starts cleanly
- The home page renders the shell without runtime errors

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.base.json apps/web
git commit -m "chore: bootstrap the web app shell"
```

---

### Task 2: Define shared domain types and regional mapping

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/domain.ts`
- Create: `packages/shared/src/regions.ts`
- Create: `packages/shared/src/distance.ts`
- Create: `packages/shared/src/search-state.ts`
- Create: `packages/shared/test/distance.test.ts`
- Create: `packages/shared/test/regions.test.ts`
- Create: `packages/shared/test/search-state.test.ts`

- [ ] **Step 1: Define the shared enums and data contracts**

Use `packages/shared/src/domain.ts` as the source of truth for the UI and future bot:

```ts
export type FacilityType = "outdoor" | "indoor";
export type FacilityStatus = "active" | "hidden";
export type Ownership = "public" | "private";
export type FeeType = "free" | "paid" | "partial" | "inquiry";
export type ReservationMethodType =
  | "phone"
  | "internet_first_come"
  | "internet_lottery"
  | "visit"
  | "none";
```

Add the basic facility/query types used by the UI:

```ts
export interface FacilitySummary {
  id: string;
  name: string;
  address: string;
  province: string | null;
  district: string | null;
  regionKey: string;
  facilityType: FacilityType;
  status: FacilityStatus;
  ownership: Ownership;
  lat: number;
  lng: number;
  baseFeeText: string;
  concessionFeeText?: string | null;
  distanceKm?: number;
}
```

Keep the search state in the same package so the web app and the future bot read identical filter semantics:

```ts
export interface SearchState {
  query: string;
  regionGroup: "capital" | "gangwon" | "chungcheong" | "honam" | "yeongnam" | "jeju" | null;
  distanceKm: number;
  concessionOn: boolean;
  facilityType: FacilityType | null;
  feeFilter: FeeType | null;
  currentLocation: { lat: number; lng: number } | null;
}
```

`packages/shared/package.json` should expose these exact scripts:

- `lint`: `eslint src test`
- `test`: `vitest run`
- `typecheck`: `tsc -p tsconfig.json --noEmit`

- [ ] **Step 2: Define the 광역권역 mapping**

Implement `packages/shared/src/regions.ts` as a pure lookup table. It should map `regionKey` values to the six display tabs:

```ts
export const REGION_GROUPS = {
  capital: ["seoul", "gyeonggi", "incheon"],
  gangwon: ["gangwon"],
  chungcheong: ["chungbuk", "chungnam", "daejeon", "sejong"],
  honam: ["gwangju", "jeonbuk", "jeonnam"],
  yeongnam: ["busan", "daegu", "ulsan", "gyeongbuk", "gyeongnam"],
  jeju: ["jeju"],
} as const;
```

- [ ] **Step 3: Implement distance math**

Use a pure haversine helper in `packages/shared/src/distance.ts` so both the UI and the bot can reuse it:

```ts
export function haversineKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

- [ ] **Step 4: Write the first tests**

Add tests for:
- group membership for `capital`, `honam`, and `yeongnam`
- distance monotonicity

Example:

```ts
import { describe, expect, it } from "vitest";
import { haversineKm } from "../src/distance";

it("returns a smaller number for a closer point", () => {
  const origin = { lat: 37.5665, lng: 126.978 };
  expect(haversineKm(origin, { lat: 37.567, lng: 126.979 })).toBeLessThan(
    haversineKm(origin, { lat: 37.59, lng: 127.0 }),
  );
});
```

- [ ] **Step 5: Verify the shared package**

Run:

```bash
npm --workspace packages/shared test
npm --workspace packages/shared run typecheck
```

Expected:
- tests pass
- shared types compile

- [ ] **Step 6: Commit**

```bash
git add packages/shared
git commit -m "feat: add shared facility and region primitives"
```

---

### Task 3: Create the Prisma data layer for facilities, pricing, and reservations

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/prisma/.env`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/facility-repository.ts`
- Create: `packages/db/test/schema.test.ts`

- [ ] **Step 1: Define the Prisma schema around the agreed model**

Model the five core entities exactly as the spec says:
- `Facility`
- `FacilityPricing`
- `ReservationInfo`
- `ReservationMethod`
- `FacilitySnapshot`

Keep `province`, `district`, and `regionKey` on `Facility` as derived fields because the UI filters on them often.

Minimum field set to encode:

```prisma
model Facility {
  id            String   @id @default(cuid())
  name          String
  address       String
  province      String?
  district      String?
  regionKey     String
  facilityType  String
  status        String
  ownership     String
  operatorName  String
  phone         String?
  lat           Float
  lng           Float
  sourceName    String
  sourceUrl     String?
  lastCheckedAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

Add relation tables for pricing and reservation info as separate models so the UI can load them independently.

Encode these relation rules explicitly:

- `Facility` has exactly one `FacilityPricing`
- `Facility` has exactly one `ReservationInfo`
- `ReservationInfo` has zero or more `ReservationMethod`
- `FacilitySnapshot` may point at a `Facility`, but it can also exist as a raw import artifact before promotion

Add unique constraints and indexes so the repository helpers can safely upsert:

- `FacilityPricing.facilityId` unique
- `ReservationInfo.facilityId` unique
- `ReservationMethod.reservationInfoId` indexed and ordered by `priority`
- `FacilitySnapshot.facilityId` indexed, not unique

- [ ] **Step 2: Add a thin Prisma client wrapper**

Create `packages/db/src/client.ts` that exports a singleton Prisma client for app runtime and tests.

- [ ] **Step 3: Add repository helpers**

Implement small query helpers in `packages/db/src/facility-repository.ts`:
- `findFacilitiesByQuery()`
- `findFacilityById()`
- `listFacilitiesByRegionGroup()`
- `listNearbyFacilities()`

Each helper should return a UI-ready shape instead of raw Prisma records:

- facility basics
- fee summary
- reservation summary
- reservation methods ordered by `priority`
- `distanceKm` when the query is distance-aware

These should return plain objects already shaped for the UI rather than raw Prisma records.

`packages/db/package.json` should expose these exact scripts:

- `prisma:validate`: `prisma validate`
- `prisma:studio`: `prisma studio`
- `test`: `vitest run`
- `typecheck`: `tsc -p tsconfig.json --noEmit`

- [ ] **Step 4: Verify the schema compiles**

Run:

```bash
npm --workspace packages/db run prisma:validate
npm --workspace packages/db test
```

Expected:
- Prisma schema validates
- repository helpers typecheck

- [ ] **Step 5: Commit**

```bash
git add packages/db
git commit -m "feat: add the core facility prisma schema"
```

---

### Task 4: Implement search, ranking, and distance filtering

**Files:**
- Create: `apps/web/lib/facility-search.ts`
- Create: `apps/web/lib/search-state.ts`
- Create: `apps/web/lib/seoul-fallback.ts`
- Create: `apps/web/lib/user-location.ts`
- Create: `apps/web/test/facility-search.test.ts`
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Encode the search-state rules**

Represent search state as one object with `query`, `regionGroup`, `distanceKm`, `concessionOn`, `feeFilter`, `facilityType`, and `currentLocation`.

Keep the filter behavior aligned with the spec:
- all selected filters are ANDed together
- location-enabled mode uses distance first
- location-disabled mode uses the Seoul City Hall fallback point
- `regionGroup` is expanded to `regionKeys` with `REGION_GROUPS` before the repository query runs

`apps/web/lib/seoul-fallback.ts` should export the exact fallback coordinate pair and label used everywhere in the app:

```ts
export const SEOUL_CITY_HALL = {
  lat: 37.5662952,
  lng: 126.9779451,
  label: "서울시청",
} as const;
```

- [ ] **Step 2: Implement the ranking function**

Write the search helper so it:
- filters out `hidden` facilities
- filters out non-`active` facilities
- filters by query against `name`, `address`, and `operatorName` using a case-insensitive substring match
- filters by the selected region group after expanding it to `regionKeys`
- filters by `facilityType` when it is set
- filters by `feeFilter` against the derived display fee type, not against the raw fee text
- computes distance from either current location or Seoul City Hall
- sorts by distance, then by name
- returns in-range results if any exist
- otherwise returns the closest 10 facilities
- attaches `distanceKm` to every returned item so the card can render without recomputing

Skeleton:

```ts
export function rankFacilities(input: {
  facilities: FacilitySummary[];
  query: string;
  regionKeys: string[];
  distanceKm: number;
  currentLocation: { lat: number; lng: number } | null;
  concessionOn: boolean;
  feeFilter: FeeType | null;
}): FacilitySummary[] {
  // filter -> enrich with distance -> sort -> trim/fallback
}
```

- [ ] **Step 3: Write the search tests first**

Use test cases for:
- 10km in-range facilities only
- fallback to nearest 10 when no result is in range
- same-distance tie broken by name
- `hidden` facilities never appear
- concession toggle only changes presentation values

Example expected behavior:

```ts
expect(
  rankFacilities({
    facilities,
    query: "",
    regionKeys: REGION_GROUPS.capital,
    distanceKm: 10,
    currentLocation: { lat: 37.5665, lng: 126.978 },
    concessionOn: false,
    feeFilter: null,
  }),
).toEqual(["A Park Golf", "B Park Golf"]);
```

- [ ] **Step 4: Wire the home page to the search helper**

Update `apps/web/app/page.tsx` so the list screen renders:
- search input
- distance slider
- concession toggle
- region group tabs
- result cards

Keep the UI simple and focused on the three-card fields:
- name
- distance
- fee summary

- [ ] **Step 5: Verify search behavior**

Run:

```bash
npm --workspace apps/web test
npm --workspace apps/web run typecheck
```

Expected:
- search unit tests pass
- the page compiles with the helper wired in

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib apps/web/test apps/web/app/page.tsx
git commit -m "feat: add facility search and distance ranking"
```

---

### Task 5: Build the detail view, reservation sections, and map placeholder

**Files:**
- Create: `apps/web/components/facility-card.tsx`
- Create: `apps/web/components/facility-filters.tsx`
- Create: `apps/web/components/distance-slider.tsx`
- Create: `apps/web/components/concession-toggle.tsx`
- Create: `apps/web/components/region-tabs.tsx`
- Create: `apps/web/components/facility-detail-summary.tsx`
- Create: `apps/web/components/reservation-method-list.tsx`
- Create: `apps/web/components/fee-summary.tsx`
- Create: `apps/web/components/facility-map.tsx`
- Create: `apps/web/app/facilities/[id]/page.tsx`
- Create: `apps/web/lib/facility-detail.ts`
- Create: `apps/web/test/detail-view.test.tsx`

- [ ] **Step 1: Render the detail page with the required order**

The detail page must follow the spec order:
1. summary
2. reservation info
3. fee / concession
4. map
5. operator / contact

The summary section should show:
- facility name
- address
- distance
- fee summary
- reservation method summary

The reservation method summary should join method tags in priority order with `·` for the compact header line, for example `인터넷(선착순) · 전화`.

Load the detail data through one server-side helper in `apps/web/lib/facility-detail.ts` so components stay presentation-only.

- [ ] **Step 2: Show reservation methods as tags plus expandable detail**

Use the `ReservationMethod` data to render tag chips in priority order.
If multiple methods exist, show them all.
If a method is `none`, render it as `예약불가` and keep it visually separate from active reservation methods.

If a facility has no reservation methods yet, show the muted line `예약 정보 확인 필요` instead of an empty section.

- [ ] **Step 3: Add the map placeholder first**

Because the spec says the map is secondary, the initial detail page can use a lightweight client component that renders:
- selected facility marker label
- latitude / longitude text
- future Kakao map mount point

Do not block the rest of the page on map loading.

`apps/web/components/facility-map.tsx` should be a client component that only loads the Kakao SDK after confirming `NEXT_PUBLIC_KAKAO_MAP_API_KEY` exists. If the key is missing, it should render the fallback label and coordinates and stop there.

- [ ] **Step 4: Add presentation tests**

Test that the detail page renders sections in the right order and that reservation tags preserve `priority`.

- [ ] **Step 5: Verify the app build**

Run:

```bash
npm run build:web
```

Expected:
- the app compiles
- the detail page route builds successfully

- [ ] **Step 6: Commit**

```bash
git add apps/web/components apps/web/app/facilities apps/web/test
git commit -m "feat: add facility detail sections and map shell"
```

---

### Task 6: Seed development data and finish the verification loop

**Files:**
- Create: `packages/db/prisma/seed.ts`
- Create: `apps/web/test/smoke.test.ts`

- [ ] **Step 1: Seed a small realistic dataset**

Add a handful of facilities that cover the important branches:
- one active outdoor facility with phone booking
- one active facility with internet lottery
- one hidden facility
- one facility with concession fee text
- one facility with multiple reservation methods

The seed set must cover at least one facility in each of these region groups:
- `capital`
- `chungcheong`
- `yeongnam`

Make the seed script idempotent by upserting on a stable key derived from `name + address`.

- [ ] **Step 2: Add a smoke test for the public flow**

Check that:
- the home page loads
- the list renders
- the detail page route works
- no hidden facilities appear in the public list
- the Seoul fallback coordinate is used when the location hook returns `null`

- [ ] **Step 3: Run the full checks**

Run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build:web
```

Expected:
- all checks pass

- [ ] **Step 4: Commit**

```bash
git add packages/db/prisma/seed.ts apps/web/test
git commit -m "test: verify the web app end to end"
```

---

## Spec coverage check

- Facility-first browsing: Tasks 1, 4, 5
- Distance filter and Seoul fallback: Tasks 2, 4
- Region tabs: Tasks 2, 4
- Fee / concession display: Tasks 2, 5
- Reservation methods with multiple values: Tasks 3, 5
- Hidden/active visibility rules: Tasks 3, 4, 6
- Map as secondary view: Task 5
- Internal storage separation: Tasks 3, 6

## Plan-level risks
- The repo currently has no application code, so bootstrap mistakes can cascade; keep Task 1 extremely small and verify each workspace package before expanding.
- The Prisma schema and the UI must agree on enum strings; avoid inventing new values while implementing later tasks.
- The bot is a separate plan and should not leak into this web app build except through shared DB and shared domain types.
