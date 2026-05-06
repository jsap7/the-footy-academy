import { generateScoutMarket } from '../game/scoutMarket';
import type { BirthdayEvent, ReleaseEvent } from './aging';
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

  // Ephemeral UI events — populated each turn, cleared at start of next turn.
  recentBirthdays: BirthdayEvent[];
  recentReleases: ReleaseEvent[];
};

export const INITIAL_GAME_STATE: GameState = {
  cash: 50_000,
  currentMonth: 8, // August — the football season opener
  currentYear: 2026,
  scouts: [],
  scoutMarket: generateScoutMarket(),
  shortlist: [],
  roster: [],
  recentBirthdays: [],
  recentReleases: [],
};
