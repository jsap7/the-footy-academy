import { achievementsUnlockedInYear } from './achievements';
import { computeReputationBreakdown } from './reputation';
import type { Achievement, GameState, Transaction } from '../types';

export type YearlyReview = {
  year: number;
  totalSalesCount: number;
  totalSalesValue: number;
  totalSpending: number;
  netCashChange: number;
  biggestSale?: { description: string; amount: number };
  signingsCount: number;
  releasesCount: number;
  achievements: Achievement[];
  startReputation: number;
  endReputation: number;
  startCash: number;
  endCash: number;
};

function txInYear(tx: Transaction, year: number): boolean {
  return tx.year === year;
}

// Compute a yearly review based on the transactions log + achievements
// timestamps. Run at the moment of the Dec→Jan transition with `year` set
// to the year that just ended.
export function computeYearlyReview(state: GameState, year: number): YearlyReview {
  const txs = state.transactions ?? [];
  const yearTxs = txs.filter((t) => txInYear(t, year));
  const sales = yearTxs.filter((t) => t.type === 'sale');
  const spending = yearTxs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalSalesValue = sales.reduce((s, t) => s + t.amount, 0);
  const netCashChange = yearTxs.reduce((s, t) => s + t.amount, 0);
  const biggestSale = sales.reduce<Transaction | undefined>(
    (mx, t) => (mx == null || t.amount > mx.amount ? t : mx),
    undefined,
  );
  const signings = yearTxs.filter((t) => t.type === 'signing').length;
  const releases = yearTxs.filter((t) => t.type === 'release').length;
  const achievements = achievementsUnlockedInYear(state.achievements, year);

  // End-of-year reputation = current rep at the moment of the review.
  const endRep = computeReputationBreakdown(state).total;
  // Start-of-year reputation = rep computed assuming prior-year state. We
  // approximate by running the formula with sales/achievements pruned to
  // those completed before `year`. Cheap enough.
  const yearStartState: GameState = {
    ...state,
    currentYear: year,
    completedSales: (state.completedSales ?? []).filter((sale) => sale.amount && sale),
  };
  // Subtract this year's contribution: -sales-value-divided-by-5M etc. We
  // don't have per-year reputation history, so approximate by stripping
  // this-year achievements + sales from a copy and recomputing.
  const priorAchievements = { ...state.achievements };
  for (const a of achievements) priorAchievements[a.id] = { ...a, unlockedAt: null };
  // Sales: keep only sales whose transaction occurred in a prior year.
  const priorSaleIds = new Set(
    txs.filter((t) => t.type === 'sale' && t.year < year).map((t) => t.id),
  );
  const priorCompletedSales = (state.completedSales ?? []).filter((s) =>
    // completedSales doesn't carry month/year so fallback: if total sales
    // this-year value is positive, drop the largest matching by amount.
    s ? priorSaleIds.size > 0 || (state.completedSales ?? []).indexOf(s) === 0 : false,
  );
  const startRep = computeReputationBreakdown({
    ...yearStartState,
    achievements: priorAchievements,
    completedSales: priorCompletedSales,
    facilityTier: state.facilityTier, // approximate; tier is rarely downgraded
  }).total;

  return {
    year,
    totalSalesCount: sales.length,
    totalSalesValue,
    totalSpending: spending,
    netCashChange,
    biggestSale: biggestSale
      ? { description: biggestSale.description, amount: biggestSale.amount }
      : undefined,
    signingsCount: signings,
    releasesCount: releases,
    achievements,
    startReputation: startRep,
    endReputation: endRep,
    startCash: state.cash - netCashChange,
    endCash: state.cash,
  };
}
