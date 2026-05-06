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
  components/   React components (top bar, lists, detail views, scout/shortlist pages)
  data/         Static datasets (name lists, trait library)
  game/         Game logic (generators, finance, turn loop, actions)
  types/        TypeScript types (Player, Scout, GameState, ...)
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

## What's shipped (phases 0 → 2a)

**Phase 0 — engine baseline.** `Player` data model (38 outfield stats × current/potential), English name generator, player generator, list + side-panel detail view.

**Phase 1 — traits.** 12-trait library (5 positive, 4 negative, 3 neutral), weighted roll per player, base-stat effects applied to current and/or potential, color-coded pill UI with hover/click descriptions.

**Phase 1.5 — generator overhaul.** Hidden quality tier per player (mid / good / great / elite / generational) drives stat-band rolls and trait-count weights. Position bonuses bumped to +20 on a wider relevant-stats list. Age decoupled from potential (potential is age-independent; current scales with age via a linear factor 12 → 0.40, 19 → 0.85). `late_bloomer` patched to current-only so the kid reads as raw without losing his ceiling.

**Phase 2a — bare bones loop.** Game state with cash + calendar. Scout market (5 hireable, refreshes monthly), hire/fire actions. Each hired scout surfaces 1 player per month into the shortlist, biased toward better tiers at higher scout levels. Shortlist entries expire after their lifespan ticks down. Sign a player → pays the (tier-based) fee, moves the player onto the permanent roster. Roster players cost monthly stipends. "Next Month" advances the calendar and runs the turn loop in a locked sequence.

What's intentionally **not** here yet (those land in later phases):

- Multi-region scouts and players (still England only)
- Hidden scout traits / background checks / scouting trips
- Selling players / offers from clubs
- Player aging across turns / development per turn
- Bankruptcy game over (cash can go negative; just shows red)
- Save / load
- Scout judgment affecting stat visibility (true stats are still shown)

## Keyboard shortcuts

- `[N]` — next month
- `[ESC]` — close detail panel

## Generator tuning

`scripts/sample-players.ts` is a dev-only script for eyeballing the player generator's spread:

```sh
npx tsx scripts/sample-players.ts 100
```

Prints name / age / position / avg current / avg potential / gap, then a summary block (means, ranges, position counts, age distribution).
