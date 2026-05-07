import type { QualityTier } from '../types';

export const TIER_WEIGHTS: Record<QualityTier, number> = {
  mid: 0.6,
  good: 0.25,
  great: 0.1,
  elite: 0.04,
  generational: 0.01,
};

// Bands intentionally overlap. A lucky `good` kid can roll like an unlucky
// `great` kid — the fuzz keeps tiers from feeling like hard buckets.
export const TIER_POTENTIAL_BANDS: Record<
  QualityTier,
  { min: number; max: number; center: number; stddev: number }
> = {
  mid: { min: 40, max: 58, center: 49, stddev: 6 },
  good: { min: 55, max: 72, center: 63, stddev: 6 },
  great: { min: 65, max: 82, center: 73, stddev: 6 },
  elite: { min: 78, max: 90, center: 84, stddev: 4 },
  generational: { min: 85, max: 99, center: 92, stddev: 4 },
};

// Per-tier trait-count weights. Each tier's weights sum to 1.0.
// Generational kids almost always have 4-5 traits; mid kids almost always 1-2.
export const TIER_TRAIT_COUNT_WEIGHTS: Record<QualityTier, Record<number, number>> = {
  mid: { 1: 0.6, 2: 0.35, 3: 0.05 },
  good: { 1: 0.1, 2: 0.5, 3: 0.4 },
  great: { 2: 0.4, 3: 0.45, 4: 0.15 },
  elite: { 2: 0.1, 3: 0.5, 4: 0.4 },
  generational: { 3: 0.1, 4: 0.4, 5: 0.5 },
};

export function rollQualityTier(): QualityTier {
  const r = Math.random();
  let cumulative = 0;
  let lastTier: QualityTier = 'mid';
  for (const tier of Object.keys(TIER_WEIGHTS) as QualityTier[]) {
    cumulative += TIER_WEIGHTS[tier];
    lastTier = tier;
    if (r < cumulative) return tier;
  }
  return lastTier;
}
