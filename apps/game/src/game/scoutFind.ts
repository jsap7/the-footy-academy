import { generatePlayer } from './playerGenerator';
import type { Player, QualityTier, Scout, ScoutLevel } from '../types';

// Probability that a scout of level L finds a player of each tier.
// Each row sums to 1.0. Every level keeps a tiny non-zero chance at every
// tier so the dream is never fully locked out. Top scouts are still
// dramatically more capable; L1 elite finds are once-per-career miracles.
export const SCOUT_LEVEL_TIER_BIAS: Record<ScoutLevel, Record<QualityTier, number>> = {
  1: { mid: 0.95, good: 0.037, great: 0.01, elite: 0.002, generational: 0.001 },
  2: { mid: 0.77, good: 0.18, great: 0.044, elite: 0.004, generational: 0.002 },
  3: { mid: 0.66, good: 0.25, great: 0.077, elite: 0.01, generational: 0.003 },
  4: { mid: 0.33, good: 0.45, great: 0.19, elite: 0.025, generational: 0.005 },
  5: { mid: 0.1, good: 0.4, great: 0.45, elite: 0.04, generational: 0.01 },
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
