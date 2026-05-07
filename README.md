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

## What's shipped (phases 0 → 6)

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

**Phase 4 — economy overhaul.** The Phase 3.5 playtest revealed you could bank €100M by 2029 starting from nothing. Phase 4 redesigns the economy around a single pillar: *the squeeze is the engine*.

- Income crashed from €50k → €5k/mo; new €20k baseline operating cost. Net is -€15k/mo idle, so doing nothing burns through starting cash in 4 turns.
- Tier premiums on sale value crashed for low tiers and lifted for top tiers (`mid 0.04 / good 0.12 / great 0.5 / elite 2.0 / generational 6.0`). Mid kids now sell for €100–300k (was millions), generational sales hit €35M+ jackpot territory.
- 16+ rule for sales — under-16 players cannot be sold or listed, with a "locked u16" chip on the roster row. Auto-unlocks at 16th birthday.
- Scout salaries 2.5–3× across the board (L1 €5k → L5 €400k). Existing scouts grandfathered.
- Tier-based signing fees: mid €15k → generational €800k (±15% noise, locked at find time on the shortlist entry).
- Five-tier facility system (Backyard Pitch → World-Class). Each tier sets monthly cost, a development multiplier (1.0× → 1.5×), and which scout levels can surface in the market. Manual upgrades (no refund), manual downgrades (blocked if it would orphan scouts), and auto-downgrade after 2 broke months at any tier > 1 (auto path force-fires scouts above the new tier).
- Annual 3% inflation on operating costs, facility monthly + upgrade costs, signing fees, stipends, and new-hire scout salaries. Income deliberately stays flat at €5k so the squeeze tightens by year.
- Dashboard burn breakdown widget (operating / facility / stipends / scouts with ASCII bars + % of total).
- New Finances tab with cash hero, monthly net + annual run-rate, 12-month cash chart with peak/trough markers, inflated cost breakdown, and a transaction list (last ~24 months of sales / signings / scout hires + fires / facility moves / monthly burn).

**Phase 5 — make it fun.** Phase 4's squeeze worked too well — playtest hit €1M debt and "I'm just churning to stay afloat, no time to develop or get attached." Phase 5 turns on the cozy + progression pillars without abandoning the gritty one.

- Soften squeeze: monthly base income €5k → €8k, operating €20k → €15k, idle net -€7k (was -€15k).
- Per-player MV history (12 trailing months) + SVG chart in the drawer with rising / peaking / falling trend label.
- Forward MV projection at age 17/18/19 — deterministic estimate using expected dev gains, factors in current facility multiplier.
- Hold / sell / consider recommendation card with 2-4 dynamic reasoning bullets (age, offer-vs-MV %, trend, projected peak).
- 20-achievement library with mid-turn detection on sign / sell / hire / facility upgrade and end-of-turn detection on the rest. Notification chip on the event banner; dashboard widget shows count, last three unlocks, and a full list with locked items as "???".
- Academy Reputation (0-100) with seven tier labels (Unknown → Legendary), TopBar HUD pickup, and a dashboard breakdown card.
- Yearly review modal on Dec → Jan transition: finances / players / achievements unlocked / reputation delta. Computed from transactions + achievement timestamps, no extra state.
- Long-term goals widget on the dashboard: 5 goals (Tier 5 facility, €50M cash, 5 generational sales, Reputation 80, develop a player to 95% potential), reordered by progress.
- Stat milestone events (70/80/90 thresholds, batched per-player per turn).
- Youth international call-ups: ~3% monthly chance per eligible 16-19yo with avg potential ≥ 75; 12-month cooldown; +20 to +40% MV multiplier compounded (cap 2.0); chips on banner + drawer header.
- Loyalty bonus: 24+ months on roster unlocks the Veteran badge — dev rate +10%, MV ×1.15, "★ veteran" chip on roster row + drawer.

**Phase 6 — persistence + internationals.** Sessions are now durable, achievements have a home, and developing a kid into a national team finally generates real revenue.

- Save / load: localStorage auto-save on every state change with a versioned blob (`saveVersion: 1`). Top-bar Save menu with JSON export, import (refuses mismatched versions gracefully), and Reset Game (clears localStorage + reloads).
- Achievements board: dedicated tab with the 20 achievements grouped by category (Sales / Facility / Talent / Survival / Development / Misc). Locked items show as `???` with a hint line; unlocked entries show title, description, and date. Tab badge tracks the unlock count.
- National team membership replaces FOOTY-82's one-time callup bonus. Eligibility is gated by **current** avg rating at age (U17 from 65 at age 15-17, U18 from 72 at age 17-18, U21 from 78 at age 18-21, Senior from 84 at age 19+). Promotion is probabilistic each turn; demotion fires after 6 months below threshold. MV multiplier reflects **current** tier only — U17 ×1.10, U18 ×1.15, U21 ×1.25, Senior ×1.40 (no compounding).
- National team sponsorship: monthly income per called-up player (U17 €2k, U18 €4k, U21 €8k, Senior €15k), inflated at use-time. New "sponsorship" transaction type with a green chip in the Finances list. Dashboard burn widget and Finances breakdown both surface the inflow when > 0.

What's intentionally **not** here yet:

- Multi-region scouts and players (still England only — sponsorship doesn't yet vary by nationality)
- Hidden scout traits / background checks / scouting trips
- Player visibility ranges (true stats are still shown)
- After-sale tracking (no notifications when ex-players resell)
- Sell-on % clauses (flat fee only)
- Bankruptcy game over (cash can go negative; just shows red)
- Cup competitions, dynamic match income

## Keyboard shortcuts

- `[N]` — next month
- `[ESC]` — close detail panel

## Generator tuning

`scripts/sample-players.ts` is a dev-only script for eyeballing the player generator's spread:

```sh
npx tsx scripts/sample-players.ts 100
```

Prints name / age / position / avg current / avg potential / gap, then a summary block.
