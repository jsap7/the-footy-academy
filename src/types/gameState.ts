import type { Player } from './player';

// FOOTY-26 will replace these stubs with the real Scout / ShortlistEntry types.
type ScoutStub = unknown;
type ShortlistEntryStub = unknown;

export type GameState = {
  cash: number;
  currentMonth: number; // 1-12
  currentYear: number;

  scouts: ScoutStub[];
  scoutMarket: ScoutStub[];
  shortlist: ShortlistEntryStub[];
  roster: Player[];
};

export const INITIAL_GAME_STATE: GameState = {
  cash: 50_000,
  currentMonth: 8, // August — the football season opener
  currentYear: 2026,
  scouts: [],
  scoutMarket: [],
  shortlist: [],
  roster: [],
};
