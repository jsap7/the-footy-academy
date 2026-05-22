// "The Season" — roguelike layer: each year the user picks a Board
// Expectation, has to clear it by Dec W4 without going broke, and earns a
// reward on success. Game over on bankruptcy or challenge failure.

export type ChallengeTier = 'easy' | 'medium' | 'hard' | 'brutal';

export type ChallengeId = string;

// Numerical challenge — progress is a number compared against a target.
// E.g. "Net Profit €5M" tracks running cash delta vs. €5,000,000.
export type NumericalChallengeKind =
  | 'net_profit_above'
  | 'modest_growth_above'
  | 'sales_count'
  | 'biggest_sale_above'
  | 'biggest_sale_5m_count' // total domination — count sales >= €5M
  | 'multi_tier_sales' // count distinct club tiers sold to
  | 'tier12_sales' // distinct tier 1+2 clubs sold to
  | 'cash_above'
  | 'rep_above'
  | 'roster_size_above'
  | 'find_quality_count' // finds of quality >= specified
  | 'develop_a_star' // any player avg current >= 80
  | 'develop_gain_above' // any player gained N+ avg current this year
  | 'maintain_min_scouts' // scouts >= N every week of the year
  | 'wage_cap_below' // total weekly wages <= cap every week of year
  | 'no_scout_hires' // never hired a scout this year
  | 'survive_strike' // didn't hire scouts during a window (months 4-9)
  | 'facility_upgraded'
  | 'sale_to_high_tier_clubs' // count distinct tier1/2 clubs (alias of tier12_sales)
  | 'find_generational';

// What "complete" means: progress >= target (gte) or ==/<= for cap-style.
export type CompletionMode = 'gte' | 'lte_at_year_end' | 'never_violated';

export type ChallengeDefinition = {
  id: ChallengeId;
  tier: ChallengeTier;
  title: string;
  description: string;
  unit: string; // "€", "players", "scouts", etc — for the progress bar caption
  // Base target as if drawn in the challenge's minimum tier year. Numerical
  // targets get scaled via 1.15× per year past the minimum (computed at
  // draw time, not stored on the def).
  baseTarget: number;
  kind: NumericalChallengeKind;
  completion: CompletionMode;
  // Year offset cap: how many years of scaling past the min year before
  // the target stops climbing. Defaults to no cap. Useful for keeping
  // challenges drawable indefinitely without numbers running away.
  scalingCap?: number;
};

// Stamped at draw time when the user picks a card. yearStarted + the live
// progress + target lets the UI compute progress bars, lets the year-end
// check decide pass/fail, and lets save/load reconstruct everything.
export type ActiveChallenge = {
  defId: ChallengeId;
  tier: ChallengeTier;
  title: string;
  description: string;
  unit: string;
  yearStarted: number;
  target: number; // resolved at draw (post-scaling)
  progress: number; // updated by trackers
  // Auxiliary tallies some kinds need but progress alone doesn't capture
  // (e.g. set of distinct club tiers / tier1+2 clubs sold to).
  meta?: {
    distinctClubTiers?: number[];
    distinctTier12ClubIds?: string[];
    minScoutCountObserved?: number;
    maxWeeklyWageObserved?: number;
    scoutHiresThisYear?: number;
    facilityUpgradesThisYear?: number;
    biggestSaleAmount?: number;
    bigSale5mCount?: number;
    salesCount?: number;
    cashAtYearStart?: number;
    findsByQuality?: Record<string, number>;
    yearStartCurrentByPlayerId?: Record<string, number>;
    bestDevGainThisYear?: number;
    starReached?: boolean;
    // For "Survive the Strike": the months during which hires are illegal.
    strikeWindowMonths?: number[];
  };
};

// Permanent buffs persist for the entire run. Stack multiplicatively where
// it makes sense; capped at sane upper bounds (see buffs.ts).
export type PermanentBuffId =
  | 'mv_plus_5'
  | 'dev_rate_plus_5'
  | 'operating_minus_10'
  | 'income_plus_1m';

export type PermanentBuff = {
  id: PermanentBuffId;
  acquiredYear: number;
  // Stack count — picking the same buff twice doubles its effect (up to
  // the cap). Default 1.
  stacks: number;
};

export type YearlyBuffId =
  | 'all_scout_levels'
  | 'offer_2x_frequency'
  | 'free_facility_upgrade'
  | 'reputation_plus_20';

export type YearlyBuff = {
  id: YearlyBuffId;
  acquiredYear: number;
  // For one-time-use buffs (free_facility_upgrade) — flips false once spent.
  available?: boolean;
};

export type RewardId =
  | 'cash_500k'
  | 'cash_2m'
  | 'cash_8m'
  | 'cash_25m'
  | PermanentBuffId
  | YearlyBuffId
  | 'token_challenge_skip';

export type RewardOffer = {
  id: RewardId;
  title: string;
  description: string;
  flavor: 'cash' | 'permanent' | 'yearly' | 'token';
};

export type CompletedRun = {
  yearsSurvived: number;
  totalSales: number;
  biggestSale: number;
  achievementsUnlocked: number;
  peakRep: number;
  peakCash: number;
  failureReason: 'bankruptcy' | 'challenge_failed' | null;
  endedAt: { week: number; month: number; year: number };
  // The challenge they failed on, if any — surfaced in the Game Over
  // summary so the user knows what tripped them.
  failedChallengeTitle?: string;
};

export type ChallengeTokens = {
  challengeSkip: number;
};
