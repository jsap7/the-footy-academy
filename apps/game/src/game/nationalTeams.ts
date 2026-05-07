import { ALL_STAT_KEYS, type Player } from '../types';

export type NationalTeamTier = 'U17' | 'U18' | 'U21' | 'senior';

export type NationalTeamCallupEvent = {
  playerId: string;
  playerName: string;
  fromTier: NationalTeamTier | null;
  toTier: NationalTeamTier;
  // Player's avg current rating at the moment of the call-up — surfaced in
  // the banner ("(78 OVR) called up to England U17") so the notification
  // immediately conveys why this kid was called.
  playerOvr: number;
  // Permanent MV bump from being in this squad (NATIONAL_TEAM_MV_MULT - 1).
  // Stamped at call-up time for the banner; does not influence the actual
  // multiplier (computeMarketValue still reads the live nationalTeam field).
  mvBonusPct: number;
};

export type NationalTeamDropEvent = {
  playerId: string;
  playerName: string;
  fromTier: NationalTeamTier;
  toTier: NationalTeamTier | null;
};

// Lowered U17/U18 thresholds so 60-rated 16yos (good academy material) can
// realistically squeeze into the youth squad. Senior + U21 keep the 84 / 78
// bars — those should still feel like "wow" moments.
const TIER_DEFINITIONS = [
  { tier: 'senior', minAge: 19, maxAge: 99, minCurrent: 84 },
  { tier: 'U21', minAge: 18, maxAge: 21, minCurrent: 78 },
  { tier: 'U18', minAge: 17, maxAge: 18, minCurrent: 70 },
  { tier: 'U17', minAge: 15, maxAge: 17, minCurrent: 60 },
] as const;

export const NATIONAL_TEAM_MV_MULT: Record<NationalTeamTier, number> = {
  U17: 1.1,
  U18: 1.15,
  U21: 1.25,
  senior: 1.4,
};

// FOOTY-89: monthly sponsorship per called-up player (inflated at use-time).
// Tunes the squeeze: a senior international = +€15k/mo, two of them = +€30k.
export const SPONSORSHIP_BY_TIER: Record<NationalTeamTier, number> = {
  U17: 2_000,
  U18: 4_000,
  U21: 8_000,
  senior: 15_000,
};

export const NATIONAL_TEAM_TIER_RANK: Record<NationalTeamTier, number> = {
  U17: 1,
  U18: 2,
  U21: 3,
  senior: 4,
};

// Per-week promotion chance scaled by player current rating. Old flat 5%
// ignored quality — a 70 prospect and a 90 phenom rolled identically. The
// new bands give phenoms practically guaranteed regular call-ups while
// keeping 60-rated kids on a long shot. Numbers are weekly (multiply by 4
// for monthly rate).
function promotionChanceFor(avgCurrent: number): number {
  if (avgCurrent >= 90) return 0.04; // ≈ 15% / month
  if (avgCurrent >= 80) return 0.02; // ≈ 8% / month
  if (avgCurrent >= 70) return 0.01; // ≈ 4% / month
  if (avgCurrent >= 60) return 0.0025; // ≈ 1% / month
  return 0;
}

// Months → weeks for the demotion grace counter. Field is still named
// `monthsBelowTeamThreshold` for save compat but ticks per week.
const DROP_GRACE_MONTHS = 24;

function avgCurrent(player: Player): number {
  let sum = 0;
  for (const k of ALL_STAT_KEYS) sum += player.stats.current[k];
  return sum / ALL_STAT_KEYS.length;
}

export function getHighestQualifyingTier(player: Player): NationalTeamTier | null {
  if (player.blockOffers) return null; // no scout attention while blocked
  const cur = avgCurrent(player);
  for (const def of TIER_DEFINITIONS) {
    if (player.age < def.minAge || player.age > def.maxAge) continue;
    if (cur < def.minCurrent) continue;
    return def.tier;
  }
  return null;
}

export function nationalTeamMVMultiplier(player: Player): number {
  return player.nationalTeam ? NATIONAL_TEAM_MV_MULT[player.nationalTeam] : 1.0;
}

// Run the per-turn promotion / demotion logic against the entire roster.
// Returns the updated roster + the events to surface.
export function processNationalTeams(roster: readonly Player[]): {
  roster: Player[];
  callups: NationalTeamCallupEvent[];
  drops: NationalTeamDropEvent[];
} {
  const callups: NationalTeamCallupEvent[] = [];
  const drops: NationalTeamDropEvent[] = [];

  const updated = roster.map((player) => {
    const current = player.nationalTeam ?? null;
    const qualifying = getHighestQualifyingTier(player);
    const playerName = `${player.firstName} ${player.lastName}`;
    const ovr = Math.round(avgCurrent(player));
    const chance = promotionChanceFor(ovr);

    // Aged out of current tier — auto-demote (or drop) immediately, no grace.
    if (current && qualifying !== current) {
      const currentDef = TIER_DEFINITIONS.find((d) => d.tier === current);
      if (currentDef && player.age > currentDef.maxAge) {
        if (qualifying) {
          drops.push({ playerId: player.id, playerName, fromTier: current, toTier: qualifying });
          return {
            ...player,
            nationalTeam: qualifying,
            monthsBelowTeamThreshold: 0,
          };
        }
        drops.push({ playerId: player.id, playerName, fromTier: current, toTier: null });
        return { ...player, nationalTeam: null, monthsBelowTeamThreshold: 0 };
      }
    }

    // No current tier yet — promote probabilistically if they qualify.
    if (current == null) {
      if (qualifying != null && Math.random() < chance) {
        const mvBonusPct = Math.round((NATIONAL_TEAM_MV_MULT[qualifying] - 1) * 100);
        callups.push({
          playerId: player.id,
          playerName,
          fromTier: null,
          toTier: qualifying,
          playerOvr: ovr,
          mvBonusPct,
        });
        return { ...player, nationalTeam: qualifying, monthsBelowTeamThreshold: 0 };
      }
      return { ...player, monthsBelowTeamThreshold: 0 };
    }

    const currentRank = NATIONAL_TEAM_TIER_RANK[current];
    const qualifyingRank = qualifying ? NATIONAL_TEAM_TIER_RANK[qualifying] : 0;

    // Qualifies for a higher tier — try to promote.
    if (qualifyingRank > currentRank) {
      if (Math.random() < chance) {
        const toTier = qualifying as NationalTeamTier;
        const mvBonusPct = Math.round((NATIONAL_TEAM_MV_MULT[toTier] - 1) * 100);
        callups.push({
          playerId: player.id,
          playerName,
          fromTier: current,
          toTier,
          playerOvr: ovr,
          mvBonusPct,
        });
        return { ...player, nationalTeam: toTier, monthsBelowTeamThreshold: 0 };
      }
      return { ...player, monthsBelowTeamThreshold: 0 };
    }

    // Qualifies for current tier — hold steady.
    if (qualifyingRank === currentRank) {
      return { ...player, monthsBelowTeamThreshold: 0 };
    }

    // Below threshold for current tier — start the drop counter.
    const monthsBelowTeamThreshold = (player.monthsBelowTeamThreshold ?? 0) + 1;
    if (monthsBelowTeamThreshold >= DROP_GRACE_MONTHS) {
      const toTier = qualifying ?? null;
      drops.push({ playerId: player.id, playerName, fromTier: current, toTier });
      return { ...player, nationalTeam: toTier, monthsBelowTeamThreshold: 0 };
    }
    return { ...player, monthsBelowTeamThreshold };
  });

  return { roster: updated, callups, drops };
}
