import {
  ACHIEVEMENT_DEFINITIONS,
  ALL_ACHIEVEMENT_IDS,
  type Achievement,
  type AchievementId,
} from '../types/achievement';
import type { Transaction } from '../types/finance';
import type { GameState } from '../types/gameState';
import type { Player } from '../types/player';
import { averageCurrent, averagePotential } from './playerStats';

export function buildInitialAchievements(): Record<AchievementId, Achievement> {
  const out = {} as Record<AchievementId, Achievement>;
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    out[def.id] = { ...def, unlockedAt: null };
  }
  return out;
}

const TIER_1_CLUB_NAMES = new Set(['Real Madrid', 'Manchester City', 'Bayern Munich', 'PSG']);

// Returns the set of newly-unlocked achievement ids for the given state.
// Caller stamps them onto state.achievements with the current month/year.
export function detectNewlyUnlocked(state: GameState): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const isLocked = (id: AchievementId) => state.achievements?.[id]?.unlockedAt == null;

  const yearsSinceStart = state.currentYear - 2026;
  const completedSales = state.completedSales ?? [];
  const generationalSignings = (state.transactions ?? []).filter(
    (t) => t.type === 'signing' && /generational/i.test(t.description),
  );
  const generationalSales = completedSales.filter((sale) => {
    // We don't have player tier on the sale record; approximate: any sale
    // for €30M+ is almost certainly generational. The real signal lives on
    // the player at sign time, so this is a good-enough proxy.
    return sale.amount >= 30_000_000;
  });

  // first_sale
  if (isLocked('first_sale') && completedSales.length >= 1) unlocked.push('first_sale');
  // first_million_sale
  if (isLocked('first_million_sale') && completedSales.some((s) => s.amount >= 1_000_000)) {
    unlocked.push('first_million_sale');
  }
  // first_10m_sale
  if (isLocked('first_10m_sale') && completedSales.some((s) => s.amount >= 10_000_000)) {
    unlocked.push('first_10m_sale');
  }
  // first_50m_sale
  if (isLocked('first_50m_sale') && completedSales.some((s) => s.amount >= 50_000_000)) {
    unlocked.push('first_50m_sale');
  }
  // first_generational_find
  if (isLocked('first_generational_find') && generationalSignings.length >= 1) {
    unlocked.push('first_generational_find');
  }
  // first_generational_sale (proxy: any €30M+ sale)
  if (isLocked('first_generational_sale') && generationalSales.length >= 1) {
    unlocked.push('first_generational_sale');
  }
  // find_3_generational
  if (isLocked('find_3_generational') && generationalSignings.length >= 3) {
    unlocked.push('find_3_generational');
  }
  // facility tiers
  if (isLocked('tier_2_facility') && state.facilityTier >= 2) unlocked.push('tier_2_facility');
  if (isLocked('tier_3_facility') && state.facilityTier >= 3) unlocked.push('tier_3_facility');
  if (isLocked('tier_4_facility') && state.facilityTier >= 4) unlocked.push('tier_4_facility');
  if (isLocked('tier_5_facility') && state.facilityTier >= 5) unlocked.push('tier_5_facility');
  // survival
  if (isLocked('survive_first_year') && yearsSinceStart >= 1) unlocked.push('survive_first_year');
  if (isLocked('survive_5_years') && yearsSinceStart >= 5) unlocked.push('survive_5_years');
  if (isLocked('survive_10_years') && yearsSinceStart >= 10) unlocked.push('survive_10_years');
  // tier 1 club sale
  if (
    isLocked('sell_to_tier_1_club') &&
    completedSales.some((s) => {
      const club = state.clubs.find((c) => c.id === s.clubId);
      return club ? TIER_1_CLUB_NAMES.has(club.name) || club.tier === 1 : false;
    })
  ) {
    unlocked.push('sell_to_tier_1_club');
  }
  // roster_of_10_players
  if (isLocked('roster_of_10_players') && state.roster.length >= 10) {
    unlocked.push('roster_of_10_players');
  }
  // lvl_5_scout_hired
  if (isLocked('lvl_5_scout_hired') && state.scouts.some((s) => s.level === 5)) {
    unlocked.push('lvl_5_scout_hired');
  }
  // develop_player_to_potential — any roster player at >= 95% of avg potential
  if (
    isLocked('develop_player_to_potential') &&
    state.roster.some((p) => playerPercentOfPotential(p) >= 0.95)
  ) {
    unlocked.push('develop_player_to_potential');
  }
  // develop_late_bloomer — late_bloomer player at >= 95%
  if (
    isLocked('develop_late_bloomer') &&
    state.roster.some(
      (p) => p.traits.includes('late_bloomer') && playerPercentOfPotential(p) >= 0.95,
    )
  ) {
    unlocked.push('develop_late_bloomer');
  }
  // never_went_negative_5_years — survived 5 years AND no negative cash entry in history
  if (
    isLocked('never_went_negative_5_years') &&
    yearsSinceStart >= 5 &&
    state.cash >= 0 &&
    (state.cashHistory ?? []).every((e) => e.cash >= 0)
  ) {
    unlocked.push('never_went_negative_5_years');
  }
  return unlocked;
}

function playerPercentOfPotential(player: Player): number {
  const cur = averageCurrent(player);
  const pot = averagePotential(player);
  if (pot <= 0) return 0;
  return cur / pot;
}

export function stampUnlocked(
  achievements: Record<AchievementId, Achievement>,
  ids: readonly AchievementId[],
  month: number,
  year: number,
): Record<AchievementId, Achievement> {
  const next = { ...achievements };
  for (const id of ids) {
    next[id] = { ...next[id], unlockedAt: { month, year } };
  }
  return next;
}

export function countUnlocked(achievements: Record<AchievementId, Achievement>): number {
  let n = 0;
  for (const id of ALL_ACHIEVEMENT_IDS) if (achievements[id]?.unlockedAt) n++;
  return n;
}

// Used by Year-in-Review to surface achievements unlocked during a specific year.
export function achievementsUnlockedInYear(
  achievements: Record<AchievementId, Achievement>,
  year: number,
): Achievement[] {
  return ALL_ACHIEVEMENT_IDS.map((id) => achievements[id]).filter(
    (a) => a?.unlockedAt && a.unlockedAt.year === year,
  ) as Achievement[];
}

// Helper: were any signings of generational tier in the given transactions
// list? Used in tests + the generational-find achievement detection.
export function _signingsWithTier(transactions: readonly Transaction[], tier: string): number {
  return transactions.filter(
    (t) => t.type === 'signing' && t.description.toLowerCase().includes(tier),
  ).length;
}

// Apply an achievement check against a state mutation and return the state
// with achievements stamped + recentAchievements appended. Used by game
// actions to fire achievement notifications mid-turn (e.g. signing a
// generational kid, upgrading the facility).
export function withAchievementCheck(state: GameState): GameState {
  const newly = detectNewlyUnlocked(state);
  if (newly.length === 0) return state;
  return {
    ...state,
    achievements: stampUnlocked(state.achievements, newly, state.currentMonth, state.currentYear),
    recentAchievements: [...(state.recentAchievements ?? []), ...newly],
  };
}
