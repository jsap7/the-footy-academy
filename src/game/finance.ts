import { getCurrentFacility } from './facilities';
import { applyInflation } from './inflation';
import { SPONSORSHIP_BY_TIER } from './nationalTeams';
import { calculateStipend } from './stipends';
import type { GameState } from '../types';

// Weekly economy. All "per month" rates from the original Phase 4 design
// divide by 4 to land on weekly equivalents — the per-year totals stay the
// same, just spread across 4× as many ticks. WEEKS_PER_MONTH is exposed so
// the dashboard / finances tab can reconstruct monthly figures for display.
export const WEEKS_PER_MONTH = 4;

// €8k/month → €2k/week. Operating floor €15k/month → €3,750/week.
export const WEEKLY_BASE_INCOME = 2_000;
export const WEEKLY_OPERATING_COSTS_BASE = 3_750;

// Kept as derived monthly figures for the finances/dashboard cards so the
// "monthly net" headline reads cleanly. Internally the turn loop uses the
// weekly values above.
export const MONTHLY_BASE_INCOME = WEEKLY_BASE_INCOME * WEEKS_PER_MONTH;
export const MONTHLY_OPERATING_COSTS_BASE = WEEKLY_OPERATING_COSTS_BASE * WEEKS_PER_MONTH;

export function currentWeeklyOperatingCosts(state: GameState): number {
  return applyInflation(WEEKLY_OPERATING_COSTS_BASE, state.currentYear);
}

// Legacy alias — equivalent to the weekly cost × 4 so any monthly UI math
// keeps working.
export function currentOperatingCosts(state: GameState): number {
  return currentWeeklyOperatingCosts(state) * WEEKS_PER_MONTH;
}

// Stipends are stored as monthly amounts; quartered for weekly application.
export function totalWeeklyStipends(state: GameState): number {
  let total = 0;
  for (const player of state.roster) {
    total += Math.round(calculateStipend(player, state.currentYear) / WEEKS_PER_MONTH);
  }
  return total;
}

export function totalMonthlyStipends(state: GameState): number {
  let total = 0;
  for (const player of state.roster) total += calculateStipend(player, state.currentYear);
  return total;
}

export function totalWeeklyScoutSalaries(state: GameState): number {
  let total = 0;
  for (const scout of state.scouts) {
    total += Math.round(scout.monthlySalary / WEEKS_PER_MONTH);
  }
  return total;
}

export function totalMonthlyScoutSalaries(state: GameState): number {
  let total = 0;
  for (const scout of state.scouts) total += scout.monthlySalary;
  return total;
}

export function totalWeeklyFacilityCost(state: GameState): number {
  return Math.round(
    applyInflation(getCurrentFacility(state).monthlyCost, state.currentYear) / WEEKS_PER_MONTH,
  );
}

export function totalMonthlyFacilityCost(state: GameState): number {
  return applyInflation(getCurrentFacility(state).monthlyCost, state.currentYear);
}

// Sponsorship from national-team players, weekly. Monthly form preserved for
// the inflated-cost breakdown card.
export function totalWeeklySponsorship(state: GameState): number {
  let total = 0;
  for (const player of state.roster) {
    if (!player.nationalTeam) continue;
    total += Math.round(
      applyInflation(SPONSORSHIP_BY_TIER[player.nationalTeam], state.currentYear) /
        WEEKS_PER_MONTH,
    );
  }
  return total;
}

export function totalMonthlySponsorship(state: GameState): number {
  let total = 0;
  for (const player of state.roster) {
    if (!player.nationalTeam) continue;
    total += applyInflation(SPONSORSHIP_BY_TIER[player.nationalTeam], state.currentYear);
  }
  return total;
}

export function weeklyBurn(state: GameState): number {
  return (
    currentWeeklyOperatingCosts(state) +
    totalWeeklyFacilityCost(state) +
    totalWeeklyStipends(state) +
    totalWeeklyScoutSalaries(state)
  );
}

export function monthlyBurn(state: GameState): number {
  return (
    currentOperatingCosts(state) +
    totalMonthlyFacilityCost(state) +
    totalMonthlyStipends(state) +
    totalMonthlyScoutSalaries(state)
  );
}

export type ExpenseBreakdown = {
  operating: number;
  facility: number;
  stipends: number;
  scouts: number;
  total: number;
  income: number;
  baseIncome: number;
  sponsorship: number;
  net: number;
};

export function getExpenseBreakdown(state: GameState): ExpenseBreakdown {
  const operating = currentOperatingCosts(state);
  const facility = totalMonthlyFacilityCost(state);
  const stipends = totalMonthlyStipends(state);
  const scouts = totalMonthlyScoutSalaries(state);
  const total = operating + facility + stipends + scouts;
  const sponsorship = totalMonthlySponsorship(state);
  const baseIncome = MONTHLY_BASE_INCOME;
  const income = baseIncome + sponsorship;
  return {
    operating,
    facility,
    stipends,
    scouts,
    total,
    income,
    baseIncome,
    sponsorship,
    net: income - total,
  };
}

export function monthlyNet(state: GameState): number {
  return MONTHLY_BASE_INCOME + totalMonthlySponsorship(state) - monthlyBurn(state);
}
