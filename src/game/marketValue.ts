import { ALL_STAT_KEYS, type Club, type Player, type QualityTier } from '../types';

const TIER_PREMIUM: Record<QualityTier, number> = {
  mid: 1.0,
  good: 1.0,
  great: 1.1,
  elite: 1.5,
  generational: 4.0,
};

// Resale curve: peaks at 16-18, drops fast after.
function computeAgeFactor(age: number): number {
  if (age <= 13) return 0.4;
  if (age === 14) return 0.6;
  if (age === 15) return 0.8;
  if (age === 16) return 1.0;
  if (age === 17) return 1.0;
  if (age === 18) return 0.95;
  if (age === 19) return 0.7;
  if (age === 20) return 0.45;
  if (age === 21) return 0.25;
  return 0; // 22+ released; offers shouldn't fire on them
}

function avgPotential(player: Player): number {
  let sum = 0;
  for (const k of ALL_STAT_KEYS) sum += player.stats.potential[k];
  return sum / ALL_STAT_KEYS.length;
}

function avgCurrent(player: Player): number {
  let sum = 0;
  for (const k of ALL_STAT_KEYS) sum += player.stats.current[k];
  return sum / ALL_STAT_KEYS.length;
}

// "True" market value — what a perfectly-informed buyer would pay.
//
// A player who is closer to realising their potential is worth more than one
// who is still raw at the same ceiling. ratingBoost ranges 0.6 (untapped) to
// 1.2 (fully developed); combined with the steeper baseValue and the new
// generational premium this puts top sales in the €30M+ range.
export function computeMarketValue(player: Player): number {
  const pot = avgPotential(player);
  const cur = avgCurrent(player);
  const baseValue = Math.pow(pot, 2.5) * 100;
  const ratingBoost = 0.6 + (cur / pot) * 0.6;
  const ageFactor = computeAgeFactor(player.age);
  const tierPremium = TIER_PREMIUM[player.qualityTier];
  return Math.round(baseValue * ratingBoost * ageFactor * tierPremium);
}

// What a specific club thinks the player is worth — adds ±10% noise to the
// true value to simulate imperfect reads, then caps at the club's wealth
// ceiling so a tier-5 club bidding on a generational kid maxes out at their
// budget instead of producing absurd numbers.
export function computeBuyerPerceivedValue(player: Player, club: Club): number {
  const noise = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  const perceived = computeMarketValue(player) * noise;
  return Math.min(Math.round(perceived), club.wealthCeiling);
}
