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
  // Per-stat gains from the most recent dev tick. Cleared/overwritten by the
  // turn loop. Used by the UI to flash a "+N" indicator next to stats that
  // grew this month.
  lastTurnGains?: Partial<Record<StatKey, number>>;
  createdAt: number;
};
