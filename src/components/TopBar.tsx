import type { ReactNode } from 'react';
import { MONTHLY_BASE_INCOME } from '../game/finance';
import { formatCash, formatMonth } from '../util/format';

type HudItemProps = {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'danger' | 'good';
};

function HudItem({ label, value, tone = 'default' }: HudItemProps) {
  const valueClass =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'danger'
        ? 'text-danger'
        : tone === 'good'
          ? 'text-good'
          : 'text-ink';
  return (
    <div className="flex flex-col items-end gap-0.5 whitespace-nowrap leading-none">
      <span className="text-[9px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      <span className={`text-[18px] tabular-nums leading-none ${valueClass}`}>{value}</span>
    </div>
  );
}

type Props = {
  cash: number;
  month: number;
  year: number;
  squad: number;
  squadCap?: number;
  burn: number;
  rightSlot?: ReactNode;
};

export default function TopBar({
  cash,
  month,
  year,
  squad,
  squadCap = 24,
  burn,
  rightSlot,
}: Props) {
  const squadStr = `${String(squad).padStart(2, '0')} / ${String(squadCap).padStart(2, '0')}`;
  const cashTone: HudItemProps['tone'] = cash <= 0 ? 'danger' : 'accent';
  // Burn vs base income: if burn exceeds income you're spending into the
  // void each month — surface that visually.
  const burnTone: HudItemProps['tone'] = burn > MONTHLY_BASE_INCOME ? 'danger' : 'default';
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-hairline bg-bg px-4">
      <div className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink">the footy academy</span>
        <span className="text-[10px] tracking-[0.14em] text-ink-dim">
          · {formatMonth(month, year).toLowerCase()}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <HudItem label="Cash" value={formatCash(cash)} tone={cashTone} />
        <HudItem label="Burn" value={formatCash(burn)} tone={burnTone} />
        <HudItem label="Squad" value={squadStr} />
        {rightSlot}
      </div>
    </header>
  );
}
