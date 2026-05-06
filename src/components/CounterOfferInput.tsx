import { useState } from 'react';
import Button from '../ui/Button';
import { formatCash } from '../util/format';

type Props = {
  initialAmount: number;
  onSend: (counterAmount: number) => void;
  onCancel: () => void;
};

const PRESET_PERCENTS = [10, 20, 30] as const;

export default function CounterOfferInput({ initialAmount, onSend, onCancel }: Props) {
  const [value, setValue] = useState<number>(Math.round(initialAmount * 1.1));

  const setPercent = (pct: number) => {
    setValue(Math.round(initialAmount * (1 + pct / 100)));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={10000}
          value={value}
          onChange={(e) => setValue(Number(e.target.value) || 0)}
          className="w-36 rounded-[5px] border border-hairline-bright bg-bg px-2 py-1.5 text-right text-[13px] tabular-nums text-ink focus:border-accent focus:outline-none"
        />
        <span className="text-[11px] text-ink-dim">{formatCash(value)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {PRESET_PERCENTS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => setPercent(pct)}
            className="rounded-[3px] border border-hairline-bright px-2 py-1 text-[10px] uppercase tracking-[0.10em] text-ink-mid transition-colors hover:border-accent hover:text-accent-bright"
          >
            +{pct}%
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="primary" onClick={() => onSend(value)}>
          send counter
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          cancel
        </Button>
      </div>
    </div>
  );
}
