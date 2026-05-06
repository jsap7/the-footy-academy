import { detectNewlyUnlocked, stampUnlocked } from './achievements';
import { processBirthdays, processReleases } from './aging';
import { developPlayer } from './development';
import { allowedScoutLevelsForTier, getCurrentFacility, getPrevFacilityTier } from './facilities';
import { MONTHLY_BASE_INCOME, currentOperatingCosts } from './finance';
import { applyInflation } from './inflation';
import { computeMarketValue } from './marketValue';
import {
  executeAcceptedOffers,
  generateOffersForTurn,
  processCounterResponses,
  tickOfferLifespans,
} from './offers';
import { generateScoutMarket } from './scoutMarket';
import { runScoutFinds, tickShortlist } from './shortlist';
import { detectStatMilestones, type StatMilestoneEvent } from './statMilestones';
import { calculateStipend } from './stipends';
import { computeDevRateMultiplier } from './traits';
import { appendTransaction } from './transactions';
import { formatCash } from '../util/format';
import type {
  FacilityDowngradeEvent,
  FacilityScoutFiredEvent,
  FacilityWarningEvent,
  GameState,
  Scout,
} from '../types';

const GRACE_PERIOD_MONTHS = 2;

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

  // 2c. Development — every roster player ticks up a little. Facility tier
  // applies a flat multiplier to every gain (1.0× at Backyard Pitch up to
  // 1.5× at World-Class). After development, each player's MV history gets
  // a fresh entry (FOOTY-74) — capped at 12 trailing months for the chart.
  // FOOTY-81: also detect stat milestones (70/80/90 crossings) and surface
  // them in the event banner.
  const facility = getCurrentFacility(stateAfterCalendar);
  const recentStatMilestones: StatMilestoneEvent[] = [];
  const rosterAfterDevelopment = rosterAfterReleases.map((player) => {
    const developed = developPlayer(
      player,
      computeDevRateMultiplier,
      facility.developmentMultiplier,
    ).updated;
    const milestone = detectStatMilestones(developed, player.stats.current, developed.stats.current);
    if (milestone) recentStatMilestones.push(milestone);
    const mvEntry = { month: currentMonth, year: currentYear, mv: computeMarketValue(developed) };
    const mvHistory = [...(developed.mvHistory ?? []), mvEntry].slice(-12);
    return { ...developed, mvHistory };
  });

  // 3. Add monthly base income, deduct operating cost floor.
  let cash = state.cash + MONTHLY_BASE_INCOME;
  cash -= currentOperatingCosts(stateAfterCalendar);

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

  // 7. Deduct facility monthly cost (inflated, €0 at Backyard up to €1M+ at World-Class).
  const facilityMonthly = applyInflation(facility.monthlyCost, currentYear);
  cash -= facilityMonthly;

  // 8. Deduct scout salaries (everyone currently hired). Salaries are stamped
  // onto the scout at hire time so existing hires are grandfathered.
  let scoutSalariesTotal = 0;
  for (const scout of state.scouts) {
    cash -= scout.monthlySalary;
    scoutSalariesTotal += scout.monthlySalary;
  }

  // 9. Deduct player stipends (post-aging, post-sale roster, with 20-21 squeeze).
  let stipendsTotal = 0;
  for (const player of rosterAfterSales) {
    const s = calculateStipend(player, currentYear);
    cash -= s;
    stipendsTotal += s;
  }

  // 9b. Income credit (the +5k from earlier was already applied; we record
  // the aggregate burn here as one transaction so the Finances tab can
  // show "monthly burn -€X" per month rather than four lines).
  const operatingThisMonth = currentOperatingCosts(stateAfterCalendar);
  const monthlyBurnAggregate =
    operatingThisMonth + facilityMonthly + scoutSalariesTotal + stipendsTotal;
  let transactions = state.transactions;
  if (monthlyBurnAggregate > 0) {
    transactions = appendTransaction(
      { ...stateAfterCalendar, transactions },
      {
        type: 'monthly_burn',
        description: `Monthly burn (operating ${formatCash(operatingThisMonth)}, facility ${formatCash(facilityMonthly)}, scouts ${formatCash(scoutSalariesTotal)}, stipends ${formatCash(stipendsTotal)})`,
        amount: -monthlyBurnAggregate,
      },
    );
  }
  // Pull in any sale transactions that executeAcceptedOffers would have
  // wanted to emit. The action layer (acceptOffer) handles user-driven
  // accepts directly; here we only need to log the auto-accepted sales
  // produced by the offer pipeline this turn.
  for (const sale of saleResult.saleEvents) {
    transactions = appendTransaction(
      { ...stateAfterCalendar, transactions },
      {
        type: 'sale',
        description: `Sold ${sale.playerName} → ${sale.clubName}`,
        amount: sale.amount,
      },
    );
  }

  // 10. Grace + auto-downgrade. We tick up only when we're actually in the
  // red AND have somewhere to fall to. Once the counter hits the threshold
  // we drop one tier and force-fire any scouts that are no longer valid at
  // the new tier (auto path ignores the orphan rule that blocks manual
  // downgrades). Counter resets after the demotion so the user gets another
  // grace window at the new tier.
  let facilityTier = stateAfterCalendar.facilityTier;
  let facilityGraceMonthsRemaining = state.facilityGraceMonthsRemaining;
  let scouts: Scout[] = state.scouts;
  const recentFacilityEvents: (FacilityWarningEvent | FacilityDowngradeEvent)[] = [];
  const recentForcedScoutFires: FacilityScoutFiredEvent[] = [];

  if (cash < 0 && facilityTier > 1) {
    facilityGraceMonthsRemaining += 1;
    if (facilityGraceMonthsRemaining >= GRACE_PERIOD_MONTHS) {
      const prevTier = getPrevFacilityTier(facilityTier);
      if (prevTier != null) {
        const fromTier = facilityTier;
        const allowed = new Set(allowedScoutLevelsForTier(prevTier));
        const fired = scouts.filter((s) => !allowed.has(s.level));
        scouts = scouts.filter((s) => allowed.has(s.level));
        for (const f of fired) {
          recentForcedScoutFires.push({
            scoutId: f.id,
            scoutName: `${f.firstName} ${f.lastName}`,
            scoutLevel: f.level,
          });
        }
        facilityTier = prevTier;
        facilityGraceMonthsRemaining = 0;
        recentFacilityEvents.push({ type: 'auto-downgrade', fromTier, toTier: prevTier });
      }
    } else {
      // First broke month — give the user a heads-up so they can react.
      recentFacilityEvents.push({ type: 'warning', fromTier: facilityTier });
    }
  } else {
    facilityGraceMonthsRemaining = 0;
  }

  // 11. Refresh scout market — anything you didn't hire is gone. New tier may
  // open higher levels; downgrades close them. currentYear is threaded
  // through so 2030 hires book inflated salaries.
  const scoutMarket = generateScoutMarket(facilityTier, currentYear);

  // Track end-of-month cash for the dashboard sparkline (trailing 12 months).
  const cashHistory = [
    ...state.cashHistory,
    { month: currentMonth, year: currentYear, cash },
  ].slice(-12);

  // Achievement detection runs against the fully-updated end-of-turn state
  // so all the year/sale/facility/roster signals are in place. Newly-unlocked
  // ids are stamped with the current month/year and surfaced to the UI via
  // recentAchievements.
  const provisional: GameState = {
    ...state,
    currentMonth,
    currentYear,
    cash,
    shortlist,
    scouts,
    scoutMarket,
    roster: rosterAfterSales,
    pendingOffers,
    completedSales,
    cashHistory,
    transactions,
    facilityTier,
    facilityGraceMonthsRemaining,
  };
  const newlyUnlocked = detectNewlyUnlocked(provisional);
  const achievements =
    newlyUnlocked.length > 0
      ? stampUnlocked(state.achievements, newlyUnlocked, currentMonth, currentYear)
      : state.achievements;

  return {
    ...provisional,
    achievements,
    recentBirthdays: birthdayEvents,
    recentReleases: releaseEvents,
    recentSales: saleResult.saleEvents,
    recentFacilityEvents,
    recentForcedScoutFires,
    recentAchievements: newlyUnlocked,
    recentStatMilestones,
  };
}
