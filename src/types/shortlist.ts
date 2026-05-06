import type { Player } from './player';

export type ShortlistEntry = {
  id: string;
  player: Player;
  foundByScoutId: string;
  monthsRemaining: number;
};
