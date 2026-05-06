import { processBirthdays, processReleases } from './aging';
import { developPlayer } from './development';
import { MONTHLY_BASE_INCOME } from './finance';
import { generateScoutMarket } from './scoutMarket';
import { runScoutFinds, tickShortlist } from './shortlist';
import { calculateStipend } from './stipends';
import { computeDevRateMultiplier } from './traits';
import type { GameState } from '../types';

// The full monthly turn. Order is locked. Returns a NEW GameState.
export function advanceMonth(state: GameState): GameState {
  // 1. Advance calendar
  let currentMonth = state.currentMonth + 1;
  let currentYear = state.currentYear;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear += 1;
  }

  // 2a. Birthdays — anyone whose birthMonth matches the new month ages up.
  // Done BEFORE development (FOOTY-36) so a kid who just turned 14 develops
  // as a 14yo this turn.
  const stateAfterCalendar: GameState = { ...state, currentMonth, currentYear };
  const { updatedRoster: rosterAfterBirthdays, birthdayEvents } =
    processBirthdays(stateAfterCalendar);
  // 2b. Releases — anyone who just hit 22 leaves the academy.
  const { updatedRoster: rosterAfterReleases, releaseEvents } =
    processReleases(rosterAfterBirthdays);

  // 2c. Development — every roster player ticks up a little. Done AFTER
  // birthdays so a kid who just turned 14 develops as a 14yo this turn.
  // Trait dev-rate effects (workaholic, lazy, late_bloomer, …) plug in here.
  const rosterAfterDevelopment = rosterAfterReleases.map(
    (player) => developPlayer(player, computeDevRateMultiplier).updated,
  );

  // 3. Add monthly base income
  let cash = state.cash + MONTHLY_BASE_INCOME;

  // 4. Each hired scout finds 1 player → goes to shortlist (BEFORE tick).
  const findsState: GameState = { ...stateAfterCalendar, roster: rosterAfterDevelopment };
  const newFinds = runScoutFinds(findsState);
  let shortlist = [...state.shortlist, ...newFinds];

  // 5. Tick shortlist (decrement remaining months, drop expired).
  shortlist = tickShortlist(shortlist);

  // 6. Deduct scout salaries (everyone currently hired).
  for (const scout of state.scouts) cash -= scout.monthlySalary;

  // 7. Deduct player stipends (post-aging roster, with 20-21 squeeze).
  for (const player of rosterAfterDevelopment) cash -= calculateStipend(player);

  // 8. Refresh scout market — anything you didn't hire is gone.
  const scoutMarket = generateScoutMarket();

  return {
    ...state,
    currentMonth,
    currentYear,
    cash,
    shortlist,
    scoutMarket,
    roster: rosterAfterDevelopment,
    recentBirthdays: birthdayEvents,
    recentReleases: releaseEvents,
  };
}
