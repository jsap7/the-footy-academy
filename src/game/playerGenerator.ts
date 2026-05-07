import { generateEnglishName } from './nameGenerator';
import { POSITION_RELEVANT_STATS } from './positionStats';
import { rollQualityTier, TIER_POTENTIAL_BANDS, TIER_TRAIT_COUNT_WEIGHTS } from './qualityTier';
import { applyBaseEffects, getAllTraits } from './traits';
import {
  ALL_STAT_KEYS,
  OUTFIELD_POSITIONS,
  type OutfieldPosition,
  type Player,
  type PlayerStats,
  type QualityTier,
  type StatKey,
  type TraitId,
} from '../types';

const POSITION_BONUS = 20;
const POTENTIAL_BONUS_CAP = 99;

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

function generatePotential(tier: QualityTier, position: OutfieldPosition): PlayerStats {
  const band = TIER_POTENTIAL_BANDS[tier];
  const bonusKeys = new Set<StatKey>(POSITION_RELEVANT_STATS[position]);
  return buildStats((key) => {
    const base = clamp(Math.round(normalSample(band.center, band.stddev)), band.min, band.max);
    return bonusKeys.has(key) ? Math.min(base + POSITION_BONUS, POTENTIAL_BONUS_CAP) : base;
  });
}

// Linear interpolation: age 12 → 0.40, age 19 → 0.85.
// Anchors potential to age without coupling them — same potential, different
// growth gap depending on age.
function computeAgeFactor(age: number): number {
  return 0.4 + (age - 12) * 0.064;
}

function rollCurrentFromPotential(potential: PlayerStats, age: number): PlayerStats {
  const ageFactor = computeAgeFactor(age);
  return buildStats((key) => {
    const cap = potential[key];
    const noise = (Math.random() - 0.5) * 0.15; // ±7.5% per-stat noise
    const value = Math.round(cap * (ageFactor + noise));
    return clamp(value, 1, cap);
  });
}

function pickTraitCount(tier: QualityTier): number {
  const weights = TIER_TRAIT_COUNT_WEIGHTS[tier];
  const r = Math.random();
  let cumulative = 0;
  let lastCount = 1;
  for (const [count, weight] of Object.entries(weights)) {
    cumulative += weight;
    lastCount = Number(count);
    if (r < cumulative) return lastCount;
  }
  // Float-epsilon fallback: r === 1 (rare). Return the last bucket.
  return lastCount;
}

function pickTraitIds(count: number): TraitId[] {
  const all = getAllTraits();
  const target = Math.min(count, all.length);
  // Fisher-Yates partial shuffle: only swap the last `target` slots.
  const arr = all.slice();
  for (let i = arr.length - 1; i >= arr.length - target; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(arr.length - target).map((t) => t.id);
}

function clampCurrentToPotential(current: PlayerStats, potential: PlayerStats): PlayerStats {
  const result: PlayerStats = { ...current };
  for (const key of ALL_STAT_KEYS) {
    if (result[key] > potential[key]) result[key] = potential[key];
  }
  return result;
}

export function generatePlayer(opts?: { forceTier?: QualityTier; forceAge?: number }): Player {
  const qualityTier = opts?.forceTier ?? rollQualityTier();
  const position = pickRandom(OUTFIELD_POSITIONS);
  const age = opts?.forceAge != null ? Math.max(12, Math.min(19, opts.forceAge)) : randInt(12, 19);
  const birthMonth = randInt(1, 12);
  const { firstName, lastName } = generateEnglishName();
  const rawPotential = generatePotential(qualityTier, position);
  const rawCurrent = rollCurrentFromPotential(rawPotential, age);

  const traits = pickTraitIds(pickTraitCount(qualityTier));
  const potential = applyBaseEffects(rawPotential, traits, 'potential');
  const current = clampCurrentToPotential(
    applyBaseEffects(rawCurrent, traits, 'current'),
    potential,
  );

  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    age,
    birthMonth,
    nationality: 'England',
    position,
    stats: { current, potential },
    traits,
    qualityTier,
    availableForSale: false,
    askingPrice: null,
    blockOffers: false,
    mvHistory: [],
    callupMultiplier: 1,
    monthsSinceLastCallup: 0,
    callups: [],
    nationalTeam: null,
    monthsBelowTeamThreshold: 0,
    monthsOnRoster: 0,
    createdAt: Date.now(),
  };
}
