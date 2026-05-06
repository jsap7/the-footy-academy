# The Footy Academy

A football academy management game. You scout, sign, develop, and sell young players. Always one bad transfer window from going broke.

This is **Phase 0** — the smallest possible thing that proves the engine works. Generate a player object, see it on screen, click in to inspect its stats. No scouts, no money, no turn loop yet — those come in later phases.

See the v1 Design Doc in Linear for the full vision.

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/)
- TypeScript (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/) (via the official Vite plugin)
- ESLint + Prettier

## Project structure

```
src/
  components/   React components (player list, detail view, etc.)
  data/         Static datasets (name lists, regional configs, ...)
  game/         Game logic (player generator, name generator, ...)
  types/        TypeScript types
  ui/           Shared UI primitives (buttons, lists)
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

## Phase 0 — what's here now

- `Player` data model: 38 outfield stats, current and potential values
- English name generator (193 first names + 311 last names, multicultural mix)
- Player generator: 14-17yo English outfielders with normal-distributed stats and position-relevant bonuses
- "Generate Player" button in the top bar adds a player to the list
- List shows name, age, position, average potential
- Click a row to open the side panel with the full stat sheet — three groups (Physical / Technical / Mental), per-stat bars showing current vs potential
- `g` to generate, `Escape` to close detail

What's intentionally **not** here yet (those land in later phases): scouts, visibility ranges, traits, money, signing, the turn loop, save/load, goalkeepers, regions other than England.

## Generator tuning

`scripts/sample-players.ts` is a handy dev script for eyeballing the generator's spread:

```sh
npx tsx scripts/sample-players.ts 100
```

Prints name / age / position / avg current / avg potential / gap, then a summary block (means, ranges, position counts, age distribution).
