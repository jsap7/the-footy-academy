import { generatePlayer } from './playerGenerator';
import type { Player, QualityTier, Scout, ScoutLevel } from '../types';

// Probability that a scout of level L finds a player of each tier.
// Each row sums to 1.0. Lower-level scouts mostly surface mid players;
// only L4-L5 scouts have a meaningful shot at generational kids.
export const SCOUT_LEVEL_TIER_BIAS: Record<ScoutLevel, Record<QualityTier, number>> = {
  1: { mid: 0.85, good: 0.13, great: 0.02, elite: 0.0, generational: 0.0 },
  2: { mid: 0.65, good: 0.28, great: 0.06, elite: 0.01, generational: 0.0 },
  3: { mid: 0.45, good: 0.35, great: 0.16, elite: 0.03, generational: 0.01 },
  4: { mid: 0.25, good: 0.35, great: 0.28, elite: 0.1, generational: 0.02 },
  5: { mid: 0.1, good: 0.3, great: 0.35, elite: 0.2, generational: 0.05 },
};

const TIER_ORDER: readonly QualityTier[] = ['mid', 'good', 'great', 'elite', 'generational'];

export function rollFindTier(level: ScoutLevel): QualityTier {
  const weights = SCOUT_LEVEL_TIER_BIAS[level];
  const r = Math.random();
  let cumulative = 0;
  let last: QualityTier = 'mid';
  for (const tier of TIER_ORDER) {
    cumulative += weights[tier];
    last = tier;
    if (r < cumulative) return tier;
  }
  return last;
}

export function findPlayerForScout(scout: Scout): Player {
  const forceTier = rollFindTier(scout.level);
  return generatePlayer({ forceTier });
}
