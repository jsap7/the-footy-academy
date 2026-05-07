import { computeDevRateMultiplier } from './traits';
import { computeMarketValue } from './marketValue';
import { ALL_STAT_KEYS, type Player, type PlayerStats, type StatKey } from '../types';

// Mirror src/game/development.ts BASE_RATE — kept private here so projection
// stays decoupled from the dev engine even if its internals shift.
const BASE_RATE = 0.7;

// Expected value of computeVariance(): 10% × 0 + 75% × 0.75 + 12% × 1.5 + 3% × 2.5 = ~0.82
const VARIANCE_EXPECTED = 0.82;

function ageCurve(age: number): number {
  if (age <= 12) return 1.0;
  if (age <= 17) return 1.4;
  if (age === 18) return 1.0;
  if (age === 19) return 0.6;
  if (age === 20) return 0.3;
  if (age === 21) return 0.1;
  return 0;
}

function expectedMonthlyGain(
  current: number,
  potential: number,
  age: number,
  traitMult: number,
  facilityMult: number,
): number {
  if (current >= potential) return 0;
  const raw = BASE_RATE * ageCurve(age) * VARIANCE_EXPECTED * traitMult * facilityMult;
  const gap = potential - current;
  const gapBonus = Math.min(1.5, 1 + gap * 0.02);
  return raw * gapBonus;
}

// Deterministic forward projection of a player N months into the future.
// Uses expected variance (no rolls), so the same input always returns the
// same output. Caller passes the current facility multiplier so the
// projection reflects the user's current academy.
export function projectPlayer(
  player: Player,
  monthsForward: number,
  facilityMultiplier = 1.0,
): Player {
  const current: PlayerStats = { ...player.stats.current };
  const carry: Partial<Record<StatKey, number>> = {};
  let age = player.age;
  const startMonth = player.birthMonth;
  for (let m = 1; m <= monthsForward; m++) {
    // Fire a birthday on the appropriate tick (simplified: every 12 months
    // from where the player currently sits relative to their birth month).
    if ((m + (12 - startMonth + age * 12)) % 12 === 0 && m > 0) {
      // do nothing — handled below
    }
    // Increment age once per 12 months on schedule (approximate but stable).
    if (m % 12 === 0) age = age + 1;

    for (const stat of ALL_STAT_KEYS) {
      const cur = current[stat];
      const pot = player.stats.potential[stat];
      if (cur >= pot) continue;
      const traitMult = computeDevRateMultiplier(stat, player.traits);
      const gain = expectedMonthlyGain(cur, pot, age, traitMult, facilityMultiplier);
      const accumulated = (carry[stat] ?? 0) + gain;
      const integerGain = Math.floor(accumulated);
      const remainder = accumulated - integerGain;
      if (integerGain > 0) {
        const headroom = pot - cur;
        current[stat] = cur + Math.min(integerGain, headroom);
        carry[stat] = current[stat] < pot ? remainder : 0;
      } else {
        carry[stat] = remainder;
      }
    }
  }
  return {
    ...player,
    age,
    stats: { current, potential: player.stats.potential },
  };
}

export type MVProjection = {
  age: number;
  monthsForward: number;
  mv: number;
};

// Project MV at each of the requested target ages. Skips ages <= player's
// current age (returns null entries the caller can filter). Targets at age
// 22+ are clipped to age 21 since players auto-release at 22.
export function projectMVAtAges(
  player: Player,
  targetAges: readonly number[],
  facilityMultiplier = 1.0,
): MVProjection[] {
  const out: MVProjection[] = [];
  for (const target of targetAges) {
    if (target <= player.age) continue;
    if (target > 21) continue;
    const months = (target - player.age) * 12;
    const projected = projectPlayer(player, months, facilityMultiplier);
    out.push({ age: target, monthsForward: months, mv: computeMarketValue(projected) });
  }
  return out;
}
