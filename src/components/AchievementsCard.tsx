import { useState } from 'react';
import { ALL_ACHIEVEMENT_IDS, type Achievement, type GameState } from '../types';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import { formatMonth } from '../util/format';

type Props = {
  state: GameState;
};

export default function AchievementsCard({ state }: Props) {
  const [showAll, setShowAll] = useState(false);
  const all = ALL_ACHIEVEMENT_IDS.map((id) => state.achievements[id]);
  const unlocked = all.filter((a) => a?.unlockedAt) as Achievement[];
  const recent = [...unlocked]
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return (
        b.unlockedAt.year * 12 +
        b.unlockedAt.month -
        (a.unlockedAt.year * 12 + a.unlockedAt.month)
      );
    })
    .slice(0, 3);

  return (
    <Card className="col-span-12 md:col-span-6 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">achievements</span>
        <span className="text-[11px] tabular-nums text-ink">
          {unlocked.length} / {all.length}
        </span>
      </div>

      {recent.length === 0 ? (
        <p className="text-[12px] text-ink-dim font-body">
          no achievements yet — sell your first player to get on the board.
        </p>
      ) : (
        <ul className="space-y-2 text-[12px]">
          {recent.map((a) => (
            <li key={a.id} className="flex items-baseline justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="text-accent-bright">★</span>
                <span className="truncate text-ink">{a.title}</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.10em] text-ink-faint">
                {a.unlockedAt
                  ? formatMonth(a.unlockedAt.month, a.unlockedAt.year).toLowerCase()
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="text-[10px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent text-left"
      >
        {showAll ? 'hide all' : 'view all'} →
      </button>

      {showAll ? (
        <div className="border-t border-hairline pt-3 max-h-72 overflow-y-auto">
          <ul className="space-y-2">
            {all.map((a) =>
              a ? (
                <li
                  key={a.id}
                  className={`flex items-baseline justify-between gap-3 text-[12px] ${
                    a.unlockedAt ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className={a.unlockedAt ? 'text-accent-bright' : 'text-ink-faint'}>
                        {a.unlockedAt ? '★' : '·'}
                      </span>
                      <span className="text-ink">{a.unlockedAt ? a.title : '???'}</span>
                    </div>
                    {a.unlockedAt ? (
                      <span className="ml-4 text-[11px] text-ink-dim font-body">
                        {a.description}
                      </span>
                    ) : null}
                  </div>
                  {a.unlockedAt ? (
                    <Chip tone="muted">
                      {formatMonth(a.unlockedAt.month, a.unlockedAt.year).toLowerCase()}
                    </Chip>
                  ) : null}
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
