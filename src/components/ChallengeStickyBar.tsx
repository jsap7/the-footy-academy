import type { ActiveChallenge, GameState } from '../types';
import { isChallengeComplete } from '../game/challenges';
import { formatCash } from '../util/format';

type Props = {
  state: GameState;
};

function formatProgress(c: ActiveChallenge): string {
  if (c.unit === '€') return `${formatCash(c.progress)} / ${formatCash(c.target)}`;
  if (c.target === 0) return c.progress === 0 ? 'clean' : `${c.progress} violations`;
  return `${c.progress} / ${c.target} ${c.unit}`;
}

function progressPct(c: ActiveChallenge): number {
  if (c.target <= 0) return c.progress === 0 ? 100 : 0;
  return Math.max(0, Math.min(100, (c.progress / c.target) * 100));
}

// Sticky bar that lives directly below the TopBar / EventBanner so it's
// visible across every tab. Renders nothing when no challenge is active
// (so the dashboard agent's revamp doesn't see a phantom bar before the
// first Jan W1 modal lands).
export default function ChallengeStickyBar({ state }: Props) {
  const c = state.currentChallenge;
  if (!c) return null;
  const complete = isChallengeComplete(c);
  const pct = progressPct(c);
  const tone = complete ? 'text-accent-bright' : 'text-ink';
  const barColor = complete ? 'bg-accent-bright' : 'bg-accent';

  // Weeks remaining inside the year — quick mental check vs. progress.
  const weeksRemaining =
    Math.max(0, (12 - state.currentMonth) * 4 + (4 - state.currentWeek));

  return (
    <div className="border-b border-hairline bg-bg-elev/60">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-6 px-12 py-2">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-dim">season</span>
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <span className={`truncate text-[12px] ${tone}`}>{c.title}</span>
          <span className="text-[11px] text-ink-mid font-body truncate">— {c.description}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] tabular-nums text-ink-mid">{formatProgress(c)}</span>
          <div
            className="relative h-[6px] w-32 overflow-hidden rounded-[2px] bg-bg-elev-2"
            aria-hidden
          >
            <div className={`absolute inset-y-0 left-0 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.10em] text-ink-faint tabular-nums">
            {weeksRemaining}w left
          </span>
        </div>
      </div>
    </div>
  );
}
