import { useState } from 'react';
import { computeMarketValue } from '../game/marketValue';
import { MINIMUM_TRANSFER_AGE } from '../game/offers';
import type { Player } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';

type Props = {
  player: Player;
  onSetAvailable: (playerId: string, available: boolean) => void;
  onList: (playerId: string, price: number) => void;
  onUnlist: (playerId: string) => void;
  onSetBlockOffers?: (playerId: string, blocked: boolean) => void;
};

export default function SellingControls({
  player,
  onSetAvailable,
  onList,
  onUnlist,
  onSetBlockOffers,
}: Props) {
  const trueValue = computeMarketValue(player);
  const [composing, setComposing] = useState(false);
  const [price, setPrice] = useState(() => Math.round(trueValue));
  const blocked = player.blockOffers;
  const ageLocked = player.age < MINIMUM_TRANSFER_AGE;
  const sellingDisabled = blocked || ageLocked;

  const presets = [
    { label: '×0.8', value: Math.round(trueValue * 0.8) },
    { label: '×1.0', value: Math.round(trueValue) },
    { label: '×1.2', value: Math.round(trueValue * 1.2) },
    { label: '×1.5', value: Math.round(trueValue * 1.5) },
  ];

  return (
    <div className="space-y-4">
      {ageLocked ? (
        <div className="rounded-md border border-hairline-bright bg-bg-elev-2 px-3 py-2 text-[11px] text-ink-mid font-body">
          <span className="text-ink">locked under {MINIMUM_TRANSFER_AGE}.</span> selling unlocks
          automatically on this player's 16th birthday.
        </div>
      ) : null}

      <div
        className={`flex items-center justify-between gap-3 ${sellingDisabled ? 'opacity-40' : ''}`}
      >
        <div>
          <span className="text-[12px] text-ink">available for sale</span>
          <p className="mt-1 text-[11px] text-ink-dim font-body">
            doubles offer frequency from clubs.
          </p>
        </div>
        <Button
          variant={player.availableForSale ? 'primary' : 'default'}
          disabled={sellingDisabled}
          onClick={() => onSetAvailable(player.id, !player.availableForSale)}
        >
          {player.availableForSale ? 'on' : 'off'}
        </Button>
      </div>

      <div className={`border-t border-hairline pt-4 ${sellingDisabled ? 'opacity-40' : ''}`}>
        {player.askingPrice != null ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[12px] text-ink">listed at </span>
              <span className="text-[12px] tabular-nums text-accent-bright">
                {formatCash(player.askingPrice)}
              </span>
              <p className="mt-1 text-[11px] text-ink-dim font-body">
                clubs respond directly to the asking price.
              </p>
            </div>
            <Button onClick={() => onUnlist(player.id)}>unlist</Button>
          </div>
        ) : composing && !sellingDisabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-36 rounded-[5px] border border-hairline-bright bg-bg px-2 py-1.5 text-right text-[13px] tabular-nums text-ink focus:border-accent focus:outline-none"
              />
              <span className="text-[11px] text-ink-dim">{formatCash(price)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPrice(p.value)}
                  className="rounded-[3px] border border-hairline-bright px-2 py-1 text-[10px] uppercase tracking-[0.10em] text-ink-mid transition-colors hover:border-accent hover:text-accent-bright"
                >
                  {p.label} {formatCash(p.value)}
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
              <Button variant="ghost" onClick={() => setComposing(false)}>
                cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[12px] text-ink">not listed</span>
              <p className="mt-1 text-[11px] text-ink-dim font-body">
                set an asking price to nudge clubs into bidding.
              </p>
            </div>
            <Button disabled={sellingDisabled} onClick={() => setComposing(true)}>
              list for sale
            </Button>
          </div>
        )}
      </div>

      {onSetBlockOffers && (
        <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
          <div>
            <span className="text-[12px] text-ink">block offers</span>
            <p className="mt-1 text-[11px] text-ink-dim font-body">
              clubs stop sending unsolicited bids. existing offers stay until resolved.
            </p>
          </div>
          <Button
            variant={blocked ? 'danger' : 'default'}
            onClick={() => onSetBlockOffers(player.id, !blocked)}
          >
            {blocked ? 'on' : 'off'}
          </Button>
        </div>
      )}
    </div>
  );
}
