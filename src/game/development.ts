import { ALL_STAT_KEYS, type Player, type PlayerStats, type StatKey } from '../types';

const BASE_RATE = 0.5; // average points per stat per month before modifiers

// Peaks 13-17, drops sharply after 19. 22+ are released so we never see them
// here, but the curve floors at 0 for safety.
function computeAgeCurve(age: number): number {
  if (age <= 12) return 1.0;
  if (age <= 17) return 1.4;
  if (age === 18) return 1.0;
  if (age === 19) return 0.6;
  if (age === 20) return 0.3;
  if (age === 21) return 0.1;
  return 0;
}

// Mostly small, occasional spike, occasional flat. Sampled per stat per month
// so a single player's stats grow asymmetrically.
function computeVariance(): number {
  const r = Math.random();
  if (r < 0.1) return 0; // flat month, no gain
  if (r < 0.85) return 0.5 + Math.random() * 0.5; // typical 0.5-1.0
  if (r < 0.97) return 1.0 + Math.random() * 1.0; // good 1.0-2.0
  return 2.0 + Math.random(); // breakout 2.0-3.0
}

function computeRawGain(
  current: number,
  potential: number,
  age: number,
  traitMult: number,
): number {
  if (current >= potential) return 0;
  const rawGain = BASE_RATE * computeAgeCurve(age) * computeVariance() * traitMult;
  const gap = potential - current;
  const gapBonus = Math.min(1.5, 1 + gap * 0.02);
  return rawGain * gapBonus;
}

// FOOTY-37 plugs in computeDevRateMultiplier from src/game/traits.ts.
type TraitMultiplierFn = (stat: StatKey, traitIds: readonly string[]) => number;

export function developPlayer(
  player: Player,
  traitMultiplier: TraitMultiplierFn = () => 1,
): {
  updated: Player;
  gainsByStat: Partial<Record<StatKey, number>>;
} {
  const newCurrent: PlayerStats = { ...player.stats.current };
  const newResidual: Partial<Record<StatKey, number>> = {};
  const gainsByStat: Partial<Record<StatKey, number>> = {};

  for (const stat of ALL_STAT_KEYS) {
    const cur = newCurrent[stat];
    const pot = player.stats.potential[stat];
    if (cur >= pot) continue;

    const traitMult = traitMultiplier(stat, player.traits);
    const rawGain = computeRawGain(cur, pot, player.age, traitMult);

    // Carry sub-1.0 fractional progress between turns so trait multipliers
    // actually compound over time instead of being eaten by Math.round.
    const carry = player.developmentResidual?.[stat] ?? 0;
    const accumulated = carry + rawGain;
    const integerGain = Math.floor(accumulated);
    const remainder = accumulated - integerGain;

    if (integerGain > 0) {
      const headroom = pot - cur;
      const applied = Math.min(integerGain, headroom);
      newCurrent[stat] = cur + applied;
      gainsByStat[stat] = applied;
      // Discard residual once we've capped — no point banking growth a
      // maxed stat will never use.
      if (newCurrent[stat] < pot) newResidual[stat] = remainder;
    } else if (remainder > 0) {
      newResidual[stat] = remainder;
    }
  }

  return {
    updated: {
      ...player,
      stats: { current: newCurrent, potential: player.stats.potential },
      lastTurnGains: gainsByStat,
      developmentResidual: newResidual,
    },
    gainsByStat,
  };
}
