import { MONTHLY_BASE_INCOME } from './finance';
import { generateScoutMarket } from './scoutMarket';
import { runScoutFinds, tickShortlist } from './shortlist';
import { calculateStipend } from './stipends';
import type { GameState } from '../types';

// The full monthly turn. Order is locked by the FOOTY-31 spec — each step
// observes the post-state of the previous step. Returns a NEW GameState.
export function advanceMonth(state: GameState): GameState {
  // 1. Advance calendar
  let currentMonth = state.currentMonth + 1;
  let currentYear = state.currentYear;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear += 1;
  }

  // 2. Add monthly base income
  let cash = state.cash + MONTHLY_BASE_INCOME;

  // 3. Each hired scout finds 1 player → goes to shortlist (BEFORE tick).
  const newFinds = runScoutFinds(state);
  let shortlist = [...state.shortlist, ...newFinds];

  // 4. Tick shortlist (decrement remaining months, drop expired).
  shortlist = tickShortlist(shortlist);

  // 5. Deduct scout salaries (everyone currently hired).
  for (const scout of state.scouts) cash -= scout.monthlySalary;

  // 6. Deduct player stipends (everyone currently on the roster).
  for (const player of state.roster) cash -= calculateStipend(player);

  // 7. Refresh scout market — anything you didn't hire is gone.
  const scoutMarket = generateScoutMarket();

  return {
    ...state,
    currentMonth,
    currentYear,
    cash,
    shortlist,
    scoutMarket,
  };
}
