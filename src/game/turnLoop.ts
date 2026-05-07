import { detectNewlyUnlocked, stampUnlocked } from './achievements';
import { processBirthdays, processReleases } from './aging';
import { developPlayer } from './development';
import { allowedScoutLevelsForTier, getCurrentFacility, getPrevFacilityTier } from './facilities';
import {
  WEEKLY_BASE_INCOME,
  WEEKS_PER_MONTH,
  currentWeeklyOperatingCosts,
} from './finance';
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
import {
  processNationalTeams,
  SPONSORSHIP_BY_TIER,
  type NationalTeamCallupEvent,
  type NationalTeamDropEvent,
} from './nationalTeams';
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

// 8 weeks = the old 2 months. Auto-downgrade tolerance under the weekly clock.
const GRACE_PERIOD_WEEKS = 8;

// Weekly turn loop. Order is locked. Returns a NEW GameState.
export function advanceMonth(state: GameState): GameState {
  // 1. Advance calendar — week first, then month if W4 → W1, then year.
  let currentWeek = state.currentWeek + 1;
  let currentMonth = state.currentMonth;
  let currentYear = state.currentYear;
  if (currentWeek > 4) {
    currentWeek = 1;
    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }
  const isFirstWeekOfMonth = currentWeek === 1;

  // 2a. Birthdays — only fire on W1 of birthMonth so each player ages once
  // per year regardless of weekly cadence. (BEFORE development so a 13yo who
  // turns 14 develops as 14.)
  const stateAfterCalendar: GameState = { ...state, currentWeek, currentMonth, currentYear };
  const { updatedRoster: rosterAfterBirthdays, birthdayEvents } =
    processBirthdays(stateAfterCalendar);
  // 2b. Releases — anyone who just hit 22 leaves the academy. Only fires on
  // W1 of birthMonth via processBirthdays so the release tick aligns.
  const { updatedRoster: rosterAfterReleases, releaseEvents } = isFirstWeekOfMonth
    ? processReleases(rosterAfterBirthdays)
    : { updatedRoster: rosterAfterBirthdays, releaseEvents: [] };

  // 2c. Development — every roster player ticks up a little. Facility tier
  // applies a flat multiplier to every gain (1.0× at Backyard Pitch up to
  // 1.5× at World-Class). After development, each player's MV history gets
  // a fresh entry (FOOTY-74) — capped at 12 trailing months for the chart.
  // FOOTY-81: also detect stat milestones (70/80/90 crossings) and surface
  // them in the event banner.
  const facility = getCurrentFacility(stateAfterCalendar);
  const recentStatMilestones: StatMilestoneEvent[] = [];
  const rosterAfterDevelopmentRaw = rosterAfterReleases.map((player) => {
    const developed = developPlayer(
      player,
      computeDevRateMultiplier,
      facility.developmentMultiplier,
    ).updated;
    const milestone = detectStatMilestones(
      developed,
      player.stats.current,
      developed.stats.current,
    );
    if (milestone) recentStatMilestones.push(milestone);
    return developed;
  });

  // 2d. National teams — promote / demote based on current avg rating at
  // age. Persistent membership replaces FOOTY-82's one-time callup bonus;
  // the MV multiplier is now reflected via player.nationalTeam in
  // computeMarketValue.
  const nationalTeamResult = processNationalTeams(rosterAfterDevelopmentRaw);
  const rosterAfterCallups = nationalTeamResult.roster;
  const recentNationalTeamCallups: NationalTeamCallupEvent[] = nationalTeamResult.callups;
  const recentNationalTeamDrops: NationalTeamDropEvent[] = nationalTeamResult.drops;

  // 2e. Increment weeksOnRoster (stored in `monthsOnRoster` for save compat)
  // and detect veteran-threshold crossings. 96 weeks ≈ 24 months unlocks the
  // Veteran badge — applied to dev rate (development.ts) and MV
  // (marketValue.ts). One-time crossing event surfaces in the banner.
  const recentVeterans: { playerId: string; playerName: string }[] = [];
  const rosterAfterDevelopment = rosterAfterCallups.map((developed) => {
    const wasVeteran = (developed.monthsOnRoster ?? 0) >= 96;
    const monthsOnRoster = (developed.monthsOnRoster ?? 0) + 1;
    const isVeteran = monthsOnRoster >= 96;
    if (!wasVeteran && isVeteran) {
      recentVeterans.push({
        playerId: developed.id,
        playerName: `${developed.firstName} ${developed.lastName}`,
      });
    }
    const withMonths = { ...developed, monthsOnRoster };
    const mvEntry = {
      month: currentMonth,
      year: currentYear,
      mv: computeMarketValue(withMonths),
    };
    const mvHistory = [...(withMonths.mvHistory ?? []), mvEntry].slice(-12);
    return { ...withMonths, mvHistory };
  });

  // 3. Add weekly base income, deduct weekly operating floor.
  let cash = state.cash + WEEKLY_BASE_INCOME;
  cash -= currentWeeklyOperatingCosts(stateAfterCalendar);

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

  // 7. Deduct facility weekly cost (inflated monthly cost / 4).
  const facilityMonthly = applyInflation(facility.monthlyCost, currentYear);
  const facilityWeekly = Math.round(facilityMonthly / WEEKS_PER_MONTH);
  cash -= facilityWeekly;

  // 8. Deduct weekly scout salaries (everyone currently hired). Salaries are
  // stamped onto the scout at hire time as a monthly figure; we quarter at
  // use-time so the per-week deduction stays consistent.
  let scoutSalariesTotal = 0;
  for (const scout of state.scouts) {
    const weekly = Math.round(scout.monthlySalary / WEEKS_PER_MONTH);
    cash -= weekly;
    scoutSalariesTotal += weekly;
  }

  // 9. Deduct player stipends — quartered to per-week.
  let stipendsTotal = 0;
  for (const player of rosterAfterSales) {
    const weekly = Math.round(calculateStipend(player, currentYear) / WEEKS_PER_MONTH);
    cash -= weekly;
    stipendsTotal += weekly;
  }

  // 9a. National team sponsorship income (weekly slice).
  const sponsorshipBreakdown: Record<string, number> = {};
  let sponsorshipIncome = 0;
  for (const player of rosterAfterSales) {
    if (!player.nationalTeam) continue;
    const monthly = applyInflation(SPONSORSHIP_BY_TIER[player.nationalTeam], currentYear);
    const weekly = Math.round(monthly / WEEKS_PER_MONTH);
    sponsorshipIncome += weekly;
    sponsorshipBreakdown[player.nationalTeam] =
      (sponsorshipBreakdown[player.nationalTeam] ?? 0) + 1;
  }
  cash += sponsorshipIncome;

  // 9b. Aggregate weekly burn into a single transaction so the Finances tab
  // doesn't pile up four lines per week.
  const operatingThisWeek = currentWeeklyOperatingCosts(stateAfterCalendar);
  const weeklyBurnAggregate =
    operatingThisWeek + facilityWeekly + scoutSalariesTotal + stipendsTotal;
  let transactions = state.transactions;
  if (weeklyBurnAggregate > 0) {
    transactions = appendTransaction(
      { ...stateAfterCalendar, transactions },
      {
        type: 'monthly_burn',
        description: `Weekly burn (operating ${formatCash(operatingThisWeek)}, facility ${formatCash(facilityWeekly)}, scouts ${formatCash(scoutSalariesTotal)}, stipends ${formatCash(stipendsTotal)})`,
        amount: -weeklyBurnAggregate,
      },
    );
  }
  if (sponsorshipIncome > 0) {
    const summary = Object.entries(sponsorshipBreakdown)
      .map(([tier, n]) => `${n}× ${tier}`)
      .join(', ');
    transactions = appendTransaction(
      { ...stateAfterCalendar, transactions },
      {
        type: 'sponsorship',
        description: `Sponsorship — ${summary}`,
        amount: sponsorshipIncome,
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
    if (facilityGraceMonthsRemaining >= GRACE_PERIOD_WEEKS) {
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

  // 11. Refresh scout market — only on W1 so the cadence stays "new market
  // each month" rather than refreshing 4× as fast under weekly turns. New
  // tier may open higher levels; downgrades close them.
  const scoutMarket = isFirstWeekOfMonth
    ? generateScoutMarket(facilityTier, currentYear)
    : state.scoutMarket;

  // Track end-of-week cash for the dashboard sparkline (trailing 52 weeks).
  const cashHistory = [
    ...state.cashHistory,
    { month: currentMonth, year: currentYear, cash },
  ].slice(-52);

  // Achievement detection runs against the fully-updated end-of-turn state
  // so all the year/sale/facility/roster signals are in place. Newly-unlocked
  // ids are stamped with the current month/year and surfaced to the UI via
  // recentAchievements.
  const provisional: GameState = {
    ...state,
    currentWeek,
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
    recentNationalTeamCallups,
    recentNationalTeamDrops,
    recentVeterans,
  };
}
