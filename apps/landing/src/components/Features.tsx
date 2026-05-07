import SectionLabel from './SectionLabel';

const FEATURES: {
  title: string;
  body: string;
  glyph: string;
  badge?: string;
}[] = [
  {
    title: 'Hidden quality tiers',
    body: 'Every player is rolled against five hidden tiers — mid, good, great, elite, generational. Tier drives stat bands, trait counts, and the fee. The tier is invisible. You learn it from how they look.',
    glyph: 'mid · good · great · elite · gen',
    badge: 'rng',
  },
  {
    title: 'Trait library',
    body: 'Twelve traits — five positive, four negative, three neutral. Workaholic, Late Bloomer, Glass, Lazy. They bend dev rate and stat caps. Color-coded. Click any pill in the drawer for the math.',
    glyph: '+ workaholic  ◇ deceptive  − glass',
    badge: '12',
  },
  {
    title: 'Per-player MV history',
    body: 'Trailing 12 months of market value charted in the drawer. Trend label tells you rising / peaking / falling. Forward projection at 17/18/19 estimates the peak using your facility multiplier.',
    glyph: '▲▲▲▼▼ rising — peaks at 19',
    badge: 'chart',
  },
  {
    title: 'Five-tier facilities',
    body: 'Backyard Pitch → World-Class. Each tier sets a development multiplier, monthly cost, and which scout levels show up in the market. Auto-downgrade kicks in after 8 weeks underwater.',
    glyph: '◐ ◐ ◐ ◐ ◐  tier 2 / 5',
    badge: 'sim',
  },
  {
    title: 'Real clubs, real wallets',
    body: 'Twenty named clubs across five tiers. Their wealth ceiling caps what they\'ll pay. Tier-1 clubs (Real Madrid, Liverpool) bid on your generational kids; Tier-5 won\'t touch them.',
    glyph: 'real madrid · liverpool · brighton · leeds',
    badge: '20',
  },
  {
    title: 'Board challenges',
    body: 'Every Jan W1 the board offers three challenges across four tiers — easy, medium, hard, brutal. Clear it and stay in the black to draw a permanent or yearly reward. Fail and the run can end.',
    glyph: 'easy ▒ · medium ▓ · hard ▓ · brutal ░',
    badge: 'roguelike',
  },
  {
    title: 'Achievements',
    body: 'About twenty hidden milestones across sales, facility, talent, survival, development. First €50M sale, never went negative for five years, develop a late-bloomer. Locked entries stay locked until you trip them.',
    glyph: '★ first €50m sale · ??? · ???',
    badge: '~20',
  },
  {
    title: 'National-team sponsorship',
    body: 'Develop a kid into U17/U18/U21/Senior and they pull a monthly stipend. Senior tier is €15k a month per player, inflated by year. The squeeze becomes survivable when your pipeline matures.',
    glyph: 'u17 · u18 · u21 · senior — €15k/mo',
    badge: 'income',
  },
  {
    title: 'Save / load',
    body: 'localStorage auto-saves on every state change with a versioned blob. JSON export and import. Reset Game wipes the slate. No accounts yet — that is coming with the leaderboard.',
    glyph: 'savefile v2 · auto · export json',
    badge: 'soon',
  },
];

export default function Features() {
  return (
    <section className="border-t border-hairline bg-bg-elev/30">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-20 lg:px-12">
        <SectionLabel index="// 02" title="under the hood" />
        <div className="mt-6 grid items-end gap-8 md:grid-cols-2">
          <h2 className="text-[34px] leading-[1.1] sm:text-[40px] text-ink">
            a deep simulation, not a clicker.
          </h2>
          <p className="max-w-md text-[13px] leading-[1.65] text-ink-mid font-body">
            The systems are visible. The math is honest. You can see why a player is worth what
            they are worth. You can see why your facility downgraded itself. You will not be
            surprised by hidden modifiers.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-hairline-bright bg-hairline md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="flex flex-col gap-4 bg-bg-elev p-6 transition-colors hover:bg-bg-elev-2"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] uppercase tracking-[0.06em] text-ink">{f.title}</h3>
                {f.badge ? (
                  <span className="rounded-[3px] border border-accent-dim bg-accent-faint px-1.5 py-[1px] text-[9px] uppercase tracking-[0.14em] text-accent-bright">
                    {f.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-[13px] leading-[1.6] text-ink-mid font-body">{f.body}</p>
              <div className="mt-auto rounded-[3px] border border-hairline-bright bg-bg px-3 py-2 font-mono text-[11px] tabular-nums text-accent">
                {f.glyph}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
