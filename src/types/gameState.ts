import { CLUB_LIBRARY } from '../data/clubs/library';
import { generateScoutMarket } from '../game/scoutMarket';
import type { BirthdayEvent, ReleaseEvent } from './aging';
import type { Club } from './club';
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

  // Ephemeral UI events — populated each turn, cleared at start of next turn.
  recentBirthdays: BirthdayEvent[];
  recentReleases: ReleaseEvent[];
  recentSales: SaleEvent[];
};

export const INITIAL_GAME_STATE: GameState = {
  cash: 50_000,
  currentMonth: 8, // August — the football season opener
  currentYear: 2026,
  scouts: [],
  scoutMarket: generateScoutMarket(),
  shortlist: [],
  roster: [],
  clubs: CLUB_LIBRARY,
  pendingOffers: [],
  completedSales: [],
  recentBirthdays: [],
  recentReleases: [],
  recentSales: [],
};
