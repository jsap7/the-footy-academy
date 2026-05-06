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
  // Selling state — toggled by the user via FOOTY-42 controls.
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
  // FOOTY-74: trailing 12 entries of monthly market value (pushed by
  // turnLoop after development). Drives the per-player MV chart.
  mvHistory?: { month: number; year: number; mv: number }[];
  // FOOTY-82: compounding multiplier from youth international call-ups,
  // capped at 2.0. Factored into computeMarketValue alongside tier premium.
  callupMultiplier?: number;
  // FOOTY-82: number of monthly ticks since the player's last call-up,
  // used for the cooldown so a single kid can't get called up every turn.
  monthsSinceLastCallup?: number;
  // FOOTY-82: lifetime callup history for the drawer indicator.
  callups?: { type: 'U17' | 'U18' | 'U21'; month: number; year: number; bonus: number }[];
  // FOOTY-83: months on roster (incremented each turn while on roster).
  // 24+ unlocks the Veteran badge: dev rate +10% and MV ×1.15 on sale.
  monthsOnRoster?: number;
  createdAt: number;
};
