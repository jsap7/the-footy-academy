# The Footy Academy

A football academy management game. You scout, sign, develop, and sell young players. Always one bad transfer window from going broke — but every season the board hands you a challenge to clear.

## Repository structure (pnpm monorepo)

```
/
├── apps/
│   ├── game/              The game (React + Vite + TS)
│   └── landing/           The marketing landing page (React + Vite + TS)
│       ├── src/
│       │   ├── components/   React components
│       │   ├── data/         Static datasets (clubs, traits, name lists)
│       │   ├── game/         Game logic (turn loop, finance, dev, ...)
│       │   ├── types/        TypeScript types
│       │   ├── ui/           Shared UI primitives
│       │   └── util/         Helpers (format, useCountUp)
│       ├── public/
│       ├── scripts/          Dev-only helpers (e.g. sample-players)
│       ├── index.html
│       └── package.json
├── packages/
│   └── shared/            Empty placeholder — will hold types/utils shared
│                          between game, landing, and api when those land.
├── package.json           Workspace root scripts (dev / build / lint / format)
├── pnpm-workspace.yaml
└── tsconfig.base.json     Shared TS compiler options
```

## Planned apps (not yet built)

- `apps/api/` — backend for auth + leaderboards.

When that lands, anything it needs to share with `apps/game` or `apps/landing` (player types, score formulas) goes into `packages/shared/`.

## Development setup

Requires Node 20+ and pnpm 10+.

```sh
pnpm install
pnpm dev
```

Open the URL printed by Vite (defaults to <http://localhost:5173>).

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `pnpm dev`             | Start the game's dev server with HMR                |
| `pnpm dev:landing`     | Start the landing page's dev server                 |
| `pnpm build`           | Type-check and produce a production build of the game |
| `pnpm build:landing`   | Production build of the landing page                |
| `pnpm lint`            | Run ESLint over the game source                     |
| `pnpm format`          | Format the codebase with Prettier                   |
| `pnpm format:check`    | Check formatting without writing changes            |

To run a script directly in any package:

```sh
pnpm --filter @footy-academy/game <script>
pnpm --filter @footy-academy/landing <script>
```

### Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/)
- TypeScript (strict mode, shared base config in `tsconfig.base.json`)
- [Tailwind CSS v4](https://tailwindcss.com/) (via the official Vite plugin)
- ESLint + Prettier
- [Departure Mono](https://departuremono.com/) (self-hosted, retro-terminal aesthetic)

## How to play

You run a small football academy in England. Every week you tick the calendar forward, develop your players, juggle bills, and try to sell talent before the squeeze gets you.

1. **Hire scouts.** Five candidates refresh in the Scouts tab every month. Higher-level scouts cost more salary but surface better tiers of player. Their level is gated by your facility tier.
2. **Sign prospects.** Each scout finds 1 player per month — they show up on the Shortlist with a signing fee. Reject the ones you don't want; they expire after a few months otherwise. Signed players go on your permanent roster and start earning monthly stipends.
3. **Develop them.** Roster players gain stat points every week, biased by their age curve, potential gap, and traits. Better facilities multiply development. After about 2 years on roster they hit Veteran status and develop +10% faster.
4. **Sell them.** Clubs send unsolicited offers. Accept (instant), counter (their response next turn), or reject. Available-for-Sale doubles offer frequency; Listing with a price filters offers against the asking. Players under 16 can't be sold.
5. **Clear the season's challenge.** Every Jan W1 the board hands you three options. Pick one and clear it by Dec W4. Clear it AND end the year in the black to pick a permanent or yearly reward; fail and the run might end.
6. **Don't go broke for too long.** Auto-downgrade kicks in after 8 weeks underwater at any facility above tier 1. Auto-downgrade also fires the scouts your new tier can't support.
7. **Develop kids into national teams.** Once a roster player crosses the U17/U18/U21/Senior thresholds for current rating + age, they get called up. Each tier adds an MV multiplier and a monthly sponsorship payout — that's where real revenue comes from.

### Keyboard shortcuts

- `[N]` — next week
- `[ESC]` — close detail panel / modal

## Major systems

| System                | Source                                            |
| --------------------- | ------------------------------------------------- |
| Player generator      | `apps/game/src/game/playerGenerator.ts`           |
| Traits library        | `apps/game/src/data/traits/library.ts`            |
| Quality tier rolls    | `apps/game/src/game/qualityTier.ts`               |
| Scouts (find + tier)  | `apps/game/src/game/scoutFind.ts`, `scoutMarket.ts` |
| Shortlist             | `apps/game/src/game/shortlist.ts`                 |
| Signing fees          | `apps/game/src/game/signingFees.ts`               |
| Aging + auto-release  | `apps/game/src/game/aging.ts`                     |
| Development           | `apps/game/src/game/development.ts`               |
| Stipends              | `apps/game/src/game/stipends.ts`                  |
| Market value + projection | `apps/game/src/game/marketValue.ts`, `projection.ts` |
| Selling + offers      | `apps/game/src/game/offers.ts`                    |
| Hold/sell recommendation | `apps/game/src/game/recommendation.ts`         |
| Facilities + tiers    | `apps/game/src/game/facilities.ts`, `types/facility.ts` |
| Inflation             | `apps/game/src/game/inflation.ts`                 |
| Finance + transactions | `apps/game/src/game/finance.ts`, `transactions.ts` |
| Achievements (~20)    | `apps/game/src/game/achievements.ts`              |
| Reputation            | `apps/game/src/game/reputation.ts`                |
| Long-term goals       | `apps/game/src/game/goals.ts`                     |
| National teams + sponsorship | `apps/game/src/game/nationalTeams.ts`      |
| Yearly review         | `apps/game/src/game/yearlyReview.ts`              |
| Stat milestones       | `apps/game/src/game/statMilestones.ts`            |
| Save / load           | `apps/game/src/game/save.ts`                      |
| Weekly turn loop      | `apps/game/src/game/turnLoop.ts`                  |
| Board challenges      | `apps/game/src/game/challenges.ts`, `challengeTracking.ts` |
| Run rewards + buffs   | `apps/game/src/game/rewards.ts`, `buffs.ts`       |
| Game over             | `apps/game/src/components/GameOverModal.tsx`      |

## Phases shipped

- **Phase 0** — engine baseline. Player data model (38 outfield stats × current/potential), name generator, list + side-panel detail view.
- **Phase 1** — traits library (12 traits, weighted rolls, base-stat effects, color-coded pill UI).
- **Phase 1.5** — generator overhaul. Hidden quality tier per player drives stat-band rolls and trait counts. Position bonuses, age decoupled from potential.
- **Phase 2a** — bare-bones loop. Cash + calendar, scout market, hired scouts surface players to the shortlist, sign moves them to the roster, monthly stipends.
- **Phase 3** — full loop. Birthdays, auto-release at 22, weekly development, 20 named clubs, market-value engine, unsolicited offers (accept / counter / reject), available-for-sale and list-with-price toggles, event banner.
- **Phase 3.5** — rebalance + QoL. MV formula tuned, scout tier bias overhauled, sortable roster, per-player Block Offers, grouped Offers page, counter UI rework.
- **Phase 4** — economy overhaul. Income / costs crashed, tier-based signing fees, 5-tier facility system, annual inflation, burn breakdown, Finances tab with cash chart and inflated breakdown.
- **Phase 5** — make it fun. Per-player MV history + chart, forward projection, hold/sell recommendation, 20 achievements, academy reputation, yearly review modal, long-term goals widget, stat milestones, youth international call-ups, Veteran badge.
- **Phase 6 — persistence + internationals.** localStorage auto-save with versioned blobs, JSON export/import, Achievements board tab, persistent national-team membership with monthly sponsorship income.
- **Phase 7 — weekly turns + interactivity polish.** Turn cadence dropped from monthly to weekly. Stipends, scout salaries, operating costs all quartered. Birthdays / aging / national-team review still fire monthly via W1 gating. Cash count-up animation on changes.
- **Phase 6 (the season).** The roguelike layer: every Jan W1 the board offers three challenges (4 difficulty tiers, scaled by year + cash + roster). Clear the challenge AND stay in the black to pick a permanent or yearly reward. Fail and the run can end (game-over modal, "start new run" preserves run history). Sticky bar shows progress across every tab.
- **Dashboard + UX revamp.** Tabs cut to 5 (Dashboard / Roster / Shortlist / Offers / Scouts). Dashboard redesigned for density: top shortlist, top offers, hired scouts, interactive cash chart with hover tooltip, compact burn / reputation / goals / achievements. Finances and Achievements moved into modal overlays reachable from the dashboard.

## Not built yet

- Multi-region scouts and players (still England only)
- Hidden scout traits / background checks / scouting trips
- Player visibility ranges (true stats are still shown)
- After-sale tracking (no notifications when ex-players resell)
- Sell-on % clauses (flat fee only)
- Cup competitions, dynamic match income
- Landing page, auth, and leaderboards backend (planned in `apps/landing` and `apps/api`)

## Generator tuning

`apps/game/scripts/sample-players.ts` eyeballs the player generator's spread:

```sh
pnpm --filter @footy-academy/game exec tsx scripts/sample-players.ts 100
```

Prints name / age / position / avg current / avg potential / gap, then a summary block.

## Notes

This is a personal project — no contribution guidelines.
