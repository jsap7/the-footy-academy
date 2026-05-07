import { findPlayerForScout } from './scoutFind';
import { computeSigningFee } from './signingFees';
import type { GameState, ShortlistEntry } from '../types';

// Shortlist lifespan in turns. With weekly turns, 12 turns = 3 months —
// matches the original monthly behavior. The field on the entry is still
// named `monthsRemaining` for save compat; ticks down 1 per week.
export const SHORTLIST_LIFESPAN_MONTHS = 12;

// 25% per scout per week — gives ~68% chance of at least one find per scout
// per month (1 - 0.75^4). Scout-less weeks still see other events; multi-scout
// setups will see ~1 find/week on average at 4 scouts.
const SCOUT_FIND_CHANCE_PER_WEEK = 0.25;

// Run all hired scouts → return new shortlist entries to add. Each scout
// rolls independently per week. Pure: doesn't mutate state.
export function runScoutFinds(state: GameState): ShortlistEntry[] {
  const finds: ShortlistEntry[] = [];
  for (const scout of state.scouts) {
    if (Math.random() >= SCOUT_FIND_CHANCE_PER_WEEK) continue;
    const player = findPlayerForScout(scout);
    finds.push({
      id: crypto.randomUUID(),
      player,
      foundByScoutId: scout.id,
      monthsRemaining: SHORTLIST_LIFESPAN_MONTHS,
      signingFee: computeSigningFee(player, state.currentYear),
    });
  }
  return finds;
}

export function tickShortlist(shortlist: readonly ShortlistEntry[]): ShortlistEntry[] {
  return shortlist
    .map((entry) => ({ ...entry, monthsRemaining: entry.monthsRemaining - 1 }))
    .filter((entry) => entry.monthsRemaining > 0);
}
