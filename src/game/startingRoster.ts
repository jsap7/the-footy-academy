import { generatePlayer } from './playerGenerator';
import type { Player } from '../types';

// FOOTY-71: guaranteed age distribution for the starting 4 players so the
// user always begins with at least 2 sellable kids (age >= 16). Tiers stay
// random — most starts will be all mid/good, occasionally with a great or
// elite slipping in. The age structure is what makes survival possible.
const STARTING_AGE_RANGES: readonly { min: number; max: number }[] = [
  { min: 12, max: 14 }, // long-term project
  { min: 15, max: 16 }, // mid-term
  { min: 16, max: 17 }, // sellable soon
  { min: 17, max: 19 }, // sellable now
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateStartingRoster(): Player[] {
  return STARTING_AGE_RANGES.map((range) =>
    generatePlayer({ forceAge: randInt(range.min, range.max) }),
  );
}
