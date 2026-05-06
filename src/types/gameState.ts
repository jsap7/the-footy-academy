import { CLUB_LIBRARY } from '../data/clubs/library';
import { buildInitialAchievements } from '../game/achievements';
import { generateScoutMarket } from '../game/scoutMarket';
import { generateStartingRoster } from '../game/startingRoster';
import type { Achievement, AchievementId } from './achievement';
import type { BirthdayEvent, ReleaseEvent } from './aging';
import type { Club } from './club';
import type { FacilityTier } from './facility';
import type {
  FacilityDowngradeEvent,
  FacilityScoutFiredEvent,
  FacilityWarningEvent,
} from './facilityEvents';
import type { CashHistoryEntry, Transaction } from './finance';
import type { StatMilestoneEvent } from '../game/statMilestones';
import type { YouthCallupEvent } from '../game/youthCallups';
import type { Offer, SaleEvent } from './offer';
import type { Player } from './player';
import type { Scout } from './scout';
import type { ShortlistEntry } from './shortlist';

export type GameState = {
  cash: number;
  currentMonth: number; // 1-12
  currentYear: number;

  scouts: Scout[];
  scoutMarket: Scout[];
  shortlist: ShortlistEntry[];
  roster: Player[];

  clubs: readonly Club[]; // populated once on game start; never mutated

  pendingOffers: Offer[];
  completedSales: Offer[];

  // FOOTY-62: facility progression. Auto-downgrade (FOOTY-65) uses the grace
  // counter to give the user a couple of months to make payroll before
  // demoting them.
  facilityTier: FacilityTier;
  facilityGraceMonthsRemaining: number;

  // End-of-month cash for the trailing 12 months — used by the dashboard
  // sparkline + finances chart. Pushed on every advanceMonth tick.
  cashHistory: CashHistoryEntry[];

  // Trailing 24 months of major financial events. Drives the Finances tab's
  // transaction list and is appended to by sale execution, signings, scout
  // hires, facility upgrades, and the per-turn monthly burn aggregate.
  transactions: Transaction[];

  // FOOTY-77: per-achievement state, including the timestamp at unlock.
  achievements: Record<AchievementId, Achievement>;

  // Ephemeral UI events — populated each turn, cleared at start of next turn.
  recentBirthdays: BirthdayEvent[];
  recentReleases: ReleaseEvent[];
  recentSales: SaleEvent[];
  recentFacilityEvents: (FacilityWarningEvent | FacilityDowngradeEvent)[];
  recentForcedScoutFires: FacilityScoutFiredEvent[];
  recentAchievements: AchievementId[];
  recentStatMilestones: StatMilestoneEvent[];
  recentYouthCallups: YouthCallupEvent[];
  // Players that crossed the 24-month threshold this turn — drives a one-
  // time event banner ("Cillian Kareem is now a Veteran of the academy").
  recentVeterans: { playerId: string; playerName: string }[];
};

export const INITIAL_GAME_STATE: GameState = {
  cash: 100_000,
  currentMonth: 8, // August — the football season opener
  currentYear: 2026,
  scouts: [],
  scoutMarket: generateScoutMarket(),
  shortlist: [],
  roster: generateStartingRoster(),
  clubs: CLUB_LIBRARY,
  pendingOffers: [],
  completedSales: [],
  facilityTier: 1,
  facilityGraceMonthsRemaining: 0,
  cashHistory: [{ month: 8, year: 2026, cash: 100_000 }],
  transactions: [],
  achievements: buildInitialAchievements(),
  recentBirthdays: [],
  recentReleases: [],
  recentSales: [],
  recentFacilityEvents: [],
  recentForcedScoutFires: [],
  recentAchievements: [],
  recentStatMilestones: [],
  recentYouthCallups: [],
  recentVeterans: [],
};
