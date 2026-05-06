import { executeAcceptedOffers } from './offers';
import type { GameState } from '../types';

export function hireScout(state: GameState, scoutId: string): GameState {
  const scout = state.scoutMarket.find((s) => s.id === scoutId);
  if (!scout) return state;
  // No up-front cash deduction. The first monthlySalary is taken at the
  // next month-end via the turn loop. This avoids the double-bill the
  // spec flagged.
  return {
    ...state,
    scoutMarket: state.scoutMarket.filter((s) => s.id !== scoutId),
    scouts: [...state.scouts, scout],
  };
}

export function fireScout(state: GameState, scoutId: string): GameState {
  return {
    ...state,
    scouts: state.scouts.filter((s) => s.id !== scoutId),
  };
}

export function signPlayer(state: GameState, shortlistEntryId: string): GameState {
  const entry = state.shortlist.find((e) => e.id === shortlistEntryId);
  if (!entry) return state;
  if (state.cash < entry.signingFee) return state;
  return {
    ...state,
    cash: state.cash - entry.signingFee,
    shortlist: state.shortlist.filter((e) => e.id !== shortlistEntryId),
    roster: [entry.player, ...state.roster],
  };
}

// Accept the offer in-place — marks status accepted and immediately executes
// the sale so the UI sees the cash + roster change instantly. Adds a
// SaleEvent so the post-turn banner displays the win.
export function acceptOffer(state: GameState, offerId: string): GameState {
  const offer = state.pendingOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  if (offer.status !== 'pending' && offer.status !== 'countered') return state;
  const flagged: GameState = {
    ...state,
    pendingOffers: state.pendingOffers.map((o) =>
      o.id === offerId ? { ...o, status: 'accepted' as const } : o,
    ),
  };
  const result = executeAcceptedOffers(flagged);
  return {
    ...result.state,
    recentSales: [...state.recentSales, ...result.saleEvents],
  };
}

export function counterOffer(state: GameState, offerId: string, counter: number): GameState {
  if (counter <= 0) return state;
  const offer = state.pendingOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  if (offer.status !== 'pending') return state;
  return {
    ...state,
    pendingOffers: state.pendingOffers.map((o) =>
      o.id === offerId
        ? { ...o, yourCounter: Math.round(counter), status: 'countered' as const }
        : o,
    ),
  };
}

export function rejectOffer(state: GameState, offerId: string): GameState {
  const offer = state.pendingOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  if (offer.status !== 'pending' && offer.status !== 'countered') return state;
  return {
    ...state,
    pendingOffers: state.pendingOffers.map((o) =>
      o.id === offerId ? { ...o, status: 'rejected' as const } : o,
    ),
  };
}
