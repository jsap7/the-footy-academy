import type { Player, QualityTier } from '../types';

export const SIGNING_FEES_BY_TIER: Record<QualityTier, number> = {
  mid: 5_000,
  good: 15_000,
  great: 35_000,
  elite: 80_000,
  generational: 200_000,
};

const FEE_NOISE = 0.2; // ±20% randomness so same-tier kids don't all cost the same

export function computeSigningFee(player: Player): number {
  const base = SIGNING_FEES_BY_TIER[player.qualityTier];
  const factor = 1 + (Math.random() - 0.5) * 2 * FEE_NOISE;
  return Math.max(1, Math.round(base * factor));
}
