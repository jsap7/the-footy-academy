import { getInflationFactor, INFLATION_BASE_YEAR } from './inflation';
import type { Player, QualityTier } from '../types';

export const STIPEND_MULTIPLIER_BY_TIER: Record<QualityTier, number> = {
  mid: 0.5,
  good: 1.0,
  great: 1.5,
  elite: 2.5,
  generational: 4.0,
};

// 20-21yo players are 3x the normal stipend per the design doc — academies
// can hold them but it's a real squeeze. 22+ are auto-released so they
// never hit the stipend math.
const SQUEEZE_AGE_MIN = 20;
const SQUEEZE_AGE_MAX = 21;
const SQUEEZE_MULT = 3;

export function calculateStipend(
  player: Player,
  currentYear: number = INFLATION_BASE_YEAR,
): number {
  const ageBase = player.age * 200;
  const tierMult = STIPEND_MULTIPLIER_BY_TIER[player.qualityTier];
  const ageMult = player.age >= SQUEEZE_AGE_MIN && player.age <= SQUEEZE_AGE_MAX ? SQUEEZE_MULT : 1;
  const inflationMult = getInflationFactor(currentYear);
  return Math.round(ageBase * tierMult * ageMult * inflationMult);
}
