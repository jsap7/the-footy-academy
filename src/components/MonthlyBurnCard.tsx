import { getExpenseBreakdown } from '../game/finance';
import type { GameState } from '../types';
import { formatCash } from '../util/format';
import Card from '../ui/Card';

type Props = {
  state: GameState;
};

const BAR_WIDTH = 18;

function bar(amount: number, total: number): string {
  if (total <= 0) return '░'.repeat(BAR_WIDTH);
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((amount / total) * BAR_WIDTH)));
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

function pct(amount: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.round((amount / total) * 100)}%`;
}

type LineProps = {
  label: string;
  amount: number;
  total: number;
};

function Line({ label, amount, total }: LineProps) {
  const dim = amount === 0;
  return (
    <div
      className={`grid grid-cols-[88px_minmax(0,1fr)_72px_36px] items-center gap-3 text-[12px] ${
        dim ? 'opacity-50' : ''
      }`}
    >
      <span className="uppercase tracking-[0.10em] text-ink-mid">{label}</span>
      <span className="font-mono text-[11px] text-accent leading-none">{bar(amount, total)}</span>
      <span className="text-right tabular-nums text-ink">{formatCash(amount)}</span>
      <span className="text-right tabular-nums text-ink-faint">{pct(amount, total)}</span>
    </div>
  );
}

export default function MonthlyBurnCard({ state }: Props) {
  const b = getExpenseBreakdown(state);
  return (
    <Card className="col-span-12 lg:col-span-4 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">monthly burn</span>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {formatCash(b.total)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <Line label="operating" amount={b.operating} total={b.total} />
        <Line label="facility" amount={b.facility} total={b.total} />
        <Line label="stipends" amount={b.stipends} total={b.total} />
        <Line label="scouts" amount={b.scouts} total={b.total} />
      </div>
      <div className="border-t border-hairline pt-3 grid grid-cols-3 gap-3 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">income</div>
          <div className="mt-1 tabular-nums text-ink">{formatCash(b.income)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">burn</div>
          <div className="mt-1 tabular-nums text-warn">-{formatCash(b.total)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.10em] text-ink-dim">net</div>
          <div
            className={`mt-1 tabular-nums ${b.net >= 0 ? 'text-accent-bright' : 'text-warn'}`}
          >
            {b.net >= 0 ? '+' : ''}
            {formatCash(b.net)}
          </div>
        </div>
      </div>
    </Card>
  );
}
