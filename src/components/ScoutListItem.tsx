import type { Scout } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';

type Props = {
  scout: Scout;
  action: 'hire' | 'fire';
  disabled?: boolean;
  onAction: (scoutId: string) => void;
};

function levelMeter(level: number): string {
  return '*'.repeat(level) + '-'.repeat(5 - level);
}

export default function ScoutListItem({ scout, action, disabled, onAction }: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_88px_minmax(0,1fr)_auto] items-center gap-4 border-b border-hairline px-4 py-3 text-[18px]">
      <span className="truncate">
        {scout.firstName} {scout.lastName}
      </span>
      <span className="font-mono text-[14px] tracking-[0.18em] text-accent">
        {levelMeter(scout.level)}
      </span>
      <span className="tabular-nums text-ink-mid">{formatCash(scout.monthlySalary)}/mo</span>
      <Button
        variant={action === 'hire' ? 'primary' : 'default'}
        disabled={disabled}
        onClick={() => onAction(scout.id)}
        className={disabled ? 'cursor-not-allowed opacity-40' : ''}
      >
        {action}
      </Button>
    </div>
  );
}
