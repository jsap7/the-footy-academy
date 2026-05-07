import { useState } from 'react';
import { computeMarketValue } from '../game/marketValue';
import { averageCurrent, averagePotential } from '../game/playerStats';
import type { Club, Offer, OfferStatus, Player } from '../types';
import { formatCash } from '../util/format';
import Chip from '../ui/Chip';
import OfferRow from './OfferRow';

type Props = {
  player: Player | undefined;
  offers: readonly Offer[];
  clubsById: ReadonlyMap<string, Club>;
  onSelectPlayer: (playerId: string) => void;
  onAccept: (offerId: string) => void;
  onCounter: (offerId: string, counter: number) => void;
  onReject: (offerId: string) => void;
};

const STATUS_PRIORITY: Record<OfferStatus, number> = {
  pending: 0,
  countered: 1,
  accepted: 2,
  walked: 3,
  rejected: 4,
  expired: 5,
};

function offerSort(a: Offer, b: Offer): number {
  const pri = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  if (pri !== 0) return pri;
  return b.amount - a.amount;
}

function summarizeStatuses(offers: readonly Offer[]): string {
  const counts: Partial<Record<OfferStatus, number>> = {};
  for (const o of offers) counts[o.status] = (counts[o.status] ?? 0) + 1;
  const parts: string[] = [];
  if (counts.pending) parts.push(`${counts.pending} pending`);
  if (counts.countered) parts.push(`${counts.countered} countered`);
  if (counts.walked) parts.push(`${counts.walked} walked`);
  if (counts.rejected) parts.push(`${counts.rejected} rejected`);
  if (counts.expired) parts.push(`${counts.expired} expired`);
  return parts.join(' · ');
}

export default function OfferGroup({
  player,
  offers,
  clubsById,
  onSelectPlayer,
  onAccept,
  onCounter,
  onReject,
}: Props) {
  const sorted = [...offers].sort(offerSort);
  const activeOffers = sorted.filter((o) => o.status === 'pending' || o.status === 'countered');
  const bestActive = activeOffers.reduce((max, o) => Math.max(max, o.amount), 0);
  const hasActive = activeOffers.length > 0;
  const [expanded, setExpanded] = useState(hasActive);
  const summary = summarizeStatuses(sorted);
  const marketValue = player ? computeMarketValue(player) : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="grid w-full grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_24px] items-center gap-6 px-6 py-4 text-left transition-colors duration-150 hover:bg-bg-elev-2"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2 truncate text-[14px] text-ink">
            {player ? (
              <>
                <span className="truncate">
                  {player.firstName} {player.lastName}
                </span>
                <Chip tone="muted">{player.position}</Chip>
                <span className="text-[11px] text-ink-dim">age {player.age}</span>
              </>
            ) : (
              <span className="text-ink-dim">(sold or released)</span>
            )}
          </div>
          {player ? (
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {averageCurrent(player)}/{averagePotential(player)}
              {marketValue != null ? <> · mv {formatCash(marketValue)}</> : null}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 text-[12px] text-ink-mid">
          <span className="tabular-nums text-ink">
            {sorted.length} offer{sorted.length === 1 ? '' : 's'}
          </span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            {summary || '—'}
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 text-[12px]">
          {hasActive ? (
            <>
              <span className="text-[14px] tabular-nums text-ink">{formatCash(bestActive)}</span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                best active
              </span>
            </>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              no active offers
            </span>
          )}
        </div>
        <span aria-hidden className="text-right font-mono text-[12px] text-ink-mid leading-none">
          {expanded ? '^' : 'v'}
        </span>
      </button>
      {expanded ? (
        <div className="border-t border-hairline bg-bg pl-6">
          <div className="divide-y divide-hairline">
            {sorted.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                club={clubsById.get(offer.clubId)}
                player={player}
                marketValue={marketValue}
                onSelectPlayer={onSelectPlayer}
                onAccept={onAccept}
                onCounter={onCounter}
                onReject={onReject}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
