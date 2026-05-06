import { generateEnglishName } from './nameGenerator';
import {
  ALL_STAT_KEYS,
  OUTFIELD_POSITIONS,
  type OutfieldPosition,
  type Player,
  type PlayerStats,
  type StatKey,
} from '../types';

const POTENTIAL_MEAN = 60;
const POTENTIAL_STDDEV = 12;
const POTENTIAL_MIN = 20;
const POTENTIAL_MAX = 95;

// Position-relevant stats get a flat bonus on potential. Cap above the base
// max so position-relevant stats can edge into the 80s-90s for above-average
// kids without ever pinning at 100 in phase 0 (no generational tier yet).
const POSITION_BONUS = 10;
const POTENTIAL_BONUS_CAP = 99;

const POSITION_BONUSES: Record<OutfieldPosition, readonly StatKey[]> = {
  CB: ['strength', 'jumpingReach', 'heading', 'tackling', 'positioning'],
  LB: ['pace', 'stamina', 'crossing', 'tackling'],
  RB: ['pace', 'stamina', 'crossing', 'tackling'],
  LWB: ['pace', 'stamina', 'crossing', 'tackling'],
  RWB: ['pace', 'stamina', 'crossing', 'tackling'],
  CDM: ['stamina', 'tackling', 'positioning', 'decisions'],
  CM: ['passingShort', 'passingLong', 'vision', 'stamina'],
  CAM: ['vision', 'technique', 'passingShort', 'dribbling'],
  LM: ['pace', 'stamina', 'crossing', 'dribbling'],
  RM: ['pace', 'stamina', 'crossing', 'dribbling'],
  LW: ['pace', 'dribbling', 'technique', 'finishing'],
  RW: ['pace', 'dribbling', 'technique', 'finishing'],
  CF: ['finishing', 'composure', 'anticipation', 'heading'],
  ST: ['finishing', 'composure', 'anticipation', 'heading'],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Box-Muller: a single sample from a normal distribution.
function normalSample(mean: number, stddev: number): number {
  let u1 = Math.random();
  while (u1 === 0) u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

function buildStats(producer: (key: StatKey) => number): PlayerStats {
  const entries = ALL_STAT_KEYS.map((key) => [key, producer(key)] as const);
  return Object.fromEntries(entries) as PlayerStats;
}

function generatePotential(position: OutfieldPosition): PlayerStats {
  const bonusKeys = new Set<StatKey>(POSITION_BONUSES[position]);
  return buildStats((key) => {
    const base = clamp(
      Math.round(normalSample(POTENTIAL_MEAN, POTENTIAL_STDDEV)),
      POTENTIAL_MIN,
      POTENTIAL_MAX,
    );
    return bonusKeys.has(key) ? Math.min(base + POSITION_BONUS, POTENTIAL_BONUS_CAP) : base;
  });
}

function generateCurrent(potential: PlayerStats, age: number): PlayerStats {
  // Age-weighted ratio of current to potential. 14yo lands ~65-85% of the cap,
  // 17yo lands ~72-92%. Phase-0 placeholder formula — will get tuned.
  const ageFactor = 0.4 + age * 0.025;
  return buildStats((key) => {
    const cap = potential[key];
    const noise = (Math.random() - 0.5) * 0.2;
    return clamp(Math.round(cap * (ageFactor + noise)), 1, cap);
  });
}

export function generatePlayer(): Player {
  const position = pickRandom(OUTFIELD_POSITIONS);
  const age = randInt(14, 17);
  const { firstName, lastName } = generateEnglishName();
  const potential = generatePotential(position);
  const current = generateCurrent(potential, age);
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    age,
    nationality: 'England',
    position,
    stats: { current, potential },
    traits: [],
    createdAt: Date.now(),
  };
}
