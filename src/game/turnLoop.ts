import { processBirthdays, processReleases } from './aging';
import { developPlayer } from './development';
import { MONTHLY_BASE_INCOME } from './finance';
import {
  executeAcceptedOffers,
  generateOffersForTurn,
  processCounterResponses,
  tickOfferLifespans,
} from './offers';
import { generateScoutMarket } from './scoutMarket';
import { runScoutFinds, tickShortlist } from './shortlist';
import { calculateStipend } from './stipends';
import { computeDevRateMultiplier } from './traits';
import type { GameState } from '../types';

// Phase 3 turn loop. Order is locked. Returns a NEW GameState.
export function advanceMonth(state: GameState): GameState {
  // 1. Advance calendar
  let currentMonth = state.currentMonth + 1;
  let currentYear = state.currentYear;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear += 1;
  }

  // 2a. Birthdays (BEFORE development so a 13yo who turns 14 develops as 14).
  const stateAfterCalendar: GameState = { ...state, currentMonth, currentYear };
  const { updatedRoster: rosterAfterBirthdays, birthdayEvents } =
    processBirthdays(stateAfterCalendar);
  // 2b. Releases — anyone who just hit 22 leaves the academy.
  const { updatedRoster: rosterAfterReleases, releaseEvents } =
    processReleases(rosterAfterBirthdays);

  // 2c. Development — every roster player ticks up a little.
  const rosterAfterDevelopment = rosterAfterReleases.map(
    (player) => developPlayer(player, computeDevRateMultiplier).updated,
  );

  // 3. Add monthly base income.
  let cash = state.cash + MONTHLY_BASE_INCOME;

  // 4. Each hired scout finds 1 player → goes to shortlist (BEFORE tick).
  const findsState: GameState = { ...stateAfterCalendar, roster: rosterAfterDevelopment };
  const newFinds = runScoutFinds(findsState);
  let shortlist = [...state.shortlist, ...newFinds];

  // 5. Tick shortlist (decrement remaining months, drop expired).
  shortlist = tickShortlist(shortlist);

  // 6. Offer pipeline — counter responses, sale execution, lifespan tick,
  // then new offers from clubs based on current roster + listings.
  let offerStateInput: GameState = {
    ...stateAfterCalendar,
    cash,
    shortlist,
    roster: rosterAfterDevelopment,
    pendingOffers: processCounterResponses(state.pendingOffers),
  };
  const saleResult = executeAcceptedOffers(offerStateInput);
  offerStateInput = saleResult.state;
  cash = offerStateInput.cash;
  const rosterAfterSales = offerStateInput.roster;
  const completedSales = offerStateInput.completedSales;
  const offersAfterTick = tickOfferLifespans(offerStateInput.pendingOffers);
  const newOffers = generateOffersForTurn({
    ...offerStateInput,
    pendingOffers: offersAfterTick,
  });
  const pendingOffers = [...offersAfterTick, ...newOffers];

  // 7. Deduct scout salaries (everyone currently hired).
  for (const scout of state.scouts) cash -= scout.monthlySalary;

  // 8. Deduct player stipends (post-aging, post-sale roster, with 20-21 squeeze).
  for (const player of rosterAfterSales) cash -= calculateStipend(player);

  // 9. Refresh scout market — anything you didn't hire is gone.
  const scoutMarket = generateScoutMarket();

  // Track end-of-month cash for the dashboard sparkline (trailing 12 months).
  const cashHistory = [...state.cashHistory, cash].slice(-12);

  return {
    ...state,
    currentMonth,
    currentYear,
    cash,
    shortlist,
    scoutMarket,
    roster: rosterAfterSales,
    pendingOffers,
    completedSales,
    cashHistory,
    recentBirthdays: birthdayEvents,
    recentReleases: releaseEvents,
    recentSales: saleResult.saleEvents,
  };
}
