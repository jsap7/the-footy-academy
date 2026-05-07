import type { Player } from './player';

export type ShortlistEntry = {
  id: string;
  player: Player;
  foundByScoutId: string;
  monthsRemaining: number;
  signingFee: number; // computed at find time, ±20% noise around the tier base
};
