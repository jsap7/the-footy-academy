# The Footy Academy

A football academy management game. You scout, sign, develop, and sell young players. Always one bad transfer window from going broke.

See the v1 Design Doc in Linear for the full vision.

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/)
- TypeScript (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/) (via the official Vite plugin)
- ESLint + Prettier
- [Departure Mono](https://departuremono.com/) (self-hosted, retro-terminal aesthetic)

## Project structure

```
src/
  components/   React components (top bar, lists, detail views, scout/shortlist/offers pages, banners)
  data/         Static datasets (name lists, trait library, club library)
  game/         Game logic (generators, finance, turn loop, actions, aging, development, offers, market value)
  types/        TypeScript types (Player, Scout, Club, Offer, GameState, ...)
  ui/           Shared UI primitives (Button, Chip, SectionHead, StatusBar)
  util/         Small helpers (currency / date formatting)
  App.tsx
  main.tsx
  index.css
```

## Setup

```sh
npm install
npm run dev
```

Open the URL printed by Vite (defaults to <http://localhost:5173>).

## Scripts

| Command                | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server with HMR             |
| `npm run build`        | Type-check and produce a production build |
| `npm run preview`      | Serve the production build locally        |
| `npm run lint`         | Run ESLint over the codebase              |
| `npm run format`       | Format the codebase with Prettier         |
| `npm run format:check` | Check formatting without writing changes  |

## What's shipped (phases 0 → 3.5)

**Phase 0 — engine baseline.** `Player` data model (38 outfield stats × current/potential), English name generator, player generator, list + side-panel detail view.

**Phase 1 — traits.** 12-trait library (5 positive, 4 negative, 3 neutral), weighted roll per player, base-stat effects applied to current and/or potential, color-coded pill UI with hover/click descriptions.

**Phase 1.5 — generator overhaul.** Hidden quality tier per player (mid / good / great / elite / generational) drives stat-band rolls and trait-count weights. Position bonuses bumped to +20 on a wider relevant-stats list. Age decoupled from potential. `late_bloomer` patched to current-only so the kid reads as raw without losing his ceiling.

**Phase 2a — bare bones loop.** Game state with cash + calendar. Scout market (5 hireable, refreshes monthly). Each hired scout surfaces 1 player per month into the shortlist, biased toward better tiers at higher scout levels. Shortlist entries expire. Sign → pays the (tier-based) fee, moves player onto the permanent roster. Roster players cost monthly stipends. "Next Month" advances the calendar.

**Phase 3 — full loop (aging + development + selling).**

- Players have a `birthMonth` and age up on that month each year. Auto-released at 22. 20-21yo stipends 3×.
- Per-turn development engine: every roster player gains a small amount on each stat, biased by age curve, potential gap, and trait dev-rate effects (`workaholic`, `lazy`, `late_bloomer`, etc. all fire here for the first time).
- 20 real-named clubs across 5 tiers (Real Madrid, Liverpool, Aston Villa, Brighton, Leeds, …).
- Market value engine + buyer-perceived value with ±10% noise and tier wealth ceilings.
- Each turn, clubs may send unsolicited bids based on player quality, age, and selling state. Offers go into an inbox; you can accept (instant sale), counter (response next turn — accept / counter back / walk), or reject.
- "Available for Sale" toggle (2× offer frequency) and "List with Price" (clubs respond yes / fair-value bid / pricey-stretch / skip based on asking vs perceived value).
- Event banner shows birthdays, releases, and sales after each turn.

**Phase 3.5 — rebalance + QoL.** Five-year playtest surfaced a tuning gap and a bunch of UX papercuts; this phase closes them without adding new systems.

- Market value formula rebalanced: `pot^2.5 × 100`, plus a current/potential rating boost (raw kids price lower than polished ones at the same ceiling). Generational tier premium 2.0 → 4.0 — top sales now land around €37M. Elite premium 1.4 → 1.5.
- Development base rate 0.5 → 0.7. A 14yo signed at 50/80 reaches potential by ~19, lining up with the resale curve falling off after 19.
- Scout tier bias overhauled. L1 scouts can never surface elite/generational, L2 caps at great. L5 elite is once every ~20 months, generational once every ~17 years (`SCOUT_LEVEL_TIER_BIAS` in `src/game/scoutFind.ts`).
- Roster: sortable headers (`age`/`cur`/`pot`/`value`/`stipend`/`offers` with `^v` indicators), Market Value column, Offers column showing count + biggest active bid plus an accent rail on rows with active offers.
- Per-player Block Offers toggle (kill switch — clubs stop sending bids; mutually exclusive with Available/Listed; existing bids stay so you can resolve them).
- Shortlist rows get a Reject button alongside Sign.
- Offers page now groups by player. Group header shows player + position + age + current/potential + market value + count + status summary + best active. Expand to see per-club sub-rows; offers within a group sort by status priority then amount desc.
- Each offer sub-row shows a `±N% vs MV` line (green / neutral / red).
- Counter UI rework: their bid + market value at the top, presets for +10/+20/+30/+50% and Match MV, custom field with euro preview, send disabled until the counter is above their bid and below the club's wealth ceiling × 1.5.

What's intentionally **not** here yet:

- Multi-region scouts and players (still England only)
- Hidden scout traits / background checks / scouting trips
- Player visibility ranges (true stats are still shown)
- After-sale tracking (no notifications when ex-players resell)
- Sell-on % clauses (flat fee only)
- Bankruptcy game over (cash can go negative; just shows red)
- Save / load
- Cup competitions, sponsors, dynamic income

## Keyboard shortcuts

- `[N]` — next month
- `[ESC]` — close detail panel

## Generator tuning

`scripts/sample-players.ts` is a dev-only script for eyeballing the player generator's spread:

```sh
npx tsx scripts/sample-players.ts 100
```

Prints name / age / position / avg current / avg potential / gap, then a summary block.
