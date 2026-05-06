import { getCurrentFacility } from '../game/facilities';
import {
  getExpenseBreakdown,
  MONTHLY_BASE_INCOME,
  MONTHLY_OPERATING_COSTS_BASE,
} from '../game/finance';
import { getInflationFactor, INFLATION_BASE_YEAR } from '../game/inflation';
import type { GameState } from '../types';
import { formatCash } from '../util/format';
import Card from '../ui/Card';
import CashHistoryChart from './CashHistoryChart';
import TransactionList from './TransactionList';

type Props = {
  state: GameState;
};

function InflatedLine({
  label,
  base,
  factor,
  unit = '/mo',
}: {
  label: string;
  base: number;
  factor: number;
  unit?: string;
}) {
  const final = Math.round(base * factor);
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)_auto] items-baseline gap-3 text-[12px]">
      <span className="uppercase tracking-[0.10em] text-ink-mid">{label}</span>
      <span className="text-[11px] text-ink-faint font-body">
        {formatCash(base)} × {factor.toFixed(3)}
      </span>
      <span className="tabular-nums text-ink">
        {formatCash(final)}
        <span className="text-[10px] uppercase tracking-[0.10em] text-ink-faint"> {unit}</span>
      </span>
    </div>
  );
}

export default function FinancesPage({ state }: Props) {
  const breakdown = getExpenseBreakdown(state);
  const factor = getInflationFactor(state.currentYear);
  const facility = getCurrentFacility(state);
  const yearsSinceStart = Math.max(0, state.currentYear - INFLATION_BASE_YEAR);
  const annualNet = breakdown.net * 12;

  return (
    <div className="space-y-8">
      <Card>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">cash</span>
            <div
              className={`mt-2 text-[40px] tabular-nums leading-none ${
                state.cash >= 0 ? 'text-ink' : 'text-warn'
              }`}
            >
              {formatCash(state.cash)}
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
              monthly net
            </span>
            <div
              className={`mt-2 text-[28px] tabular-nums leading-none ${
                breakdown.net >= 0 ? 'text-accent-bright' : 'text-warn'
              }`}
            >
              {breakdown.net >= 0 ? '+' : ''}
              {formatCash(breakdown.net)}
            </div>
            <p className="mt-2 text-[11px] text-ink-dim font-body">
              income {formatCash(breakdown.income)} − burn {formatCash(breakdown.total)}
            </p>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
              annual run-rate
            </span>
            <div
              className={`mt-2 text-[28px] tabular-nums leading-none ${
                annualNet >= 0 ? 'text-accent-bright' : 'text-warn'
              }`}
            >
              {annualNet >= 0 ? '+' : ''}
              {formatCash(annualNet)}
            </div>
            <p className="mt-2 text-[11px] text-ink-dim font-body">12 × current monthly net</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            cash · last 12 months
          </span>
          <span className="text-[11px] tabular-nums text-ink-faint">
            {state.cashHistory.length} entr{state.cashHistory.length === 1 ? 'y' : 'ies'}
          </span>
        </div>
        <CashHistoryChart history={state.cashHistory} />
      </Card>

      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            inflated cost breakdown
          </span>
          <span className="text-[11px] tabular-nums text-ink-faint">
            inflation ×{factor.toFixed(3)} · year {yearsSinceStart}
          </span>
        </div>
        <div className="space-y-2">
          <InflatedLine label="operating" base={MONTHLY_OPERATING_COSTS_BASE} factor={factor} />
          <InflatedLine
            label={`facility · ${facility.name.toLowerCase()}`}
            base={facility.monthlyCost}
            factor={factor}
          />
          <InflatedLine
            label="stipends"
            base={breakdown.stipends > 0 ? breakdown.stipends / factor : 0}
            factor={factor}
          />
          <InflatedLine
            label="scout salaries"
            base={breakdown.scouts}
            factor={1}
            unit="/mo · grandfathered"
          />
        </div>
        <p className="mt-4 text-[11px] text-ink-faint font-body">
          income stays at {formatCash(MONTHLY_BASE_INCOME)} regardless of year — the squeeze
          tightens by design.
        </p>
      </Card>

      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">transactions</span>
          <span className="text-[11px] tabular-nums text-ink-faint">
            {state.transactions.length} recent
          </span>
        </div>
        <TransactionList transactions={state.transactions} />
      </Card>
    </div>
  );
}
