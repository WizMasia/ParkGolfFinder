# ParkGolfFinder Rebuild Implementation Plan (Zero-Kakao-Key Compatible)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ParkGolfFinder from scratch into a senior-friendly mobile-first web app backed by an accurate public-data collection bot, functioning completely without Kakao developer keys (using Leaflet/OpenStreetMap and public portal APIs) while supporting Kakao Maps when keys are supplied.

**Architecture:** A unified TypeScript monorepo with `apps/web` (Next.js 15, React 19, Tailwind CSS, Leaflet/OpenStreetMap map), `apps/bot` (CLI pipeline fetching official public portal datasets and promoting verified outdoor facilities), `packages/db` (Prisma ORM with PostgreSQL), and `packages/shared` (regional definitions, geodistance math, classification rules).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Leaflet, React-Leaflet, Prisma, PostgreSQL, Vitest

**Spec:** `docs/superpowers/specs/2026-09-18-parkgolffinder-rebuild-design.md`

## Global Constraints

- Senior-friendly typography: Body font size >= 17px, title >= 20px, high contrast (min dark text #0F172A on light #FFFFFF/#F8FAFC).
- Zero-Kakao-Key functionality: The web app and map MUST render and work fully without any Kakao API keys using Leaflet and OpenStreetMap tiles.
- Zero-external-redirects in details: Facility detail view focuses on structured tables and text (no broken link-outs or external redirects).
- Phase 1 scope: Strictly outdoor regular park golf facilities (>=9 holes, turf). Exclude screen golf, indoor facilities, driving ranges, and regular CC.
- Clean database promotion: Only `confirmed` facilities from staging are promoted to active production records.

---

### Task 1: Clean Slate Setup & Leaflet Map Dependencies

**Files:**
- Modify: `apps/web/package.json`
- Modify: `package.json`
- Test: Verify dependencies install cleanly

**Interfaces:**
- Produces: `leaflet`, `@types/leaflet` in `apps/web`

- [ ] **Step 1: Update web package.json with Leaflet dependencies**
Add `leaflet` (1.9.x) and `@types/leaflet` (1.9.x) to `apps/web/package.json`.

- [ ] **Step 2: Run npm install**
Install packages across workspaces without breaking root lockfile.

- [ ] **Step 3: Verify clean build and typecheck shell**
Run `npm run typecheck` to verify the baseline workspace types.

- [ ] **Step 4: Commit**
```bash
git add package.json apps/web/package.json package-lock.json
git commit -m "chore: add leaflet map dependencies for zero-key map support"
```

---

### Task 2: Core Shared Domain - Regions, Distance & Noise Filter

**Files:**
- Modify: `packages/shared/src/regions.ts`
- Modify: `packages/shared/src/distance.ts`
- Create: `packages/shared/src/classification.ts`
- Test: `packages/shared/test/classification.test.ts`

**Interfaces:**
- Consumes: `Facility` coordinates and strings
- Produces:
  - `isOutdoorParkGolf(name: string, desc?: string): boolean`
  - `classifyRegion(province: string, district?: string): RegionKey`
  - `calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number`

- [ ] **Step 1: Write the failing test for park golf noise classifier**
Write unit tests checking that "여의도 한강 파크골프장" is TRUE, but "골프존파크 강남점", "OO골프클럽", "XX실내스크린골프" are FALSE.

- [ ] **Step 2: Run test to verify it fails**
Run `npm --workspace packages/shared test` and confirm failure.

- [ ] **Step 3: Implement classification logic in packages/shared**
Implement blacklist filters: `screen`, `golfzon`, `driving range`, `cc`, `indoor` exclusion, and require positive park golf indicators.

- [ ] **Step 4: Run test to verify it passes**
Run `npm --workspace packages/shared test` and confirm PASS.

- [ ] **Step 5: Commit**
```bash
git add packages/shared/
git commit -m "feat(shared): implement outdoor park golf filter and region mapping"
```

---

### Task 3: Official Public Data Collector Adapter (Zero-Key Bot)

**Files:**
- Create: `apps/bot/src/sources/odcloud-portal.ts`
- Modify: `apps/bot/src/pipeline/fetch.ts`
- Test: `apps/bot/test/odcloud.test.ts`

**Interfaces:**
- Consumes: `https://api.odcloud.kr` endpoints with verified default key
- Produces: Normalized `RawFacilityPayload[]` (name, address, holes, operator, lat, lng)

- [ ] **Step 1: Write test for ODCloud parsing**
Mock ODCloud JSON response for Ministry of Culture/Seoul park golf datasets and test mapping to normalized fields.

- [ ] **Step 2: Run test to verify it fails**
Run `npm --workspace apps/bot test` and confirm failure.

- [ ] **Step 3: Implement ODCloud source collector**
Write `odcloud-portal.ts` using Node `https` to fetch and extract facilities, extracting holes count and coordinates if present.

- [ ] **Step 4: Run test to verify it passes**
Run `npm --workspace apps/bot test` and confirm PASS.

- [ ] **Step 5: Commit**
```bash
git add apps/bot/src/sources/odcloud-portal.ts apps/bot/test/odcloud.test.ts
git commit -m "feat(bot): add verified ODCloud public portal collector adapter"
```

---

### Task 4: Staging Pipeline & Clean Database Promotion

**Files:**
- Modify: `apps/bot/src/pipeline/normalize.ts`
- Modify: `apps/bot/src/pipeline/review.ts`
- Modify: `apps/bot/src/pipeline/promote.ts`
- Modify: `apps/bot/src/cli.ts`
- Test: `apps/bot/test/pipeline-rebuild.test.ts`

**Interfaces:**
- Consumes: Staging data from public sources
- Produces: Clean upsert into `Facility`, `FacilityPricing`, `ReservationInfo`, `ReservationMethod`

- [ ] **Step 1: Write tests for review and deduplication**
Verify that duplicates with identical normalized names and provinces merge into a single canonical record with status `confirmed`.

- [ ] **Step 2: Run test to verify it fails**
Run test suite and verify failure.

- [ ] **Step 3: Implement normalize, review, and promotion logic**
Clean old noisy records, apply strict outdoor filtering, and upsert only `confirmed` park golf facilities.

- [ ] **Step 4: Run test to verify it passes**
Run test suite and verify PASS.

- [ ] **Step 5: Commit**
```bash
git add apps/bot/src/ apps/bot/test/
git commit -m "feat(bot): implement strict staging review and clean promotion"
```

---

### Task 5: Zero-Key Map Component (Leaflet with Kakao Fallback)

**Files:**
- Create: `apps/web/components/map/leaflet-map.tsx`
- Create: `apps/web/components/map/facility-map-view.tsx`
- Modify: `apps/web/app/globals.css` (Leaflet CSS imports)
- Test: `apps/web/test/map-view.test.ts`

**Interfaces:**
- Consumes: Facilities array `{ id, name, lat, lng, holes, feeSummary }[]`, selectedFacilityId, onSelectFacility
- Produces: Interactive mobile-friendly map with OpenStreetMap tiles and markers, working with 0 API keys.

- [ ] **Step 1: Setup Leaflet CSS and dynamic map loader**
Configure Next.js client-side dynamic import (`ssr: false`) for Leaflet to prevent window/SSR errors.

- [ ] **Step 2: Write Map View component with custom markers and popups**
Render clean green pin markers with facility name and holes, calling `onSelectFacility` on click.

- [ ] **Step 3: Test map component mounting and marker rendering**
Test that facilities with valid lat/lng render markers properly.

- [ ] **Step 4: Commit**
```bash
git add apps/web/components/map/ apps/web/app/globals.css
git commit -m "feat(web): add zero-key Leaflet OpenStreetMap view component"
```

---

### Task 6: Senior-Friendly Main Shell & List/Map View Toggle

**Files:**
- Create: `apps/web/components/home/view-toggle.tsx`
- Create: `apps/web/components/home/facility-card.tsx`
- Modify: `apps/web/app/page.tsx`
- Test: `apps/web/test/home-ui.test.ts`

**Interfaces:**
- Produces: Responsive mobile-first screen with [목록으로 보기] / [지도로 모아보기] toggle, high-contrast typography, large touch targets (min 48px).

- [ ] **Step 1: Write senior-friendly facility card component**
Card displays: Facility Name (bold 20px), Distance badge (e.g. 2.4 km), Holes (18홀), Fee summary ("무료" or "2,000원"), Address.

- [ ] **Step 2: Implement View Toggle component**
Segmented control switching between 'list' and 'map' modes with clear icons and text.

- [ ] **Step 3: Integrate List & Map views on Main Page**
Ensure smooth switching without losing scroll or filter state.

- [ ] **Step 4: Commit**
```bash
git add apps/web/components/home/ apps/web/app/page.tsx
git commit -m "feat(web): implement senior-friendly main page with list/map toggle"
```

---

### Task 7: Regional Tabs & Distance Slider Controls

**Files:**
- Create: `apps/web/components/home/region-filter-tabs.tsx`
- Create: `apps/web/components/home/distance-filter-bar.tsx`
- Modify: `apps/web/app/page.tsx`
- Test: `apps/web/test/filter.test.ts`

**Interfaces:**
- Produces: Regional tabs ([전체], [수도권], [강원], [충청], [호남], [영남], [제주]), browser geolocation acquisition, distance filtering (5km / 10km / 20km / 전체).

- [ ] **Step 1: Implement Region Tabs with high-contrast active state**
Large touchable pills with clear indicator.

- [ ] **Step 2: Implement Distance Filter bar with GPS trigger**
Button to "내 위치 주변 (10km)", falling back gracefully to Seoul City Hall coordinates if location access is denied.

- [ ] **Step 3: Test combined filtering**
Test filtering by region and distance in client search helper.

- [ ] **Step 4: Commit**
```bash
git add apps/web/components/home/ apps/web/app/page.tsx
git commit -m "feat(web): add regional tabs and distance filters"
```

---

### Task 8: Structured Facility Detail Page (Information-First)

**Files:**
- Create: `apps/web/app/facility/[id]/page.tsx`
- Create: `apps/web/components/detail/reservation-table.tsx`
- Create: `apps/web/components/detail/pricing-table.tsx`
- Create: `apps/web/components/detail/facility-spec-table.tsx`
- Test: `apps/web/test/facility-detail.test.ts`

**Interfaces:**
- Consumes: Facility ID from route param
- Produces: Complete facility details page with structured tables:
  1. Summary header (Name, holes, phone, address)
  2. Reservation rules table (Method, booking schedule, resident priority)
  3. Pricing table (Regular fee, senior discount 만 65세 이상, exemptions)
  4. Facility specifications (Holes, turf type, amenities, closed days)
  5. Mini Leaflet map showing the exact course location

- [ ] **Step 1: Write detail tables (Reservation, Pricing, Specs)**
Clean tables with senior-readable text (18px), clear row borders, and no external link requirements.

- [ ] **Step 2: Implement facility detail page route**
Fetch facility with pricing and reservation relations from database.

- [ ] **Step 3: Test detail page rendering and fallbacks**
Verify graceful handling when senior discount or reservation details are omitted.

- [ ] **Step 4: Commit**
```bash
git add apps/web/app/facility/ apps/web/components/detail/
git commit -m "feat(web): implement information-first facility detail page"
```

---

### Task 9: Data Refresh & Production Build Verification

**Files:**
- Modify: `packages/db/prisma/seed.ts`
- Run: Full build & test across all workspaces

- [ ] **Step 1: Run collector bot to seed verified public facilities**
Populate database with clean outdoor park golf courses.

- [ ] **Step 2: Run all tests**
`npm run test` across all workspaces.

- [ ] **Step 3: Run production build**
`npm run build:web` to verify SSR and zero bundle errors.

- [ ] **Step 4: Commit**
```bash
git add packages/db/
git commit -m "chore: verify production build and seed data"
```

