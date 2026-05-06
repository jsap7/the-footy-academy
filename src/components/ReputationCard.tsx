import { computeReputationBreakdown } from '../game/reputation';
import type { GameState } from '../types';
import Card from '../ui/Card';

type Props = {
  state: GameState;
};

const BAR_WIDTH = 22;

function bar(progress: number): string {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((progress / 100) * BAR_WIDTH)));
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

export default function ReputationCard({ state }: Props) {
  const r = computeReputationBreakdown(state);
  return (
    <Card className="col-span-12 md:col-span-6 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
          academy reputation
        </span>
        <span className="text-[11px] tabular-nums text-ink">{r.total} / 100</span>
      </div>
      <div>
        <div className="text-[18px] text-ink">{r.label.toLowerCase()}</div>
        <div className="mt-2 font-mono text-[14px] leading-none text-accent">{bar(r.total)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-hairline pt-3 text-[11px]">
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.10em] text-ink-mid">sales</span>
          <span className="tabular-nums text-ink">+{r.fromSales}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.10em] text-ink-mid">years</span>
          <span className="tabular-nums text-ink">+{r.fromYears}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.10em] text-ink-mid">achievements</span>
          <span className="tabular-nums text-ink">+{r.fromAchievements}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.10em] text-ink-mid">facility</span>
          <span className="tabular-nums text-ink">+{r.fromFacility}</span>
        </div>
      </div>
    </Card>
  );
}
