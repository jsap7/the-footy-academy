import { LONG_TERM_GOALS } from '../../game/goals';
import type { GameState } from '../../types';
import Card from '../../ui/Card';

type Props = {
  state: GameState;
};

const BAR_WIDTH = 14;

function bar(fraction: number): string {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round(fraction * BAR_WIDTH)));
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

export default function CompactGoals({ state }: Props) {
  const rows = LONG_TERM_GOALS.map((g) => ({
    goal: g,
    progress: g.computeProgress(state),
  }));
  rows.sort((a, b) => b.progress.fraction - a.progress.fraction);
  const visible = rows.slice(0, 3);
  const completed = rows.filter((r) => r.progress.fraction >= 1).length;

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">long-term goals</span>
        <span className="text-[10px] tabular-nums text-ink-faint">
          {completed} / {rows.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-2">
        {visible.map(({ goal, progress }) => {
          const pct = Math.round(progress.fraction * 100);
          const done = progress.fraction >= 1;
          return (
            <div key={goal.id} className={`text-[11px] ${done ? 'opacity-60' : ''}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-ink">
                  <span className={done ? 'text-accent-bright' : 'text-ink-faint'}>
                    {done ? '★ ' : '· '}
                  </span>
                  {goal.title}
                </span>
                <span className="tabular-nums text-ink-faint">{pct}%</span>
              </div>
              <div className="ml-3 flex items-center gap-2 text-[10px]">
                <span className="font-mono text-accent leading-none">{bar(progress.fraction)}</span>
                <span className="text-ink-mid tabular-nums">
                  {progress.label ?? `${progress.current} / ${progress.target}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
