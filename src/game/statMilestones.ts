import { ALL_STAT_KEYS, STAT_LABELS, type Player, type PlayerStats, type StatKey } from '../types';

export type StatMilestoneEvent = {
  playerId: string;
  playerName: string;
  thresholds: { stat: StatKey; statLabel: string; threshold: 70 | 80 | 90 }[];
};

const THRESHOLDS = [70, 80, 90] as const;

// Detect newly-crossed thresholds for a single player. Returns null if no
// crossings — caller filters those out so the event banner stays clean.
export function detectStatMilestones(
  player: Player,
  oldStats: PlayerStats,
  newStats: PlayerStats,
): StatMilestoneEvent | null {
  const crossed: { stat: StatKey; statLabel: string; threshold: 70 | 80 | 90 }[] = [];
  for (const stat of ALL_STAT_KEYS) {
    const before = oldStats[stat];
    const after = newStats[stat];
    if (after <= before) continue;
    for (const threshold of THRESHOLDS) {
      if (before < threshold && after >= threshold) {
        crossed.push({ stat, statLabel: STAT_LABELS[stat], threshold });
      }
    }
  }
  if (crossed.length === 0) return null;
  return {
    playerId: player.id,
    playerName: `${player.firstName} ${player.lastName}`,
    thresholds: crossed,
  };
}
