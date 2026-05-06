import type { PlayerStats } from './stats';

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
  nationality: string;
  position: Position;
  stats: {
    current: PlayerStats;
    potential: PlayerStats;
  };
  createdAt: number;
};
