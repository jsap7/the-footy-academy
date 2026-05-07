import { getInflationFactor, INFLATION_BASE_YEAR } from './inflation';
import type { Player, QualityTier } from '../types';

export const SIGNING_FEES_BY_TIER: Record<QualityTier, number> = {
  mid: 15_000,
  good: 40_000,
  great: 100_000,
  elite: 250_000,
  generational: 800_000,
};

const FEE_NOISE = 0.15; // ±15% randomness so same-tier kids don't all cost the same

// Locked at find time so the user never sees the fee jiggle between viewing
// and signing. currentYear is captured the moment the scout surfaces the kid.
export function computeSigningFee(
  player: Player,
  currentYear: number = INFLATION_BASE_YEAR,
): number {
  const base = SIGNING_FEES_BY_TIER[player.qualityTier];
  const factor = 1 + (Math.random() - 0.5) * 2 * FEE_NOISE;
  const inflated = base * factor * getInflationFactor(currentYear);
  // Round to the nearest €1k so the displayed fee is clean.
  return Math.max(1_000, Math.round(inflated / 1_000) * 1_000);
}
