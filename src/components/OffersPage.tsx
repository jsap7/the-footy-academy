import { useState } from 'react';
import { acceptOffer, counterOffer, rejectOffer } from '../game/gameActions';
import type { GameState, OfferStatus } from '../types';
import Card from '../ui/Card';
import OfferRow from './OfferRow';

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

export default function OffersPage({ state, onChange, onSelectPlayer }: Props) {
  const [filter, setFilter] = useState<FilterKey>('pending');

  const ordered = [...state.pendingOffers].sort((a, b) => {
    if (a.createdYear !== b.createdYear) return b.createdYear - a.createdYear;
    return b.createdMonth - a.createdMonth;
  });

  const filtered = ordered.filter((o) => FILTER_PREDICATE[filter](o.status));

  // Counts by filter for the chip badges.
  const counts: Record<FilterKey, number> = {
    all: ordered.length,
    pending: ordered.filter((o) => FILTER_PREDICATE.pending(o.status)).length,
    completed: ordered.filter((o) => FILTER_PREDICATE.completed(o.status)).length,
    archive: ordered.filter((o) => FILTER_PREDICATE.archive(o.status)).length,
  };

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

      {filtered.length === 0 ? (
        <Card>
          <p className="text-center text-[13px] text-ink-dim font-body">
            no offers match this filter.
          </p>
        </Card>
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-hairline">
            {filtered.map((offer) => {
              const club = state.clubs.find((c) => c.id === offer.clubId);
              const player = state.roster.find((p) => p.id === offer.playerId);
              return (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  club={club}
                  player={player}
                  onSelectPlayer={onSelectPlayer}
                  onAccept={(id) => onChange(acceptOffer(state, id))}
                  onCounter={(id, amt) => onChange(counterOffer(state, id, amt))}
                  onReject={(id) => onChange(rejectOffer(state, id))}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
