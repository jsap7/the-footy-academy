import SectionLabel from './SectionLabel';

const PHASES: { id: string; title: string; status: 'shipped' | 'now' | 'next'; body: string }[] = [
  {
    id: 'phase 0',
    title: 'engine baseline',
    status: 'shipped',
    body: 'Player data model, name generator, list + side-panel detail view.',
  },
  {
    id: 'phase 1',
    title: 'traits library',
    status: 'shipped',
    body: '12 traits with weighted rolls, base-stat effects, color-coded pills.',
  },
  {
    id: 'phase 1.5',
    title: 'generator overhaul',
    status: 'shipped',
    body: 'Hidden quality tiers, position bonuses, age decoupled from potential.',
  },
  {
    id: 'phase 2a',
    title: 'bare-bones loop',
    status: 'shipped',
    body: 'Cash, calendar, scout market, shortlist, sign + monthly stipends.',
  },
  {
    id: 'phase 3',
    title: 'full loop',
    status: 'shipped',
    body: 'Aging + auto-release, weekly development, 20 named clubs, market value engine, unsolicited offers.',
  },
  {
    id: 'phase 3.5',
    title: 'rebalance + qol',
    status: 'shipped',
    body: 'MV formula tuned, scout tier bias overhauled, sortable roster, grouped offers, counter UI rework.',
  },
  {
    id: 'phase 4',
    title: 'economy overhaul',
    status: 'shipped',
    body: 'Income / costs crashed, tier signing fees, 5-tier facility system, annual inflation, finances tab.',
  },
  {
    id: 'phase 5',
    title: 'make it fun',
    status: 'shipped',
    body: 'MV history + chart, projections, recommendations, achievements, reputation, yearly review, goals.',
  },
  {
    id: 'phase 6',
    title: 'persistence + internationals',
    status: 'shipped',
    body: 'localStorage save / load with versioned blobs. National-team membership pays monthly sponsorships.',
  },
  {
    id: 'phase 7',
    title: 'weekly turns + polish',
    status: 'shipped',
    body: 'Cadence dropped from monthly to weekly. Stipends, salaries, ops costs all quartered. Cash count-up animation.',
  },
  {
    id: 'phase 6 / season',
    title: 'the roguelike layer',
    status: 'shipped',
    body: 'Board challenges every Jan W1 across four difficulty tiers. Clear + stay solvent to draw rewards. Fail and the run can end.',
  },
  {
    id: 'dashboard revamp',
    title: 'action-first ui',
    status: 'shipped',
    body: 'Dashboard rebuilt for density. 5 tabs, no scrolling. Top shortlist / offers / scouts inline. Interactive cash chart.',
  },
  {
    id: 'next',
    title: 'leaderboards + auth',
    status: 'next',
    body: 'Backend for accounts and run leaderboards (`apps/api`). Lock in your best run, compare against the world.',
  },
  {
    id: 'next',
    title: 'multi-region scouts',
    status: 'next',
    body: 'Players and scouts beyond England. Sponsorships scale by nationality and competition prestige.',
  },
  {
    id: 'next',
    title: 'sell-on % clauses',
    status: 'next',
    body: 'Take a smaller fee now plus 10–25% of the next sale. Risk-share with the buying club.',
  },
];

export default function Roadmap() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-20 lg:px-12">
        <SectionLabel index="// 03" title="phases shipped" />
        <div className="mt-6 grid items-end gap-8 md:grid-cols-2">
          <h2 className="text-[34px] leading-[1.1] sm:text-[40px] text-ink">
            built in the open. ship every phase.
          </h2>
          <p className="max-w-md text-[13px] leading-[1.65] text-ink-mid font-body">
            Twelve phases live and playable. Each one a tightly-scoped slice that closed a real
            playtest gap. The next slice is leaderboards and an account system.
          </p>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-md border border-hairline-bright bg-hairline md:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <li
              key={p.id + p.title}
              className="flex items-start gap-4 bg-bg-elev p-5 transition-colors hover:bg-bg-elev-2"
            >
              <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline-bright bg-bg text-[10px] tabular-nums text-ink-dim">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {p.id}
                  </span>
                  <span
                    className={`shrink-0 rounded-[3px] border px-1.5 py-[1px] text-[9px] uppercase tracking-[0.14em] ${
                      p.status === 'shipped'
                        ? 'border-accent-dim bg-accent-faint text-accent-bright'
                        : p.status === 'now'
                          ? 'border-hairline-bright bg-bg-elev-2 text-ink'
                          : 'border-hairline-bright bg-bg text-ink-dim'
                    }`}
                  >
                    {p.status === 'shipped' ? '✓ shipped' : p.status === 'now' ? '◐ now' : '◯ next'}
                  </span>
                </div>
                <h3 className="mt-1 text-[14px] uppercase tracking-[0.06em] text-ink">{p.title}</h3>
                <p className="mt-2 text-[12px] leading-[1.6] text-ink-mid font-body">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
