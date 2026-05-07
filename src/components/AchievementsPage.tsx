import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  type Achievement,
  type AchievementCategory,
  type GameState,
} from '../types';
import Card from '../ui/Card';
import { formatMonth } from '../util/format';

type Props = {
  state: GameState;
};

const HINT_BY_ID: Partial<Record<string, string>> = {
  // Mostly the description doubles as a hint, but a few benefit from a
  // softer reveal so the locked entry doesn't fully spoil the goal.
  first_50m_sale: 'A truly massive sale — keep developing top talent.',
  sell_to_tier_1_club: 'A move to one of football\'s biggest clubs.',
  develop_late_bloomer: 'Patience with a specific kind of player pays off.',
  never_went_negative_5_years: 'Stay profitable for half a decade.',
};

function categoryRows(state: GameState, category: AchievementCategory): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.filter((d) => d.category === category).map(
    (def) => ({
      ...def,
      unlockedAt: state.achievements?.[def.id]?.unlockedAt ?? null,
    }),
  );
}

function unlockedCount(rows: readonly Achievement[]): number {
  return rows.filter((a) => a.unlockedAt != null).length;
}

export default function AchievementsPage({ state }: Props) {
  const totalUnlocked = ACHIEVEMENT_DEFINITIONS.filter(
    (d) => state.achievements?.[d.id]?.unlockedAt,
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">achievements</span>
          <span className="text-[18px] tabular-nums text-ink">
            {totalUnlocked} / {ACHIEVEMENT_DEFINITIONS.length}
          </span>
        </div>
        <p className="mt-2 text-[12px] text-ink-mid font-body">
          milestones earned over the life of your academy. locked items are hidden — keep
          playing to discover them.
        </p>
      </Card>

      {ACHIEVEMENT_CATEGORIES.map(({ id, label }) => {
        const rows = categoryRows(state, id);
        if (rows.length === 0) return null;
        const got = unlockedCount(rows);
        return (
          <Card key={id}>
            <div className="mb-4 flex items-baseline justify-between border-b border-hairline pb-3">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
                {label}
              </span>
              <span className="text-[11px] tabular-nums text-ink-faint">
                {got} / {rows.length}
              </span>
            </div>
            <ul className="divide-y divide-hairline">
              {rows.map((a) => (
                <li
                  key={a.id}
                  className={`relative grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 pl-3 pr-1 text-[12px] ${
                    a.unlockedAt ? '' : 'opacity-55'
                  }`}
                >
                  {a.unlockedAt ? (
                    <span aria-hidden className="absolute inset-y-2 left-0 w-[2px] bg-accent" />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={a.unlockedAt ? 'text-accent-bright' : 'text-ink-faint'}>
                        {a.unlockedAt ? '★' : '·'}
                      </span>
                      <span className="text-ink">{a.unlockedAt ? a.title : '???'}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-dim font-body">
                      {a.unlockedAt ? a.description : HINT_BY_ID[a.id] ?? a.description}
                    </p>
                  </div>
                  <span className="text-right text-[10px] uppercase tracking-[0.10em] text-ink-faint">
                    {a.unlockedAt
                      ? formatMonth(a.unlockedAt.month, a.unlockedAt.year).toLowerCase()
                      : 'locked'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
