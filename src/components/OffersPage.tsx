import { acceptOffer, counterOffer, rejectOffer } from '../game/gameActions';
import type { GameState } from '../types';
import OfferRow from './OfferRow';

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
  onSelectPlayer: (playerId: string) => void;
};

export default function OffersPage({ state, onChange, onSelectPlayer }: Props) {
  if (state.pendingOffers.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center text-[16px] text-ink-dim">
        <p className="text-[22px] uppercase tracking-[0.04em] text-ink">no offers yet</p>
        <p className="mt-3 max-w-md">
          sign players and clubs will start coming. better players and listed players surface
          offers faster.
        </p>
      </div>
    );
  }

  // Reverse chronological order — newest at top.
  const ordered = [...state.pendingOffers].sort((a, b) => {
    if (a.createdYear !== b.createdYear) return b.createdYear - a.createdYear;
    return b.createdMonth - a.createdMonth;
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {ordered.map((offer) => {
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
  );
}
