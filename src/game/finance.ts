import { calculateStipend } from './stipends';
import type { GameState } from '../types';

// Phase 4 economy: trickle of base income (€5k) against a fixed €20k operating
// floor — net -€15k/month idle, so the user has to start selling almost
// immediately. Cup bonuses, sponsors, and sell-on payouts arrive in later phases.
export const MONTHLY_BASE_INCOME = 5_000;
export const MONTHLY_OPERATING_COSTS_BASE = 20_000;

// Hook for FOOTY-66: inflation will scale operating costs with the year.
// Until that lands this is just the flat base.
export function currentOperatingCosts(_state: GameState): number {
  return MONTHLY_OPERATING_COSTS_BASE;
}

export function totalMonthlyStipends(state: GameState): number {
  let total = 0;
  for (const player of state.roster) total += calculateStipend(player);
  return total;
}

export function totalMonthlyScoutSalaries(state: GameState): number {
  let total = 0;
  for (const scout of state.scouts) total += scout.monthlySalary;
  return total;
}

export function monthlyBurn(state: GameState): number {
  return (
    currentOperatingCosts(state) +
    totalMonthlyStipends(state) +
    totalMonthlyScoutSalaries(state)
  );
}

export function monthlyNet(state: GameState): number {
  return MONTHLY_BASE_INCOME - monthlyBurn(state);
}
