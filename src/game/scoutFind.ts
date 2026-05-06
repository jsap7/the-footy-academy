import { generatePlayer } from './playerGenerator';
import type { Player, QualityTier, Scout, ScoutLevel } from '../types';

// Probability that a scout of level L finds a player of each tier.
// Each row sums to 1.0. Top tiers should feel rare — at L5 elite is
// roughly one find every ~20 months and generational once every ~17
// years. L1 scouts can never surface elites or generational kids.
export const SCOUT_LEVEL_TIER_BIAS: Record<ScoutLevel, Record<QualityTier, number>> = {
  1: { mid: 0.92, good: 0.07, great: 0.01, elite: 0.0, generational: 0.0 },
  2: { mid: 0.7, good: 0.25, great: 0.05, elite: 0.0, generational: 0.0 },
  3: { mid: 0.4, good: 0.45, great: 0.14, elite: 0.01, generational: 0.0 },
  4: { mid: 0.2, good: 0.45, great: 0.32, elite: 0.03, generational: 0.0 },
  5: { mid: 0.1, good: 0.4, great: 0.45, elite: 0.045, generational: 0.005 },
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
