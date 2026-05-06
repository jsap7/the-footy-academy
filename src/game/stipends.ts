import type { Player, QualityTier } from '../types';

export const STIPEND_MULTIPLIER_BY_TIER: Record<QualityTier, number> = {
  mid: 0.5,
  good: 1.0,
  great: 1.5,
  elite: 2.5,
  generational: 4.0,
};

// monthly stipend = (age × €200) × visible_quality_multiplier (per design doc)
// We use qualityTier directly as visible quality until phase 2b/3 introduces
// a scout-mediated visibility layer.
export function calculateStipend(player: Player): number {
  const ageBase = player.age * 200;
  const multiplier = STIPEND_MULTIPLIER_BY_TIER[player.qualityTier];
  return Math.round(ageBase * multiplier);
}
