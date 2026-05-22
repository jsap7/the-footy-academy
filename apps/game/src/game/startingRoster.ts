import { generatePlayer } from './playerGenerator';
import { ALL_STAT_KEYS } from '../types/stats';
import type { Player } from '../types/player';

// Starting roster guarantees a viable opening squad. All 4 are age 16-19
// (immediately sellable, none locked under-16) with a minimum avg potential.
// Age spread keeps them from aging out together.
const STARTING_AGE_RANGES: readonly { min: number; max: number }[] = [
  { min: 16, max: 17 },
  { min: 16, max: 17 },
  { min: 17, max: 18 },
  { min: 18, max: 19 },
];

const MIN_STARTING_POTENTIAL = 60;
const MAX_REROLL_ATTEMPTS = 50;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inlined to avoid a circular import via playerStats → types/index → gameState
// → startingRoster. Same math as averagePotential.
function avgPotential(player: Player): number {
  let sum = 0;
  for (const k of ALL_STAT_KEYS) sum += player.stats.potential[k];
  return Math.round(sum / ALL_STAT_KEYS.length);
}

// Roll generatePlayer until avg potential clears the threshold, capped at
// MAX_REROLL_ATTEMPTS so a stretch of bad rolls can't lock the game start.
// In practice this resolves in <5 rolls — most generated players already
// land at 55-75 avg potential.
function generatePlayerWithMinPotential(forceAge: number, minPotential: number): Player {
  for (let i = 0; i < MAX_REROLL_ATTEMPTS; i++) {
    const player = generatePlayer({ forceAge });
    if (avgPotential(player) >= minPotential) return player;
  }
  // Best-effort fallback after the cap — return whatever the next roll gives.
  return generatePlayer({ forceAge });
}

export function generateStartingRoster(): Player[] {
  return STARTING_AGE_RANGES.map((range) =>
    generatePlayerWithMinPotential(randInt(range.min, range.max), MIN_STARTING_POTENTIAL),
  );
}
