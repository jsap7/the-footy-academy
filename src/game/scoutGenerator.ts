import { applyInflation, INFLATION_BASE_YEAR } from './inflation';
import { generateEnglishName } from './nameGenerator';
import type { Scout, ScoutLevel } from '../types/scout';

export const SCOUT_SALARIES: Record<ScoutLevel, number> = {
  1: 5_000,
  2: 20_000,
  3: 75_000,
  4: 200_000,
  5: 400_000,
};

// Most market scouts are mediocre. Sums to 1.0.
export const SCOUT_LEVEL_WEIGHTS: Record<ScoutLevel, number> = {
  1: 0.45,
  2: 0.3,
  3: 0.15,
  4: 0.08,
  5: 0.02,
};

export function rollScoutLevel(): ScoutLevel {
  const r = Math.random();
  let cumulative = 0;
  let lastLevel: ScoutLevel = 1;
  for (const level of [1, 2, 3, 4, 5] as ScoutLevel[]) {
    cumulative += SCOUT_LEVEL_WEIGHTS[level];
    lastLevel = level;
    if (r < cumulative) return level;
  }
  return lastLevel;
}

export function generateScout(currentYear: number = INFLATION_BASE_YEAR): Scout {
  return generateScoutAtLevel(rollScoutLevel(), currentYear);
}

export function generateScoutAtLevel(
  level: ScoutLevel,
  currentYear: number = INFLATION_BASE_YEAR,
): Scout {
  const { firstName, lastName } = generateEnglishName();
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    level,
    monthlySalary: applyInflation(SCOUT_SALARIES[level], currentYear),
  };
}

// Renormalize SCOUT_LEVEL_WEIGHTS over a restricted set of levels — used by
// the facility-aware scout market so each tier's pool reflects the original
// rarity curve within its allowed levels.
export function rollLevelFromAllowed(allowed: readonly ScoutLevel[]): ScoutLevel {
  if (allowed.length === 0) return 1;
  let total = 0;
  for (const lvl of allowed) total += SCOUT_LEVEL_WEIGHTS[lvl];
  if (total <= 0) return allowed[0];
  const r = Math.random() * total;
  let cumulative = 0;
  for (const lvl of allowed) {
    cumulative += SCOUT_LEVEL_WEIGHTS[lvl];
    if (r < cumulative) return lvl;
  }
  return allowed[allowed.length - 1];
}
