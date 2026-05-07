import { useMemo, useState } from 'react';
import { acceptOffer, counterOffer, rejectOffer } from '../game/gameActions';
import type { GameState, Offer, OfferStatus } from '../types';
import Card from '../ui/Card';
import OfferGroup from './OfferGroup';

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
  onSelectPlayer: (playerId: string) => void;
};

type FilterKey = 'all' | 'pending' | 'completed' | 'archive';

const FILTER_LABEL: Record<FilterKey, string> = {
  all: 'all',
  pending: 'pending',
  completed: 'completed',
  archive: 'archive',
};

const FILTER_PREDICATE: Record<FilterKey, (s: OfferStatus) => boolean> = {
  all: () => true,
  pending: (s) => s === 'pending' || s === 'countered',
  completed: (s) => s === 'accepted',
  archive: (s) => s === 'walked' || s === 'rejected' || s === 'expired',
};

function bestActiveAmount(offers: readonly Offer[]): number {
  let best = 0;
  for (const o of offers) {
    if (o.status === 'pending' || o.status === 'countered') {
      if (o.amount > best) best = o.amount;
    }
  }
  return best;
}

function newestTimestamp(offers: readonly Offer[]): number {
  let max = 0;
  for (const o of offers) {
    const ts = o.createdYear * 12 + o.createdMonth;
    if (ts > max) max = ts;
  }
  return max;
}

export default function OffersPage({ state, onChange, onSelectPlayer }: Props) {
  const [filter, setFilter] = useState<FilterKey>('pending');

  const filteredOffers = state.pendingOffers.filter((o) => FILTER_PREDICATE[filter](o.status));

  const counts: Record<FilterKey, number> = {
    all: state.pendingOffers.length,
    pending: state.pendingOffers.filter((o) => FILTER_PREDICATE.pending(o.status)).length,
    completed: state.pendingOffers.filter((o) => FILTER_PREDICATE.completed(o.status)).length,
    archive: state.pendingOffers.filter((o) => FILTER_PREDICATE.archive(o.status)).length,
  };

  const clubsById = useMemo(() => new Map(state.clubs.map((c) => [c.id, c])), [state.clubs]);
  const playerById = useMemo(() => new Map(state.roster.map((p) => [p.id, p])), [state.roster]);

  const groups = useMemo(() => {
    const map = new Map<string, Offer[]>();
    for (const offer of filteredOffers) {
      const bucket = map.get(offer.playerId);
      if (bucket) bucket.push(offer);
      else map.set(offer.playerId, [offer]);
    }
    return [...map.entries()]
      .map(([playerId, offers]) => ({ playerId, offers }))
      .sort((a, b) => {
        const aBest = bestActiveAmount(a.offers);
        const bBest = bestActiveAmount(b.offers);
        if (aBest !== bBest) return bBest - aBest;
        return newestTimestamp(b.offers) - newestTimestamp(a.offers);
      });
  }, [filteredOffers]);

  if (state.pendingOffers.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-12 py-24 text-center">
        <p className="text-[20px] uppercase tracking-[0.06em] text-ink">no offers yet</p>
        <p className="mt-3 max-w-md text-[13px] text-ink-mid font-body">
          sign players and clubs will start coming. better players and listed players surface offers
          faster.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'completed', 'archive', 'all'] as FilterKey[]).map((key) => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`group inline-flex items-center gap-2 rounded-[5px] border px-3 py-1.5 text-[11px] uppercase tracking-[0.10em] transition-colors duration-150 ${
                isActive
                  ? 'border-accent-dim bg-accent-faint text-accent-bright'
                  : 'border-hairline-bright bg-bg-elev text-ink-mid hover:bg-bg-elev-2 hover:text-ink'
              }`}
            >
              <span>{FILTER_LABEL[key]}</span>
              <span
                className={`tabular-nums ${
                  isActive ? 'text-accent-bright' : 'text-ink-faint group-hover:text-ink-dim'
                }`}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-center text-[13px] text-ink-dim font-body">
            no offers match this filter.
          </p>
        </Card>
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-hairline">
            {groups.map(({ playerId, offers }) => (
              <OfferGroup
                key={playerId}
                player={playerById.get(playerId)}
                offers={offers}
                clubsById={clubsById}
                onSelectPlayer={onSelectPlayer}
                onAccept={(id) => onChange(acceptOffer(state, id))}
                onCounter={(id, amt) => onChange(counterOffer(state, id, amt))}
                onReject={(id) => onChange(rejectOffer(state, id))}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
