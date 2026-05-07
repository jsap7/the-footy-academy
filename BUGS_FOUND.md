# Bugs found during cleanup + monorepo restructure playtest

Discovered while smoke-testing the merged phase-6 (the season) + dashboard
revamp on branch `cleanup-and-monorepo-restructure`. None block the build,
lint, or basic playthrough — but they're worth a follow-up before serious
playtesting.

## Low — Dashboard scrolls when a challenge is active

**Severity:** low
**Where:** [apps/game/src/components/Dashboard.tsx](apps/game/src/components/Dashboard.tsx) and
[apps/game/src/components/ChallengeProgressWidget.tsx](apps/game/src/components/ChallengeProgressWidget.tsx)

The dashboard fits 1280×800 without scrolling on a fresh game. Once a
challenge is active, both the global `ChallengeStickyBar` (under the topbar)
**and** the dashboard-only `ChallengeProgressWidget` render — the widget alone
adds ~108px so the dashboard ends up at ~774px in a ~666px main area (with
sticky bar present), causing the bottom row of compact cards (goals,
achievements, reputation footer) to scroll out.

The two views are visually redundant: the sticky bar already shows the title,
description, progress, and weeks-remaining. Two fixes worth considering:

1. Drop the dashboard widget entirely when the sticky bar is visible (which
   is always while a challenge is active).
2. Make `ChallengeProgressWidget` a compact one-line variant when rendered on
   the dashboard.

The merge instructions explicitly asked to land the widget in the reserved
slot, so I left it. Easy revisit later.

## Low — Save/load forwards-compat after schema changes

**Severity:** low
**Where:** [apps/game/src/game/save.ts](apps/game/src/game/save.ts)

`saveVersion: 2` blobs from the `phase-6-the-season` work hold up across the
merge with the dashboard revamp (same shape — phase 6 added fields, dashboard
revamp didn't touch state). Worth a manual smoke when phase 8+ adds new state
fields: load an old save and confirm missing-field defaults don't crash the
turn loop.

## Notes (not bugs)

- `pnpm format:check` initially failed because the root-level
  `.prettierignore` wasn't visible to the per-package prettier run; moved to
  `apps/game/.prettierignore`. Resolved.
- Two TS errors in `turnLoop.ts` (`number` not assignable to
  `1 | 2 | 3 | 4`) were inherited from `phase-7-weekly-polish` and blocked
  `pnpm build` until cast on the `currentWeek` increment. Resolved.
- One `react-hooks/set-state-in-effect` lint error was inherited from the
  phase-6 challenge auto-draw effect. The setState is intentional (effect
  runs at most once per year and the value is persisted to localStorage), so
  added a targeted eslint-disable with a comment explaining why useMemo
  doesn't replace it.
