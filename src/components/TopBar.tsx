import type { ReactNode } from 'react';
import { formatCash, formatMonth } from '../util/format';

type HudItemProps = {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'danger';
};

function HudItem({ label, value, tone = 'default' }: HudItemProps) {
  const valueClass =
    tone === 'accent' ? 'text-accent' : tone === 'danger' ? 'text-danger' : 'text-ink';
  return (
    <div className="flex flex-col items-end gap-0.5 leading-none">
      <span className="text-[9px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      <span className={`text-[20px] tabular-nums leading-none ${valueClass}`}>{value}</span>
    </div>
  );
}

type Props = {
  cash: number;
  month: number;
  year: number;
  squad: number;
  squadCap?: number;
  rightSlot?: ReactNode;
};

export default function TopBar({ cash, month, year, squad, squadCap = 24, rightSlot }: Props) {
  const squadStr = `${String(squad).padStart(2, '0')} / ${String(squadCap).padStart(2, '0')}`;
  const cashTone: HudItemProps['tone'] = cash <= 0 ? 'danger' : 'accent';
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-bg px-6">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink">the footy academy</span>
        <span className="text-[10px] tracking-[0.14em] text-ink-dim">
          · {formatMonth(month, year).toLowerCase()}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <HudItem label="Cash" value={formatCash(cash)} tone={cashTone} />
        <HudItem label="Squad" value={squadStr} />
        {rightSlot}
      </div>
    </header>
  );
}
