import { ALL_PHASE_1_TRAITS } from '../data/traits/library';
import {
  ALL_STAT_KEYS,
  STAT_GROUPS,
  type PlayerStats,
  type StatGroup,
  type StatKey,
  type Trait,
  type TraitCategory,
  type TraitId,
} from '../types';

export const TRAIT_LIBRARY: Record<TraitId, Trait> = Object.fromEntries(
  ALL_PHASE_1_TRAITS.map((t) => [t.id, t]),
);

// Weighted random for how many traits a player gets at generation time.
// Sums to 1.0. Roughly matches the design doc distribution.
export const TRAIT_COUNT_WEIGHTS = {
  1: 0.4,
  2: 0.3,
  3: 0.2,
  4: 0.08,
  5: 0.02,
} as const;

export function getTrait(id: TraitId): Trait | undefined {
  return TRAIT_LIBRARY[id];
}

export function getAllTraits(): Trait[] {
  return Object.values(TRAIT_LIBRARY);
}

export function getTraitsByCategory(category: TraitCategory): Trait[] {
  return getAllTraits().filter((t) => t.category === category);
}

export function applyBaseEffects(
  stats: PlayerStats,
  traitIds: readonly TraitId[],
  applyTo: 'current' | 'potential',
): PlayerStats {
  const result: PlayerStats = { ...stats };
  for (const id of traitIds) {
    const trait = getTrait(id);
    if (!trait) continue;
    for (const effect of trait.baseEffects) {
      const target = effect.target ?? 'both';
      if (target !== 'both' && target !== applyTo) continue;
      result[effect.stat] = result[effect.stat] + effect.delta;
    }
  }
  for (const key of ALL_STAT_KEYS) {
    result[key] = clampStat(result[key]);
  }
  return result;
}

export function computeDevRateMultiplier(stat: StatKey, traitIds: readonly TraitId[]): number {
  const group = STAT_TO_GROUP[stat];
  let multiplier = 1;
  for (const id of traitIds) {
    const trait = getTrait(id);
    if (!trait) continue;
    for (const effect of trait.devRateEffects) {
      if (effect.target === 'all' || effect.target === stat || effect.target === group) {
        multiplier *= effect.multiplier;
      }
    }
  }
  return multiplier;
}

function clampStat(value: number): number {
  return Math.max(1, Math.min(100, Math.round(value)));
}

const STAT_TO_GROUP: Record<StatKey, StatGroup> = (() => {
  const map: Partial<Record<StatKey, StatGroup>> = {};
  const groups: readonly StatGroup[] = ['physical', 'technical', 'mental'];
  for (const group of groups) {
    for (const key of STAT_GROUPS[group]) {
      map[key] = group;
    }
  }
  return map as Record<StatKey, StatGroup>;
})();
