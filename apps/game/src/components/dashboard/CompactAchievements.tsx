import { ALL_ACHIEVEMENT_IDS, type Achievement, type GameState } from '../../types';
import { formatMonth } from '../../util/format';
import Card from '../../ui/Card';

type Props = {
  state: GameState;
  onShowAll: () => void;
};

export default function CompactAchievements({ state, onShowAll }: Props) {
  const all = ALL_ACHIEVEMENT_IDS.map((id) => state.achievements[id]);
  const unlocked = all.filter((a) => a?.unlockedAt) as Achievement[];
  const recent = [...unlocked]
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return (
        b.unlockedAt.year * 12 + b.unlockedAt.month - (a.unlockedAt.year * 12 + a.unlockedAt.month)
      );
    })
    .slice(0, 3);

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">achievements</span>
        <span className="text-[10px] tabular-nums text-ink-faint">
          {unlocked.length} / {all.length}
        </span>
      </div>
      <div className="flex-1 px-3 py-2">
        {recent.length === 0 ? (
          <p className="text-[11px] text-ink-dim font-body">
            no achievements yet — sell your first player to get on the board.
          </p>
        ) : (
          <ul className="space-y-1 text-[11px]">
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
      </div>
      <button
        type="button"
        onClick={onShowAll}
        className="border-t border-hairline px-4 py-2 text-left text-[10px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
      >
        show all achievements →
      </button>
    </Card>
  );
}
