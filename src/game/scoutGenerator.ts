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

export function generateScout(): Scout {
  const level = rollScoutLevel();
  const { firstName, lastName } = generateEnglishName();
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    level,
    monthlySalary: SCOUT_SALARIES[level],
  };
}
