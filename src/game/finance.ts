import { getCurrentFacility } from './facilities';
import { applyInflation } from './inflation';
import { SPONSORSHIP_BY_TIER } from './nationalTeams';
import { calculateStipend } from './stipends';
import type { GameState } from '../types';

// Phase 4 economy: trickle of base income (€5k) against a fixed €20k operating
// floor — net -€15k/month idle, so the user has to start selling almost
// immediately. Cup bonuses, sponsors, and sell-on payouts arrive in later phases.
// Income deliberately does NOT inflate (FOOTY-66): the squeeze is supposed to
// tighten over time, not stay flat.
export const MONTHLY_BASE_INCOME = 8_000;
export const MONTHLY_OPERATING_COSTS_BASE = 15_000;

export function currentOperatingCosts(state: GameState): number {
  return applyInflation(MONTHLY_OPERATING_COSTS_BASE, state.currentYear);
}

export function totalMonthlyStipends(state: GameState): number {
  let total = 0;
  for (const player of state.roster) total += calculateStipend(player, state.currentYear);
  return total;
}

export function totalMonthlyScoutSalaries(state: GameState): number {
  let total = 0;
  for (const scout of state.scouts) total += scout.monthlySalary;
  return total;
}

export function totalMonthlyFacilityCost(state: GameState): number {
  return applyInflation(getCurrentFacility(state).monthlyCost, state.currentYear);
}

// FOOTY-89: monthly sponsorship from each player currently in a national
// team. Inflation applied at use-time to match operating-cost behavior.
export function totalMonthlySponsorship(state: GameState): number {
  let total = 0;
  for (const player of state.roster) {
    if (!player.nationalTeam) continue;
    total += applyInflation(SPONSORSHIP_BY_TIER[player.nationalTeam], state.currentYear);
  }
  return total;
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
