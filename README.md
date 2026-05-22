# The Footy Academy

A football academy management roguelike. Scout, sign, develop, and sell young players. Every season the board hands you a challenge — clear it and stay in the black, or the run is over.

**Source:** [github.com/jsap7/the-footy-academy](https://github.com/jsap7/the-footy-academy)  
**Live demo:** Deploy on Vercel (see below) — add your production URL here after the first deploy.

## Routes

- `/` — landing page
- `/game` — the game

Both routes live in a single Vite app. A tiny pathname router in [apps/game/src/util/router.ts](apps/game/src/util/router.ts) swaps between `<Landing />` and `<Game />`.

## Development

Requires Node 20+ and pnpm 10+.

```sh
pnpm install
pnpm dev
```

Open the URL printed by Vite (defaults to <http://localhost:5173>).

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Dev server with HMR (`/` + `/game`)   |
| `pnpm build`        | Type-check and production build       |
| `pnpm lint`         | ESLint                                |
| `pnpm format`       | Prettier write                        |
| `pnpm format:check` | Prettier check                        |

### Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/)
- TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Departure Mono](https://departuremono.com/) (retro-terminal aesthetic)

## How to play

You run a small football academy in England. Every week you tick the calendar forward, develop your players, juggle bills, and try to sell talent before the squeeze gets you.

1. **Hire scouts.** Five candidates refresh in the Scouts tab every month. Higher-level scouts cost more salary but surface better tiers of player.
2. **Sign prospects.** Each scout finds 1 player per month — they show up on the Shortlist with a signing fee. Signed players go on your permanent roster and start earning monthly stipends.
3. **Develop them.** Roster players gain stat points every week, biased by their age curve, potential gap, and traits. Better facilities multiply development.
4. **Sell them.** Clubs send unsolicited offers. Accept, counter, or reject. Available-for-Sale doubles offer frequency.
5. **Clear the season's challenge.** Every Jan W1 the board hands you three options. Clear it and end the year in the black to pick a reward; fail and the run might end.
6. **Don't go broke for too long.** Auto-downgrade kicks in after 8 weeks underwater at any facility above tier 1.
7. **Develop kids into national teams.** U17/U18/U21/Senior call-ups add MV multipliers and monthly sponsorship payouts.

### Keyboard shortcuts

- `[N]` — next week
- `[ESC]` — close detail panel / modal

Progress auto-saves to your browser via localStorage. You can also export and import JSON save files from the in-game menu.

## Deploying to Vercel

Import the repo at the **repository root** (not `apps/game`). The root [vercel.json](vercel.json) runs the monorepo build and SPA rewrites so `/game` works on refresh.

| Setting          | Value                              |
| ---------------- | ---------------------------------- |
| Root Directory   | `.` (repo root — leave default)    |
| Framework Preset | Other (settings come from vercel.json) |
| Node.js          | 20+                                |

Vercel reads `installCommand`, `buildCommand`, and `outputDirectory` from `vercel.json`. Do **not** set Root Directory to `apps/game` — the TypeScript config extends `tsconfig.base.json` at the repo root and the build will fail.

## Major systems

| System                       | Source                                                |
| ---------------------------- | ----------------------------------------------------- |
| Player generator             | `apps/game/src/game/playerGenerator.ts`               |
| Traits library               | `apps/game/src/data/traits/library.ts`                |
| Quality tier rolls           | `apps/game/src/game/qualityTier.ts`                   |
| Scouts (find + tier)         | `apps/game/src/game/scoutFind.ts`, `scoutMarket.ts`    |
| Shortlist                    | `apps/game/src/game/shortlist.ts`                     |
| Signing fees                 | `apps/game/src/game/signingFees.ts`                   |
| Aging + auto-release         | `apps/game/src/game/aging.ts`                         |
| Development                  | `apps/game/src/game/development.ts`                   |
| Stipends                     | `apps/game/src/game/stipends.ts`                      |
| Market value + projection    | `apps/game/src/game/marketValue.ts`, `projection.ts`  |
| Selling + offers             | `apps/game/src/game/offers.ts`                        |
| Hold/sell recommendation     | `apps/game/src/game/recommendation.ts`                |
| Facilities + tiers           | `apps/game/src/game/facilities.ts`, `types/facility.ts` |
| Inflation                    | `apps/game/src/game/inflation.ts`                     |
| Finance + transactions       | `apps/game/src/game/finance.ts`, `transactions.ts`    |
| Achievements (~20)           | `apps/game/src/game/achievements.ts`                |
| Reputation                   | `apps/game/src/game/reputation.ts`                    |
| Long-term goals              | `apps/game/src/game/goals.ts`                         |
| National teams + sponsorship | `apps/game/src/game/nationalTeams.ts`                 |
| Yearly review                | `apps/game/src/game/yearlyReview.ts`                  |
| Stat milestones              | `apps/game/src/game/statMilestones.ts`                |
| Save / load                  | `apps/game/src/game/save.ts`                          |
| Weekly turn loop             | `apps/game/src/game/turnLoop.ts`                      |
| Board challenges             | `apps/game/src/game/challenges.ts`, `challengeTracking.ts` |
| Run rewards + buffs          | `apps/game/src/game/rewards.ts`, `buffs.ts`           |
| Game over                    | `apps/game/src/components/GameOverModal.tsx`          |

## License

MIT — see [LICENSE](LICENSE).
