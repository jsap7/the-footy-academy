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
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        step={10000}
        value={value}
        onChange={(e) => setValue(Number(e.target.value) || 0)}
        className="w-32 border border-hairline bg-bg-row px-2 py-1 text-right font-mono text-[16px] tabular-nums text-ink focus:border-accent focus:outline-none"
      />
      <span className="text-[12px] text-ink-dim">{formatCash(value)}</span>
      <div className="flex items-center gap-1">
        {PRESET_PERCENTS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => setPercent(pct)}
            className="border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-[0.10em] text-ink-mid hover:border-accent hover:text-accent"
          >
            +{pct}%
          </button>
        ))}
      </div>
      <Button variant="primary" onClick={() => onSend(value)}>
        send
      </Button>
      <Button onClick={onCancel}>cancel</Button>
    </div>
  );
}
