import type { PlayerStats, StatKey } from './stats';
import type { QualityTier } from './tier';
import type { TraitId } from './trait';

export type Position =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'ST';

export const OUTFIELD_POSITIONS = [
  'CB',
  'LB',
  'RB',
  'LWB',
  'RWB',
  'CDM',
  'CM',
  'CAM',
  'LM',
  'RM',
  'LW',
  'RW',
  'CF',
  'ST',
] as const satisfies readonly Exclude<Position, 'GK'>[];

export type OutfieldPosition = (typeof OUTFIELD_POSITIONS)[number];

export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  birthMonth: number; // 1-12
  nationality: string;
  position: Position;
  stats: {
    current: PlayerStats;
    potential: PlayerStats;
  };
  traits: TraitId[];
  qualityTier: QualityTier;
  // Selling state — toggled by the user via selling controls.
  availableForSale: boolean;
  askingPrice: number | null;
  // When true, no new offers are generated for this player. Mutually
  // exclusive with availableForSale / askingPrice — set via setPlayerBlockOffers.
  blockOffers: boolean;
  // Per-stat gains from the most recent dev tick. Cleared/overwritten by the
  // turn loop. Used by the UI to flash a "+N" indicator next to stats that
  // grew this month.
  lastTurnGains?: Partial<Record<StatKey, number>>;
  // Sub-1.0 fractional progress accumulated between integer gains. Lets
  // trait dev-rate multipliers (e.g. workaholic ×1.20) actually compound
  // over time instead of being eaten by per-turn Math.round.
  developmentResidual?: Partial<Record<StatKey, number>>;
  // Trailing 12 entries of monthly market value (pushed by turnLoop after
  // development). Drives the per-player MV chart.
  mvHistory?: { month: number; year: number; mv: number }[];
  // Deprecated callup fields. Kept on the type so old saves hydrate without
  // dropping the field; computeMarketValue no longer reads these.
  // nationalTeam (below) is the live signal now.
  callupMultiplier?: number;
  monthsSinceLastCallup?: number;
  callups?: { type: 'U17' | 'U18' | 'U21'; month: number; year: number; bonus: number }[];
  // Persistent national team membership. null = not in any squad.
  // Promotion probabilistic per turn while qualifying for a higher tier;
  // demotion after DROP_GRACE_MONTHS below the current tier's threshold.
  nationalTeam?: 'U17' | 'U18' | 'U21' | 'senior' | null;
  monthsBelowTeamThreshold?: number;
  // Months on roster (incremented each turn while on roster).
  // 24+ unlocks the Veteran badge: dev rate +10% and MV ×1.15 on sale.
  monthsOnRoster?: number;
  createdAt: number;
};
