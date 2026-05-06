import { calculateStipend } from './stipends';
import type { GameState } from '../types';

// Flat monthly income in phase 2a. Cup bonuses, sponsors, and sell-on payouts
// arrive in later phases.
export const MONTHLY_BASE_INCOME = 50_000;

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
  return totalMonthlyStipends(state) + totalMonthlyScoutSalaries(state);
}

export function monthlyNet(state: GameState): number {
  return MONTHLY_BASE_INCOME - monthlyBurn(state);
}
