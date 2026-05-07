import { computeReputationBreakdown } from '../../game/reputation';
import type { GameState } from '../../types';
import Card from '../../ui/Card';

type Props = {
  state: GameState;
};

const BAR_WIDTH = 22;

function bar(progress: number): string {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((progress / 100) * BAR_WIDTH)));
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

export default function CompactReputation({ state }: Props) {
  const r = computeReputationBreakdown(state);
  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">reputation</span>
        <span className="text-[10px] tabular-nums text-ink-faint">{r.total} / 100</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-2">
        <div className="text-[13px] text-ink">{r.label.toLowerCase()}</div>
        <div className="font-mono text-[11px] leading-none text-accent">{bar(r.total)}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
          <div className="flex items-baseline justify-between">
            <span className="uppercase tracking-[0.10em] text-ink-mid">sales</span>
            <span className="tabular-nums text-ink">+{r.fromSales}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="uppercase tracking-[0.10em] text-ink-mid">years</span>
            <span className="tabular-nums text-ink">+{r.fromYears}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="uppercase tracking-[0.10em] text-ink-mid">achv</span>
            <span className="tabular-nums text-ink">+{r.fromAchievements}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="uppercase tracking-[0.10em] text-ink-mid">facil</span>
            <span className="tabular-nums text-ink">+{r.fromFacility}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
