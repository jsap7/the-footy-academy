import type { Scout } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';

type Props = {
  scout: Scout;
  action: 'hire' | 'fire';
  disabled?: boolean;
  onAction: (scoutId: string) => void;
};

const COLS = 'grid-cols-[minmax(0,1.6fr)_120px_minmax(0,1fr)_minmax(0,120px)]';

function LevelMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-3 rounded-[1px] ${
            i <= level ? 'bg-accent' : 'bg-bg-elev-2 border border-hairline-bright'
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] uppercase tracking-[0.12em] text-ink-dim">L{level}</span>
    </div>
  );
}

export default function ScoutListItem({ scout, action, disabled, onAction }: Props) {
  return (
    <div
      className={`grid ${COLS} items-center gap-6 px-6 py-4 text-[13px] transition-colors duration-150 hover:bg-bg-elev-2`}
    >
      <span className="truncate text-ink">
        {scout.firstName} {scout.lastName}
      </span>
      <LevelMeter level={scout.level} />
      <span className="tabular-nums text-ink-mid">{formatCash(scout.monthlySalary)} / mo</span>
      <span className="flex justify-end">
        <Button
          variant={action === 'hire' ? 'primary' : 'danger'}
          disabled={disabled}
          onClick={() => onAction(scout.id)}
        >
          {action}
        </Button>
      </span>
    </div>
  );
}
