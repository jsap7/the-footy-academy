import { ALL_STAT_KEYS, type Player, type PlayerStats } from '../types';

export function averageStat(stats: PlayerStats): number {
  let sum = 0;
  for (const key of ALL_STAT_KEYS) sum += stats[key];
  return Math.round(sum / ALL_STAT_KEYS.length);
}

export function averageCurrent(player: Player): number {
  return averageStat(player.stats.current);
}

export function averagePotential(player: Player): number {
  return averageStat(player.stats.potential);
}
