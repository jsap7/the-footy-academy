import { findPlayerForScout } from './scoutFind';
import { computeSigningFee } from './signingFees';
import type { GameState, ShortlistEntry } from '../types';

export const SHORTLIST_LIFESPAN_MONTHS = 3;

// Run all hired scouts → return new shortlist entries to add. Pure: doesn't
// mutate state. Caller is responsible for appending the result to
// state.shortlist BEFORE calling tickShortlist (so the new finds get one
// fewer effective month, matching the spec).
export function runScoutFinds(state: GameState): ShortlistEntry[] {
  return state.scouts.map((scout) => {
    const player = findPlayerForScout(scout);
    return {
      id: crypto.randomUUID(),
      player,
      foundByScoutId: scout.id,
      monthsRemaining: SHORTLIST_LIFESPAN_MONTHS,
      signingFee: computeSigningFee(player),
    };
  });
}

export function tickShortlist(shortlist: readonly ShortlistEntry[]): ShortlistEntry[] {
  return shortlist
    .map((entry) => ({ ...entry, monthsRemaining: entry.monthsRemaining - 1 }))
    .filter((entry) => entry.monthsRemaining > 0);
}
