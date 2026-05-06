import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import { formatCash } from '../util/format';

type Props = {
  offerAmount: number;
  marketValue: number | null;
  maxAllowed: number | null;
  onSend: (counterAmount: number) => void;
  onCancel: () => void;
};

type Preset = {
  id: string;
  label: string;
  hint: string;
  value: number;
};

function buildPresets(offerAmount: number, marketValue: number | null): Preset[] {
  const presets: Preset[] = [
    {
      id: 'p10',
      label: '+10%',
      hint: 'conservative — likely accepted',
      value: Math.round(offerAmount * 1.1),
    },
    {
      id: 'p20',
      label: '+20%',
      hint: 'reasonable — they may counter',
      value: Math.round(offerAmount * 1.2),
    },
    {
      id: 'p30',
      label: '+30%',
      hint: 'aggressive — could walk',
      value: Math.round(offerAmount * 1.3),
    },
    {
      id: 'p50',
      label: '+50%',
      hint: 'long shot — likely walk',
      value: Math.round(offerAmount * 1.5),
    },
  ];
  if (marketValue != null && marketValue > 0) {
    presets.push({
      id: 'mv',
      label: 'match mv',
      hint: `ask their full read at ${formatCash(marketValue)}`,
      value: marketValue,
    });
  }
  return presets;
}

export default function CounterOfferInput({
  offerAmount,
  marketValue,
  maxAllowed,
  onSend,
  onCancel,
}: Props) {
  const presets = buildPresets(offerAmount, marketValue);
  const [value, setValue] = useState(() => presets[1]?.value ?? Math.round(offerAmount * 1.2));
  const [selectedId, setSelectedId] = useState<string | null>(presets[1]?.id ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const choose = (preset: Preset) => {
    setValue(preset.value);
    setSelectedId(preset.id);
  };

  const onCustomChange = (raw: number) => {
    setValue(raw);
    setSelectedId(null);
  };

  const tooLow = value <= offerAmount;
  const overCap = maxAllowed != null && value > maxAllowed;
  const canSend = !tooLow && !overCap && value > 0;

  const activeHint = selectedId ? presets.find((p) => p.id === selectedId)?.hint : null;

  return (
    <div className="rounded-md border border-hairline-bright bg-bg-elev-2 p-4">
      <div className="mb-3 flex items-center gap-4 text-[10px] uppercase tracking-[0.12em] text-ink-dim">
        <span>counter offer</span>
        <span className="text-ink-faint">·</span>
        <span>
          their bid <span className="tabular-nums text-ink">{formatCash(offerAmount)}</span>
        </span>
        {marketValue != null ? (
          <>
            <span className="text-ink-faint">·</span>
            <span>
              market value <span className="tabular-nums text-ink">{formatCash(marketValue)}</span>
            </span>
          </>
        ) : null}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {presets.map((preset) => {
          const isActive = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => choose(preset)}
              className={`flex flex-col items-start rounded-[4px] border px-2.5 py-2 text-left transition-colors duration-150 ${
                isActive
                  ? 'border-accent bg-accent-faint text-accent-bright'
                  : 'border-hairline-bright bg-bg text-ink hover:border-ink-faint'
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2 text-[11px] uppercase tracking-[0.10em]">
                <span>{preset.label}</span>
                <span className="tabular-nums text-[12px]">{formatCash(preset.value)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.12em] text-ink-dim" htmlFor="counter-custom">
            custom
          </label>
          <input
            id="counter-custom"
            ref={inputRef}
            type="number"
            min={0}
            step={10000}
            value={value}
            onChange={(e) => onCustomChange(Number(e.target.value) || 0)}
            className="w-44 rounded-[5px] border border-hairline-bright bg-bg px-2 py-1.5 text-right text-[14px] tabular-nums text-ink focus:border-accent focus:outline-none"
          />
          <span className="text-[12px] tabular-nums text-ink-mid">{formatCash(value)}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="primary" disabled={!canSend} onClick={() => onSend(value)}>
            send counter
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            cancel
          </Button>
        </div>
      </div>

      <div className="mt-3 min-h-[14px] text-[11px] tracking-[0.04em]">
        {tooLow ? (
          <span className="text-warn">counter must be higher than their bid.</span>
        ) : overCap ? (
          <span className="text-warn">over the club's reach — they will walk.</span>
        ) : activeHint ? (
          <span className="text-ink-dim font-body">{activeHint}</span>
        ) : (
          <span className="text-ink-faint font-body">pick a preset or type your own.</span>
        )}
      </div>
    </div>
  );
}
