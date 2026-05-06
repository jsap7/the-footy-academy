import { ALL_STAT_KEYS, type Player } from '../types';

export type YouthCallupType = 'U17' | 'U18' | 'U21';

export type YouthCallupEvent = {
  playerId: string;
  playerName: string;
  callupType: YouthCallupType;
  bonusPct: number; // e.g. 0.30 for +30%
};

const MONTHLY_CALLUP_CHANCE = 0.03;
const COOLDOWN_MONTHS = 12;
const CALLUP_MAX_MULT = 2.0;

function avgPotential(player: Player): number {
  let sum = 0;
  for (const k of ALL_STAT_KEYS) sum += player.stats.potential[k];
  return sum / ALL_STAT_KEYS.length;
}

function pickType(age: number): YouthCallupType {
  if (age <= 16) return 'U17';
  if (age <= 18) return 'U18';
  return 'U21';
}

function isEligible(player: Player): boolean {
  if (player.age < 16 || player.age > 19) return false;
  if (player.blockOffers) return false; // blocked players don't draw attention
  if ((player.monthsSinceLastCallup ?? 0) < COOLDOWN_MONTHS) return false;
  if (avgPotential(player) < 75) return false;
  return true;
}

// Roll for call-ups against the entire roster. Returns the updated roster
// (with multipliers + cooldowns updated) and the events to surface.
export function rollYouthCallups(
  roster: readonly Player[],
  currentMonth: number,
  currentYear: number,
): { roster: Player[]; events: YouthCallupEvent[] } {
  const events: YouthCallupEvent[] = [];
  const updated = roster.map((player) => {
    const monthsSinceLastCallup = (player.monthsSinceLastCallup ?? 0) + 1;
    const next: Player = { ...player, monthsSinceLastCallup };
    if (!isEligible(next)) return next;
    if (Math.random() >= MONTHLY_CALLUP_CHANCE) return next;
    const bonusPct = 0.2 + Math.random() * 0.2; // 0.20 to 0.40
    const callupType = pickType(next.age);
    const newMultiplier = Math.min(CALLUP_MAX_MULT, (next.callupMultiplier ?? 1) * (1 + bonusPct));
    events.push({
      playerId: next.id,
      playerName: `${next.firstName} ${next.lastName}`,
      callupType,
      bonusPct,
    });
    return {
      ...next,
      callupMultiplier: newMultiplier,
      monthsSinceLastCallup: 0,
      callups: [
        ...(next.callups ?? []),
        { type: callupType, month: currentMonth, year: currentYear, bonus: bonusPct },
      ],
    };
  });
  return { roster: updated, events };
}
