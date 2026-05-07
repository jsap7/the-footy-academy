import type { GameState } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';

type Props = {
  state: GameState;
  onStartNewRun: () => void;
};

export default function GameOverModal({ state, onStartNewRun }: Props) {
  const go = state.gameOver;
  if (!go) return null;
  const reasonHeadline =
    go.reason === 'bankruptcy'
      ? 'BANKRUPTCY'
      : `CHALLENGE FAILED — ${go.failedChallengeTitle ?? ''}`;

  // Run summary: peaks, totals, latest run-history entry (we just appended it).
  const lastRun = state.runHistory[state.runHistory.length - 1];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-md border-2 border-warn bg-bg-elev shadow-2xl">
        <header className="border-b border-warn/40 bg-warn-faint/40 px-8 py-8">
          <span className="text-[11px] uppercase tracking-[0.14em] text-warn">game over</span>
          <h2 className="mt-2 text-[40px] leading-[1.05] text-ink">{reasonHeadline}</h2>
          <p className="mt-3 text-[12px] text-ink-mid font-body">
            the run is recorded. start fresh whenever you&apos;re ready.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 space-y-5 text-[13px]">
          <section>
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim">
              run summary
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-ink">
              <span className="text-ink-mid">years survived</span>
              <span className="text-right tabular-nums">{lastRun?.yearsSurvived ?? 0}</span>
              <span className="text-ink-mid">total sales</span>
              <span className="text-right tabular-nums">{lastRun?.totalSales ?? 0}</span>
              <span className="text-ink-mid">biggest sale</span>
              <span className="text-right tabular-nums text-accent-bright">
                {formatCash(lastRun?.biggestSale ?? 0)}
              </span>
              <span className="text-ink-mid">achievements</span>
              <span className="text-right tabular-nums">{lastRun?.achievementsUnlocked ?? 0}</span>
              <span className="text-ink-mid">peak rep</span>
              <span className="text-right tabular-nums">{lastRun?.peakRep ?? 0}</span>
              <span className="text-ink-mid">peak cash</span>
              <span className="text-right tabular-nums">{formatCash(lastRun?.peakCash ?? 0)}</span>
              <span className="text-ink-mid">ended</span>
              <span className="text-right tabular-nums">
                w{lastRun?.endedAt.week} · m{lastRun?.endedAt.month} · {lastRun?.endedAt.year}
              </span>
            </div>
          </section>

          {state.runHistory.length > 1 ? (
            <section className="border-t border-hairline pt-5">
              <h3 className="mb-3 text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                run history
              </h3>
              <ul className="space-y-1.5 text-[12px] text-ink-mid font-body">
                {state.runHistory.slice(0, -1).map((r, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3">
                    <span>
                      run {i + 1} · {r.yearsSurvived}y · {r.failureReason}
                    </span>
                    <span className="tabular-nums">{formatCash(r.peakCash)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-hairline px-8 py-4">
          <span className="text-[11px] text-ink-dim font-body">run recorded in history</span>
          <Button variant="hero" onClick={onStartNewRun}>
            start new run →
          </Button>
        </footer>
      </div>
    </div>
  );
}
