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
