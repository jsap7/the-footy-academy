import { monthlyBurn, monthlyNet, MONTHLY_BASE_INCOME } from '../../game/finance';
import type { GameState } from '../../types';
import { formatCash, formatWeek } from '../../util/format';
import { useCountUp } from '../../util/useCountUp';
import Card from '../../ui/Card';

type Props = {
  state: GameState;
};

function MiniStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'warn';
  hint?: string;
}) {
  const toneClass =
    tone === 'good' ? 'text-accent-bright' : tone === 'warn' ? 'text-warn' : 'text-ink';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.12em] text-ink-dim">{label}</span>
      <span className={`text-[15px] tabular-nums leading-none ${toneClass}`}>{value}</span>
      {hint ? <span className="text-[10px] text-ink-faint">{hint}</span> : null}
    </div>
  );
}

export default function HeroStrip({ state }: Props) {
  const burn = monthlyBurn(state);
  const net = monthlyNet(state);
  const animatedCash = useCountUp(state.cash);
  return (
    <Card padded={false}>
      <div className="flex items-center gap-5 px-4 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-dim">cash</span>
          <span
            className={`text-[20px] tabular-nums leading-none ${
              state.cash <= 0 ? 'text-warn' : 'text-ink'
            }`}
          >
            {formatCash(Math.round(animatedCash))}
          </span>
        </div>
        <div className="h-7 w-px bg-hairline" />
        <MiniStat
          label="monthly net"
          value={`${net >= 0 ? '+' : ''}${formatCash(net)}`}
          tone={net >= 0 ? 'good' : 'warn'}
          hint={`in ${formatCash(MONTHLY_BASE_INCOME)} · out ${formatCash(burn)}`}
        />
        <div className="h-7 w-px bg-hairline" />
        <MiniStat
          label="now"
          value={formatWeek(state.currentMonth, state.currentWeek, state.currentYear).toLowerCase()}
        />
      </div>
    </Card>
  );
}
