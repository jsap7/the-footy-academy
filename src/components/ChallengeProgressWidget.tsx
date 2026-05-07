import { isChallengeComplete } from '../game/challenges';
import type { ActiveChallenge, ChallengeTier, GameState } from '../types';
import { formatCash } from '../util/format';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

type Props = {
  state: GameState;
};

const TIER_TONE: Record<ChallengeTier, 'good' | 'accent' | 'muted' | 'danger'> = {
  easy: 'muted',
  medium: 'accent',
  hard: 'good',
  brutal: 'danger',
};

function formatValue(c: ActiveChallenge, value: number): string {
  if (c.unit === '€') return formatCash(value);
  if (c.target === 0) return `${value}`;
  return `${value}`;
}

function progressPct(c: ActiveChallenge): number {
  if (c.target <= 0) return c.progress === 0 ? 100 : 0;
  return Math.max(0, Math.min(100, (c.progress / c.target) * 100));
}

export default function ChallengeProgressWidget({ state }: Props) {
  const c = state.currentChallenge;
  if (!c) return null;
  const complete = isChallengeComplete(c);
  const pct = progressPct(c);
  const weeksRemaining =
    Math.max(0, (12 - state.currentMonth) * 4 + (4 - state.currentWeek));
  return (
    <Card className="col-span-12">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            board expectation
          </span>
          <Chip tone={TIER_TONE[c.tier]}>{c.tier}</Chip>
          {complete ? <Chip tone="good">cleared</Chip> : null}
        </div>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {weeksRemaining}w to dec w4
        </span>
      </div>
      <h3 className="mt-3 text-[20px] leading-none text-ink">{c.title}</h3>
      <p className="mt-2 text-[12px] text-ink-mid font-body">{c.description}</p>
      <div className="mt-5 flex items-baseline gap-4">
        <span className={`text-[28px] tabular-nums leading-none ${complete ? 'text-accent-bright' : 'text-ink'}`}>
          {formatValue(c, c.progress)}
        </span>
        <span className="text-[12px] uppercase tracking-[0.10em] text-ink-dim">
          / {formatValue(c, c.target)} {c.unit !== '€' ? c.unit : ''}
        </span>
      </div>
      <div
        className="relative mt-3 h-[6px] w-full overflow-hidden rounded-[2px] bg-bg-elev-2"
        aria-hidden
      >
        <div
          className={`absolute inset-y-0 left-0 ${complete ? 'bg-accent-bright' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
