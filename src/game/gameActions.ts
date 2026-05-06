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

export function setPlayerAvailable(
  state: GameState,
  playerId: string,
  available: boolean,
): GameState {
  return {
    ...state,
    roster: state.roster.map((p) =>
      p.id === playerId
        ? { ...p, availableForSale: available, blockOffers: available ? false : p.blockOffers }
        : p,
    ),
  };
}

const MIN_ASKING_PRICE = 1_000;

export function listPlayer(state: GameState, playerId: string, askingPrice: number): GameState {
  const clamped = Math.max(MIN_ASKING_PRICE, Math.round(askingPrice));
  return {
    ...state,
    roster: state.roster.map((p) =>
      p.id === playerId ? { ...p, askingPrice: clamped, blockOffers: false } : p,
    ),
  };
}

export function unlistPlayer(state: GameState, playerId: string): GameState {
  return {
    ...state,
    roster: state.roster.map((p) => (p.id === playerId ? { ...p, askingPrice: null } : p)),
  };
}

// Toggle the per-player block-offers flag. When turning ON, also clear
// availableForSale + askingPrice — they're mutually exclusive UI states.
// Existing pending offers stay so the user can resolve them manually.
export function setPlayerBlockOffers(
  state: GameState,
  playerId: string,
  blocked: boolean,
): GameState {
  return {
    ...state,
    roster: state.roster.map((p) =>
      p.id === playerId
        ? blocked
          ? { ...p, blockOffers: true, availableForSale: false, askingPrice: null }
          : { ...p, blockOffers: false }
        : p,
    ),
  };
}

// Drop a shortlist entry. Used when a scout's find isn't worth a signing
// slot — clears the row so it doesn't keep showing up against the cap.
export function rejectShortlistEntry(state: GameState, entryId: string): GameState {
  const entry = state.shortlist.find((e) => e.id === entryId);
  if (!entry) return state;
  return {
    ...state,
    shortlist: state.shortlist.filter((e) => e.id !== entryId),
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
