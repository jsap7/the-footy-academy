// Phase 6 — challenge library + draw logic + per-year scaling.
//
// Each challenge has a tier (easy/medium/hard/brutal) and a minimum year
// at which it becomes drawable. Numerical targets scale 1.15× per year
// past that minimum so the same "Net Profit €1M" challenge gets harder
// as the run gets longer.

import type {
  ActiveChallenge,
  ChallengeDefinition,
  ChallengeTier,
} from '../types/season';

const SCALING_PER_YEAR = 1.15;
const DRAW_COUNT = 5;

// Min year a tier becomes drawable (year 1 = 2026).
const TIER_MIN_YEAR: Record<ChallengeTier, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  brutal: 4,
};

// Year past which a tier stops appearing in the draw pool. easy phases out
// at year 4, medium phases out at year 7. hard/brutal stick around forever.
const TIER_PHASE_OUT_YEAR: Partial<Record<ChallengeTier, number>> = {
  easy: 4,
  medium: 7,
};

export const CHALLENGE_LIBRARY: readonly ChallengeDefinition[] = [
  // ----- EASY -----
  {
    id: 'tighten_belt',
    tier: 'easy',
    title: 'Tighten the Belt',
    description: 'End the year with cash above €0.',
    unit: '€',
    baseTarget: 0,
    kind: 'cash_above',
    completion: 'gte',
  },
  {
    id: 'first_sale',
    tier: 'easy',
    title: 'First Sale',
    description: 'Sell at least 1 player this year.',
    unit: 'sales',
    baseTarget: 1,
    kind: 'sales_count',
    completion: 'gte',
  },
  {
    id: 'modest_growth',
    tier: 'easy',
    title: 'Modest Growth',
    description: 'End the year with €25k+ more cash than you started.',
    unit: '€',
    baseTarget: 25_000,
    kind: 'modest_growth_above',
    completion: 'gte',
    scalingCap: 0, // easy tier — keep small
  },
  {
    id: 'develop_talent',
    tier: 'easy',
    title: 'Develop Talent',
    description: 'Have at least 1 player gain 10+ avg current points this year.',
    unit: 'pts',
    baseTarget: 10,
    kind: 'develop_gain_above',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'build_roster',
    tier: 'easy',
    title: 'Build Roster',
    description: 'End the year with at least 3 players on the roster.',
    unit: 'players',
    baseTarget: 3,
    kind: 'roster_size_above',
    completion: 'gte',
    scalingCap: 0,
  },

  // ----- MEDIUM -----
  {
    id: 'net_profit_1m',
    tier: 'medium',
    title: 'Net Profit €1M',
    description: 'End the year with €1M+ in net profit.',
    unit: '€',
    baseTarget: 1_000_000,
    kind: 'net_profit_above',
    completion: 'gte',
  },
  {
    id: 'two_sales',
    tier: 'medium',
    title: 'Two Sales',
    description: 'Complete at least 2 player sales this year.',
    unit: 'sales',
    baseTarget: 2,
    kind: 'sales_count',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'scout_investment',
    tier: 'medium',
    title: 'Scout Investment',
    description: 'Maintain 2+ scouts every week of the year.',
    unit: 'scouts',
    baseTarget: 2,
    kind: 'maintain_min_scouts',
    completion: 'never_violated',
    scalingCap: 0,
  },
  {
    id: 'big_sale_1m',
    tier: 'medium',
    title: 'Big Sale',
    description: 'Single sale of €1M+ this year.',
    unit: '€',
    baseTarget: 1_000_000,
    kind: 'biggest_sale_above',
    completion: 'gte',
  },
  {
    id: 'develop_a_star',
    tier: 'medium',
    title: 'Develop a Star',
    description: 'Have a player reach 80+ avg current rating.',
    unit: 'OVR',
    baseTarget: 80,
    kind: 'develop_a_star',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'survive_strike',
    tier: 'medium',
    title: 'Survive the Strike',
    description: 'Cannot hire scouts for 6 months (Apr–Sep). Maintain operations.',
    unit: 'months',
    baseTarget: 0,
    kind: 'survive_strike',
    completion: 'never_violated',
  },

  // ----- HARD -----
  {
    id: 'net_profit_5m',
    tier: 'hard',
    title: 'Net Profit €5M',
    description: 'End the year with €5M+ in net profit.',
    unit: '€',
    baseTarget: 5_000_000,
    kind: 'net_profit_above',
    completion: 'gte',
  },
  {
    id: 'major_transfer',
    tier: 'hard',
    title: 'Major Transfer',
    description: 'Single sale of €10M+ this year.',
    unit: '€',
    baseTarget: 10_000_000,
    kind: 'biggest_sale_above',
    completion: 'gte',
  },
  {
    id: 'find_a_gem',
    tier: 'hard',
    title: 'Find a Gem',
    description: 'Find at least 1 elite-tier or higher player this year.',
    unit: 'finds',
    baseTarget: 1,
    kind: 'find_quality_count',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'multi_sale_4',
    tier: 'hard',
    title: 'Multi-Sale',
    description: 'Complete 4+ player sales this year.',
    unit: 'sales',
    baseTarget: 4,
    kind: 'sales_count',
    completion: 'gte',
  },
  {
    id: 'wage_cap',
    tier: 'hard',
    title: 'Wage Cap',
    description: 'Total weekly wages (stipends + scout salaries) cannot exceed €40k all year.',
    unit: '€',
    baseTarget: 40_000,
    kind: 'wage_cap_below',
    completion: 'never_violated',
  },
  {
    id: 'sponsor_demands',
    tier: 'hard',
    title: 'Sponsor Demands',
    description: 'Sell to at least 2 different Tier 1 or Tier 2 clubs this year.',
    unit: 'clubs',
    baseTarget: 2,
    kind: 'tier12_sales',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'facility_upgrade',
    tier: 'hard',
    title: 'Facility Upgrade',
    description: 'Upgrade your facility tier at least once this year.',
    unit: 'upgrades',
    baseTarget: 1,
    kind: 'facility_upgraded',
    completion: 'gte',
    scalingCap: 0,
  },

  // ----- BRUTAL -----
  {
    id: 'net_profit_10m',
    tier: 'brutal',
    title: 'Net Profit €10M',
    description: 'End the year with €10M+ in net profit.',
    unit: '€',
    baseTarget: 10_000_000,
    kind: 'net_profit_above',
    completion: 'gte',
  },
  {
    id: 'generational_sale',
    tier: 'brutal',
    title: 'Generational Sale',
    description: 'Sell a generational-tier player this year.',
    unit: 'sales',
    baseTarget: 1,
    kind: 'sales_count', // tagged separately via meta — see trackers
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'empire_building',
    tier: 'brutal',
    title: 'Empire Building',
    description: 'End the year with cash above €25M.',
    unit: '€',
    baseTarget: 25_000_000,
    kind: 'cash_above',
    completion: 'gte',
  },
  {
    id: 'reputation_70',
    tier: 'brutal',
    title: 'Reputation 70+',
    description: 'End the year with reputation 70 or higher.',
    unit: 'rep',
    baseTarget: 70,
    kind: 'rep_above',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'multi_tier_sales',
    tier: 'brutal',
    title: 'Multi-Tier Sales',
    description: 'Sell to clubs from 3+ different tiers this year.',
    unit: 'tiers',
    baseTarget: 3,
    kind: 'multi_tier_sales',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'generational_find',
    tier: 'brutal',
    title: 'Generational Find',
    description: 'Find a generational-tier player this year. RNG-dependent — risky pick.',
    unit: 'finds',
    baseTarget: 1,
    kind: 'find_generational',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'total_domination',
    tier: 'brutal',
    title: 'Total Domination',
    description: 'Sell at least 3 players for €5M+ each this year.',
    unit: 'sales',
    baseTarget: 3,
    kind: 'biggest_sale_5m_count',
    completion: 'gte',
    scalingCap: 0,
  },
  {
    id: 'scout_strike',
    tier: 'brutal',
    title: 'Scout Strike',
    description: 'Cannot hire any new scouts the entire year.',
    unit: 'hires',
    baseTarget: 0,
    kind: 'no_scout_hires',
    completion: 'never_violated',
  },
];

const LIBRARY_BY_ID = new Map(CHALLENGE_LIBRARY.map((d) => [d.id, d]));
export function getChallengeDef(id: string): ChallengeDefinition | undefined {
  return LIBRARY_BY_ID.get(id);
}

// Year offset: year 1 = 2026 → 1. Year-aware logic uses this consistently
// so the campaign start year can shift later without ripples.
export function gameYearFromCalendarYear(year: number): number {
  return year - 2025; // 2026 → 1, 2027 → 2, …
}

// Which tiers are eligible for the year? Mirrors the spec:
//   y1: easy
//   y2: easy + medium
//   y3: easy + medium + hard
//   y4-6: medium + hard + brutal
//   y7+: hard + brutal
function eligibleTiersForYear(gameYear: number): ChallengeTier[] {
  return (['easy', 'medium', 'hard', 'brutal'] as const).filter((tier) => {
    if (gameYear < TIER_MIN_YEAR[tier]) return false;
    const phaseOut = TIER_PHASE_OUT_YEAR[tier];
    if (phaseOut != null && gameYear >= phaseOut) return false;
    return true;
  });
}

// Pure: target = baseTarget × 1.15^(yearsPastMin). Caps via scalingCap if
// set (a cap of 0 means "never scale"). The result is rounded to a clean
// number for display (1k → 1k boundaries).
export function computeScaledTarget(def: ChallengeDefinition, gameYear: number): number {
  const yearsPast = Math.max(0, gameYear - TIER_MIN_YEAR[def.tier]);
  const cap = def.scalingCap;
  const effectiveYears = cap != null ? Math.min(yearsPast, cap) : yearsPast;
  const raw = def.baseTarget * Math.pow(SCALING_PER_YEAR, effectiveYears);
  if (def.baseTarget === 0) return 0;
  if (def.baseTarget >= 1_000_000) return Math.round(raw / 100_000) * 100_000;
  if (def.baseTarget >= 10_000) return Math.round(raw / 1_000) * 1_000;
  if (def.baseTarget >= 100) return Math.round(raw);
  return Math.round(raw);
}

// Materialize an active challenge from a definition + year. Stamps the
// resolved (scaled) target so future year-end checks don't need to
// recompute. Initializes meta state per kind.
export function instantiateChallenge(
  def: ChallengeDefinition,
  yearStarted: number,
  cashAtYearStart: number,
  rosterByPlayerIdAvgCurrent: Record<string, number>,
): ActiveChallenge {
  const target = computeScaledTarget(def, gameYearFromCalendarYear(yearStarted));
  const meta: ActiveChallenge['meta'] = {};

  if (def.kind === 'modest_growth_above' || def.kind === 'net_profit_above') {
    meta.cashAtYearStart = cashAtYearStart;
  }
  if (def.kind === 'multi_tier_sales') meta.distinctClubTiers = [];
  if (def.kind === 'tier12_sales') meta.distinctTier12ClubIds = [];
  if (def.kind === 'maintain_min_scouts') meta.minScoutCountObserved = Number.POSITIVE_INFINITY;
  if (def.kind === 'wage_cap_below') meta.maxWeeklyWageObserved = 0;
  if (def.kind === 'no_scout_hires') meta.scoutHiresThisYear = 0;
  if (def.kind === 'survive_strike') {
    meta.scoutHiresThisYear = 0;
    meta.strikeWindowMonths = [4, 5, 6, 7, 8, 9];
  }
  if (def.kind === 'facility_upgraded') meta.facilityUpgradesThisYear = 0;
  if (def.kind === 'biggest_sale_above') meta.biggestSaleAmount = 0;
  if (def.kind === 'biggest_sale_5m_count') meta.bigSale5mCount = 0;
  if (def.kind === 'sales_count') meta.salesCount = 0;
  if (def.kind === 'find_quality_count' || def.kind === 'find_generational') {
    meta.findsByQuality = {};
  }
  if (def.kind === 'develop_gain_above') {
    meta.yearStartCurrentByPlayerId = { ...rosterByPlayerIdAvgCurrent };
    meta.bestDevGainThisYear = 0;
  }
  if (def.kind === 'develop_a_star') meta.starReached = false;

  return {
    defId: def.id,
    tier: def.tier,
    title: def.title,
    description: def.description,
    unit: def.unit,
    yearStarted,
    target,
    progress: 0,
    meta,
  };
}

// Draw five challenge cards for the given year. Caller passes a freshly
// computed cashAtYearStart + roster snapshot used to seed meta tallies.
export function drawChallengeOptions(
  yearStarted: number,
  cashAtYearStart: number,
  rosterByPlayerIdAvgCurrent: Record<string, number>,
): ActiveChallenge[] {
  const gy = gameYearFromCalendarYear(yearStarted);
  const eligibleTiers = new Set(eligibleTiersForYear(gy));
  const pool = CHALLENGE_LIBRARY.filter((d) => eligibleTiers.has(d.tier));
  if (pool.length === 0) return [];

  // Fisher-Yates shuffle then slice. Don't return duplicates in the same
  // draw — at our pool sizes (5+) this is always satisfiable.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled
    .slice(0, Math.min(DRAW_COUNT, shuffled.length))
    .map((def) =>
      instantiateChallenge(def, yearStarted, cashAtYearStart, rosterByPlayerIdAvgCurrent),
    );
}

// Decide pass/fail at year-end. Pure: takes the live challenge state
// (with all progress / meta tallies populated) and returns true on pass.
export function isChallengeComplete(c: ActiveChallenge): boolean {
  const def = LIBRARY_BY_ID.get(c.defId);
  if (!def) return false;

  if (def.completion === 'never_violated') {
    if (def.kind === 'maintain_min_scouts') {
      const min = c.meta?.minScoutCountObserved ?? Number.POSITIVE_INFINITY;
      return Number.isFinite(min) && min >= c.target;
    }
    if (def.kind === 'wage_cap_below') {
      return (c.meta?.maxWeeklyWageObserved ?? 0) <= c.target;
    }
    if (def.kind === 'no_scout_hires') {
      return (c.meta?.scoutHiresThisYear ?? 0) === 0;
    }
    if (def.kind === 'survive_strike') {
      // We tally scoutHiresThisYear only inside the strike window — the
      // gameAction blocks it, but if any did slip through (defensive),
      // fail the challenge.
      return (c.meta?.scoutHiresThisYear ?? 0) === 0;
    }
    return false;
  }

  return c.progress >= c.target;
}
