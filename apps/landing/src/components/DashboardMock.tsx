import Chip from './Chip';

function MiniCard({
  label,
  count,
  children,
}: {
  label: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-md border border-hairline bg-bg-elev">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-1.5">
        <span className="text-[9px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
        {count ? <span className="text-[9px] tabular-nums text-ink-faint">{count}</span> : null}
      </div>
      {children}
    </div>
  );
}

function ShortlistRow({
  name,
  pos,
  age,
  fee,
  pot,
}: {
  name: string;
  pos: string;
  age: string;
  fee: string;
  pot: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-[10px]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-ink">
          <span className="truncate">{name}</span>
          <Chip tone="muted">{pos}</Chip>
          <span className="text-ink-dim tabular-nums">{age}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.10em] text-ink-dim">
          <span>
            pot <span className="text-ink tabular-nums">{pot}</span>
          </span>
          <span>fee</span>
          <span className="text-ink tabular-nums">{fee}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="rounded-[3px] border border-hairline-bright px-1.5 py-0.5 text-[9px] uppercase text-ink-mid">
          rej
        </span>
        <span className="rounded-[3px] border border-accent-dim bg-accent-faint px-1.5 py-0.5 text-[9px] uppercase text-accent-bright">
          sign
        </span>
      </div>
    </div>
  );
}

function OfferRow({
  name,
  pos,
  count,
  best,
}: {
  name: string;
  pos: string;
  count: string;
  best: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-[10px]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-ink">
          <span className="truncate">{name}</span>
          <Chip tone="muted">{pos}</Chip>
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-[0.10em] text-ink-dim">
          {count} · best{' '}
          <span className="text-accent-bright tabular-nums">{best}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="rounded-[3px] border border-hairline-bright px-1.5 py-0.5 text-[9px] uppercase text-ink-mid">
          view
        </span>
        <span className="rounded-[3px] border border-accent-dim bg-accent-faint px-1.5 py-0.5 text-[9px] uppercase text-accent-bright">
          accept
        </span>
      </div>
    </div>
  );
}

function MiniChart() {
  // Pre-baked points sketching a "barely profitable" arc (W1..W12).
  const points = [
    [10, 80],
    [40, 78],
    [70, 74],
    [100, 70],
    [130, 64],
    [160, 56],
    [190, 60],
    [220, 50],
    [250, 38],
    [280, 30],
    [310, 38],
    [340, 26],
  ];
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  return (
    <svg viewBox="0 0 360 100" className="h-full w-full">
      <line
        x1={10}
        x2={350}
        y1={70}
        y2={70}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="2 3"
        className="text-ink-faint"
      />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-accent"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 9 ? 3 : 1.5}
          fill="currentColor"
          className={i === 9 ? 'text-warn' : 'text-accent'}
        />
      ))}
    </svg>
  );
}

export default function DashboardMock() {
  return (
    <div className="rounded-md border border-hairline bg-bg-elev shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6),0_2px_0_0_rgba(255,255,255,0.02)_inset]">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-hairline px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink">the footy academy</span>
        <nav className="ml-3 flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.10em]">
          <span className="relative pb-1 text-ink">
            dashboard
            <span className="absolute -bottom-[7px] left-0 right-0 h-px bg-accent" />
          </span>
          <span className="text-ink-dim">roster</span>
          <span className="text-ink-dim">shortlist</span>
          <span className="text-ink-dim">offers</span>
          <span className="text-ink-dim">scouts</span>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-[10px] tabular-nums">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[8px] uppercase tracking-[0.12em] text-ink-dim">cash</span>
            <span className="text-ink">€100k</span>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[8px] uppercase tracking-[0.12em] text-ink-dim">week</span>
            <span className="text-ink">jan w1 26</span>
          </div>
          <span className="rounded-[3px] border border-accent bg-accent px-2 py-1 text-[9px] uppercase text-bg">
            next week →
          </span>
        </div>
      </div>

      {/* Sticky season strip */}
      <div className="flex items-center gap-3 border-b border-hairline bg-bg-elev/60 px-3 py-1.5">
        <span className="text-[8px] uppercase tracking-[0.14em] text-ink-dim">season</span>
        <span className="truncate text-[10px] text-ink">Build Roster</span>
        <span className="truncate text-[9px] text-ink-mid font-body">
          — End the year with at least 3 players on the roster.
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] tabular-nums text-ink-mid">0 / 3 pts</span>
          <div className="h-1 w-16 overflow-hidden rounded-[2px] bg-bg-elev-2">
            <div className="h-full w-[10%] bg-accent" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.10em] text-ink-faint tabular-nums">
            47w
          </span>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-12 gap-2 p-3">
        {/* Hero strip mini */}
        <div className="col-span-12 flex items-center gap-4 rounded-md border border-hairline bg-bg px-3 py-2">
          <div className="flex flex-col leading-none">
            <span className="text-[8px] uppercase tracking-[0.12em] text-ink-dim">cash</span>
            <span className="mt-0.5 text-[16px] tabular-nums text-ink">€100k</span>
          </div>
          <div className="h-7 w-px bg-hairline" />
          <div className="flex flex-col leading-none">
            <span className="text-[8px] uppercase tracking-[0.12em] text-ink-dim">monthly net</span>
            <span className="mt-0.5 text-[13px] tabular-nums text-warn">-€26k</span>
            <span className="mt-0.5 text-[8px] text-ink-faint">in €34k · out €60k</span>
          </div>
          <div className="h-7 w-px bg-hairline" />
          <div className="flex flex-col leading-none">
            <span className="text-[8px] uppercase tracking-[0.12em] text-ink-dim">now</span>
            <span className="mt-0.5 text-[13px] text-ink">jan w1 2026</span>
          </div>
        </div>

        {/* Three widgets row */}
        <div className="col-span-4">
          <MiniCard label="top shortlist" count="4">
            <div className="divide-y divide-hairline">
              <ShortlistRow name="Cillian Kareem" pos="cm" age="14" pot="84" fee="€42k" />
              <ShortlistRow name="Tariq Mukherjee" pos="lw" age="15" pot="79" fee="€28k" />
              <ShortlistRow name="Hamish Mahmood" pos="cb" age="13" pot="76" fee="€18k" />
            </div>
            <div className="border-t border-hairline px-3 py-1.5 text-[9px] uppercase tracking-[0.10em] text-ink-dim">
              +1 more →
            </div>
          </MiniCard>
        </div>
        <div className="col-span-4">
          <MiniCard label="top offers" count="2">
            <div className="divide-y divide-hairline">
              <OfferRow name="Arjun Bianchi" pos="cdm" count="2 offers" best="€620k" />
              <OfferRow name="Hamish Mahmood" pos="cb" count="1 offer" best="€170k" />
            </div>
            <div className="px-3 py-3 text-center text-[9px] uppercase tracking-[0.10em] text-ink-faint">
              develop and list to attract clubs
            </div>
          </MiniCard>
        </div>
        <div className="col-span-4">
          <MiniCard label="hired scouts" count="2">
            <div className="divide-y divide-hairline">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px]">
                <div>
                  <div className="text-ink">Kai George</div>
                  <div className="mt-0.5 text-[9px] tabular-nums text-accent-bright">
                    ★★★<span className="text-ink-faint">★★</span>{' '}
                    <span className="text-ink-dim">L3</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] tabular-nums text-ink-mid">€80k/mo</span>
                  <span className="rounded-[3px] border border-warn/60 bg-warn-faint px-1.5 py-0.5 text-[9px] uppercase text-warn">
                    fire
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px]">
                <div>
                  <div className="text-ink">Kyriakos Tan</div>
                  <div className="mt-0.5 text-[9px] tabular-nums text-accent-bright">
                    ★<span className="text-ink-faint">★★★★</span>{' '}
                    <span className="text-ink-dim">L1</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] tabular-nums text-ink-mid">€5k/mo</span>
                  <span className="rounded-[3px] border border-warn/60 bg-warn-faint px-1.5 py-0.5 text-[9px] uppercase text-warn">
                    fire
                  </span>
                </div>
              </div>
            </div>
          </MiniCard>
        </div>

        {/* Chart + side cards */}
        <div className="col-span-7">
          <MiniCard label="cash · last 12 weeks" count="now €100k">
            <div className="px-2 py-1.5">
              <div className="text-accent">
                <MiniChart />
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t border-hairline px-3 py-1 text-[9px] uppercase tracking-[0.10em] text-ink-faint">
              <span>oct w1</span>
              <span>
                peak <span className="text-accent-bright tabular-nums">€100k</span>
              </span>
              <span>
                trough <span className="text-warn tabular-nums">-€146k</span>
              </span>
              <span>jan w1</span>
            </div>
          </MiniCard>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-hairline bg-bg-elev px-3 py-2 text-[10px]">
            <Chip tone="muted">tier 2/5</Chip>
            <span className="text-ink">local facility</span>
            <span className="text-[9px] uppercase tracking-[0.10em] tabular-nums text-ink-dim">
              €15k/mo
            </span>
            <span className="ml-auto rounded-[3px] border border-accent-dim bg-accent-faint px-1.5 py-0.5 text-[9px] uppercase text-accent-bright">
              upgrade · €120k
            </span>
            <span className="rounded-[3px] border border-hairline-bright px-1.5 py-0.5 text-[9px] uppercase text-ink-mid">
              manage
            </span>
          </div>
        </div>
        <div className="col-span-5 grid grid-cols-2 gap-2">
          <MiniCard label="monthly burn" count="€60k">
            <div className="space-y-0.5 px-3 py-1.5 text-[9px]">
              {[
                ['oper', '▓▓▓▓▓░░░░', '€15k'],
                ['facil', '▓▓▓▓▓▓░░░', '€15k'],
                ['stip', '▓▓▓▓▓▓▓▓░', '€24k'],
                ['scout', '▓▓░░░░░░░', '€6k'],
              ].map(([l, b, v]) => (
                <div
                  key={l}
                  className="grid grid-cols-[40px_minmax(0,1fr)_42px] items-center gap-1.5"
                >
                  <span className="uppercase tracking-[0.10em] text-ink-mid">{l}</span>
                  <span className="font-mono text-[9px] leading-none text-accent">{b}</span>
                  <span className="text-right tabular-nums text-ink">{v}</span>
                </div>
              ))}
              <div className="mt-1 flex items-baseline justify-between border-t border-hairline pt-1 text-[9px] tabular-nums text-warn">
                <span className="uppercase tracking-[0.10em] text-ink-dim">net</span>
                <span>-€26k</span>
              </div>
            </div>
          </MiniCard>
          <MiniCard label="reputation" count="12 / 100">
            <div className="px-3 py-1.5">
              <div className="text-[12px] text-ink">unknown academy</div>
              <div className="mt-1 font-mono text-[10px] leading-none text-accent">
                ▓▓░░░░░░░░░░░░░░░░░░░░
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
                {[
                  ['sales', '+0'],
                  ['years', '+0'],
                  ['achv', '+0'],
                  ['facil', '+12'],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-baseline justify-between">
                    <span className="uppercase tracking-[0.10em] text-ink-mid">{l}</span>
                    <span className="tabular-nums text-ink">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </MiniCard>
          <MiniCard label="long-term goals" count="0/5">
            <div className="space-y-0.5 px-3 py-1.5 text-[9px]">
              <div>
                <div className="flex items-baseline justify-between text-ink">
                  <span className="truncate">· Develop a Player to Full Pot</span>
                  <span className="tabular-nums text-ink-faint">0%</span>
                </div>
                <div className="ml-2 font-mono text-[8px] text-accent">░░░░░░░░░░░░░░</div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-ink">
                  <span className="truncate">· Build a Tier 5 Facility</span>
                  <span className="tabular-nums text-ink-faint">20%</span>
                </div>
                <div className="ml-2 font-mono text-[8px] text-accent">▓▓▓░░░░░░░░░░░</div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-ink">
                  <span className="truncate">· Reach €50M Cash</span>
                  <span className="tabular-nums text-ink-faint">0%</span>
                </div>
                <div className="ml-2 font-mono text-[8px] text-accent">░░░░░░░░░░░░░░</div>
              </div>
            </div>
          </MiniCard>
          <MiniCard label="achievements" count="0 / 20">
            <div className="px-3 py-2 text-[9px] text-ink-dim font-body">
              no achievements yet — sell your first player to get on the board.
            </div>
            <div className="border-t border-hairline px-3 py-1 text-[9px] uppercase tracking-[0.10em] text-ink-dim">
              show all →
            </div>
          </MiniCard>
        </div>
      </div>
    </div>
  );
}
