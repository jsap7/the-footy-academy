import { getExpenseBreakdown } from '../../game/finance';
import type { GameState } from '../../types';
import { formatCash } from '../../util/format';
import Card from '../../ui/Card';

type Props = {
  state: GameState;
  onShowDetails: () => void;
};

const BAR_WIDTH = 14;

function bar(amount: number, total: number): string {
  if (total <= 0) return '░'.repeat(BAR_WIDTH);
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((amount / total) * BAR_WIDTH)));
  return '▓'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

function Line({ label, amount, total }: { label: string; amount: number; total: number }) {
  const dim = amount === 0;
  return (
    <div
      className={`grid grid-cols-[64px_minmax(0,1fr)_56px] items-center gap-2 text-[11px] ${
        dim ? 'opacity-50' : ''
      }`}
    >
      <span className="uppercase tracking-[0.10em] text-ink-mid">{label}</span>
      <span className="font-mono text-[10px] text-accent leading-none">{bar(amount, total)}</span>
      <span className="text-right tabular-nums text-ink">{formatCash(amount)}</span>
    </div>
  );
}

export default function CompactBurn({ state, onShowDetails }: Props) {
  const b = getExpenseBreakdown(state);
  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">monthly burn</span>
        <span className="text-[10px] tabular-nums text-ink-faint">{formatCash(b.total)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        <Line label="oper" amount={b.operating} total={b.total} />
        <Line label="facil" amount={b.facility} total={b.total} />
        <Line label="stip" amount={b.stipends} total={b.total} />
        <Line label="scout" amount={b.scouts} total={b.total} />
        <div
          className={`mt-1 flex items-baseline justify-between border-t border-hairline pt-1 text-[10px] tabular-nums ${
            b.net >= 0 ? 'text-accent-bright' : 'text-warn'
          }`}
        >
          <span className="uppercase tracking-[0.10em] text-ink-dim">net</span>
          <span>
            {b.net >= 0 ? '+' : ''}
            {formatCash(b.net)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onShowDetails}
        className="border-t border-hairline px-4 py-2 text-left text-[10px] uppercase tracking-[0.10em] text-ink-dim hover:text-accent"
      >
        show details →
      </button>
    </Card>
  );
}
