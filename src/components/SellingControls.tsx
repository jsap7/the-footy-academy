import { useState } from 'react';
import { computeMarketValue } from '../game/marketValue';
import type { Player } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';

type Props = {
  player: Player;
  onSetAvailable: (playerId: string, available: boolean) => void;
  onList: (playerId: string, price: number) => void;
  onUnlist: (playerId: string) => void;
};

export default function SellingControls({
  player,
  onSetAvailable,
  onList,
  onUnlist,
}: Props) {
  const trueValue = computeMarketValue(player);
  const [composing, setComposing] = useState(false);
  const [price, setPrice] = useState(() => Math.round(trueValue));

  const presets = [
    { label: '×0.8', value: Math.round(trueValue * 0.8) },
    { label: '×1.0', value: Math.round(trueValue) },
    { label: '×1.2', value: Math.round(trueValue * 1.2) },
    { label: '×1.5', value: Math.round(trueValue * 1.5) },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[14px] text-ink">available for sale</span>
          <p className="text-[11px] text-ink-dim">
            doubles offer frequency from clubs.
          </p>
        </div>
        <Button
          variant={player.availableForSale ? 'primary' : 'default'}
          onClick={() => onSetAvailable(player.id, !player.availableForSale)}
        >
          {player.availableForSale ? 'on' : 'off'}
        </Button>
      </div>

      <div className="border-t border-hairline pt-3">
        {player.askingPrice != null ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[14px] text-ink">listed at </span>
              <span className="font-mono tabular-nums text-accent">
                {formatCash(player.askingPrice)}
              </span>
              <p className="text-[11px] text-ink-dim">
                clubs respond directly to the asking price.
              </p>
            </div>
            <Button onClick={() => onUnlist(player.id)}>unlist</Button>
          </div>
        ) : composing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-32 border border-hairline bg-bg-row px-2 py-1 text-right font-mono text-[16px] tabular-nums text-ink focus:border-accent focus:outline-none"
              />
              <span className="text-[12px] text-ink-dim">{formatCash(price)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPrice(p.value)}
                  className="border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-[0.10em] text-ink-mid hover:border-accent hover:text-accent"
                >
                  {p.label} ({formatCash(p.value)})
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  onList(player.id, price);
                  setComposing(false);
                }}
              >
                list
              </Button>
              <Button onClick={() => setComposing(false)}>cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[14px] text-ink">not listed</span>
              <p className="text-[11px] text-ink-dim">
                set an asking price to nudge clubs into bidding.
              </p>
            </div>
            <Button onClick={() => setComposing(true)}>list for sale</Button>
          </div>
        )}
      </div>
    </div>
  );
}
