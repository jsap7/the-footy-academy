import { useState } from 'react';
import type { Club, Offer, OfferStatus, Player } from '../types';
import { formatCash } from '../util/format';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import CounterOfferInput from './CounterOfferInput';

type Props = {
  offer: Offer;
  club: Club | undefined;
  player: Player | undefined;
  marketValue?: number | null;
  onSelectPlayer: (playerId: string) => void;
  onAccept: (offerId: string) => void;
  onCounter: (offerId: string, counter: number) => void;
  onReject: (offerId: string) => void;
};

const STATUS_LABEL: Record<OfferStatus, string> = {
  pending: 'pending',
  countered: 'awaiting response',
  accepted: 'sale completed',
  rejected: 'rejected',
  walked: 'club walked away',
  expired: 'expired',
};

const STATUS_TONE: Record<OfferStatus, 'neutral' | 'accent' | 'good' | 'danger' | 'muted'> = {
  pending: 'neutral',
  countered: 'accent',
  accepted: 'good',
  rejected: 'muted',
  walked: 'danger',
  expired: 'muted',
};

function deltaToneClass(deltaPct: number): string {
  if (deltaPct > 5) return 'text-accent-bright';
  if (deltaPct < -5) return 'text-warn';
  return 'text-ink-mid';
}

function formatDelta(deltaPct: number): string {
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct.toFixed(0)}% vs mv`;
}

export default function OfferRow({
  offer,
  club,
  player,
  marketValue,
  onSelectPlayer,
  onAccept,
  onCounter,
  onReject,
}: Props) {
  const [countering, setCountering] = useState(false);
  const actionable = offer.status === 'pending';
  const deltaPct =
    marketValue != null && marketValue > 0
      ? ((offer.amount - marketValue) / marketValue) * 100
      : null;

  return (
    <div className="px-6 py-5 transition-colors duration-150 hover:bg-bg-elev-2">
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_140px_minmax(0,160px)_minmax(0,auto)] items-center gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[14px] text-ink">{club?.name ?? offer.clubId}</span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-dim">
            tier {club?.tier ?? '?'} · {club?.country ?? ''}
          </span>
        </div>
        <button
          type="button"
          className="truncate text-left text-[14px] text-ink hover:text-accent-bright"
          onClick={() => player && onSelectPlayer(player.id)}
        >
          {player ? (
            `${player.firstName} ${player.lastName}`
          ) : (
            <span className="text-ink-dim">(sold)</span>
          )}
        </button>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[16px] tabular-nums text-ink">{formatCash(offer.amount)}</span>
          {deltaPct != null ? (
            <span className={`text-[10px] tabular-nums ${deltaToneClass(deltaPct)}`}>
              {formatDelta(deltaPct)}
            </span>
          ) : null}
          {offer.yourCounter ? (
            <span className="text-[11px] text-ink-dim">you: {formatCash(offer.yourCounter)}</span>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <Chip tone={STATUS_TONE[offer.status]}>{STATUS_LABEL[offer.status]}</Chip>
          {(offer.status === 'pending' || offer.status === 'countered') && (
            <span className="text-[10px] tracking-[0.10em] text-ink-faint">
              {offer.turnsRemaining}mo to respond
            </span>
          )}
        </div>
        <div className="flex justify-end">
          {actionable ? (
            !countering ? (
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => onAccept(offer.id)}>
                  accept
                </Button>
                <Button onClick={() => setCountering(true)}>counter</Button>
                <Button variant="ghost" onClick={() => onReject(offer.id)}>
                  reject
                </Button>
              </div>
            ) : null
          ) : null}
        </div>
      </div>
      {actionable && countering ? (
        <div className="mt-4 border-t border-hairline pt-4">
          <CounterOfferInput
            offerAmount={offer.amount}
            marketValue={marketValue ?? null}
            maxAllowed={club ? Math.round(club.wealthCeiling * 1.5) : null}
            onSend={(amt) => {
              onCounter(offer.id, amt);
              setCountering(false);
            }}
            onCancel={() => setCountering(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
