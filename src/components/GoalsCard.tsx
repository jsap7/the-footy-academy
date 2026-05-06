import { LONG_TERM_GOALS } from '../game/goals';
import type { GameState } from '../types';
import Card from '../ui/Card';

type Props = {
  state: GameState;
};

const BAR_WIDTH = 18;

function bar(fraction: number): string {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round(fraction * BAR_WIDTH)));
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

export default function GoalsCard({ state }: Props) {
  const rows = LONG_TERM_GOALS.map((g) => {
    const progress = g.computeProgress(state);
    return { goal: g, progress };
  });
  // Order by progress desc so closest-to-completion sits at top
  rows.sort((a, b) => b.progress.fraction - a.progress.fraction);

  return (
    <Card className="col-span-12 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
          long-term goals
        </span>
        <span className="text-[10px] uppercase tracking-[0.10em] text-ink-faint">
          {rows.filter((r) => r.progress.fraction >= 1).length} / {rows.length} complete
        </span>
      </div>
      <div className="space-y-3">
        {rows.map(({ goal, progress }) => {
          const pct = Math.round(progress.fraction * 100);
          const done = progress.fraction >= 1;
          return (
            <div
              key={goal.id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 ${
                done ? 'opacity-60' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={done ? 'text-accent-bright' : 'text-ink-faint'}>
                    {done ? '★' : '·'}
                  </span>
                  <span className="text-[12px] text-ink truncate">{goal.title}</span>
                </div>
                <div className="ml-4 mt-1 flex items-center gap-3 text-[11px]">
                  <span className="font-mono text-accent leading-none">
                    {bar(progress.fraction)}
                  </span>
                  <span className="text-ink-mid tabular-nums">
                    {progress.label ?? `${progress.current} / ${progress.target}`}
                  </span>
                </div>
              </div>
              <span className="text-right text-[11px] tabular-nums text-ink-faint">{pct}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
