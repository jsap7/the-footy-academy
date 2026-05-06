import { generateScoutMarket } from '../game/scoutMarket';
import type { Player } from './player';
import type { Scout } from './scout';

// FOOTY-28 will replace this stub with the real ShortlistEntry type.
type ShortlistEntryStub = unknown;

export type GameState = {
  cash: number;
  currentMonth: number; // 1-12
  currentYear: number;

  scouts: Scout[];
  scoutMarket: Scout[];
  shortlist: ShortlistEntryStub[];
  roster: Player[];
};

export const INITIAL_GAME_STATE: GameState = {
  cash: 50_000,
  currentMonth: 8, // August — the football season opener
  currentYear: 2026,
  scouts: [],
  scoutMarket: generateScoutMarket(),
  shortlist: [],
  roster: [],
};
