type HudItemProps = {
  label: string;
  value: string;
  tone?: 'default' | 'accent';
};

function HudItem({ label, value, tone = 'default' }: HudItemProps) {
  return (
    <div className="flex flex-col items-end gap-0.5 leading-none">
      <span className="text-[9px] uppercase tracking-[0.14em] text-ink-dim">{label}</span>
      <span
        className={`text-[20px] tabular-nums leading-none ${
          tone === 'accent' ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type Props = {
  squad: number;
  squadCap?: number;
  rightSlot?: React.ReactNode;
};

export default function TopBar({ squad, squadCap = 24, rightSlot }: Props) {
  const squadStr = `${String(squad).padStart(2, '0')} / ${String(squadCap).padStart(2, '0')}`;
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-bg px-6">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink">the footy academy</span>
        <span className="text-[10px] tracking-[0.14em] text-ink-dim">
          · season 1 · march &apos;26
        </span>
      </div>
      <div className="flex items-center gap-6">
        <HudItem label="Squad" value={squadStr} tone="accent" />
        {rightSlot}
      </div>
    </header>
  );
}
