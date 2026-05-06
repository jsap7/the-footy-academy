import type { Position, StatKey } from '../types';

// 5-7 stats per position. These are the only stats that get the +20 potential
// bonus during generation. Irrelevant stats are NOT penalised — they just
// don't get the bump. Keep these lists internally consistent: LB/RB and
// LM/RM are mirrors, LW/RW are mirrors.
export const POSITION_RELEVANT_STATS: Record<Position, readonly StatKey[]> = {
  GK: [],

  CB: ['strength', 'jumpingReach', 'heading', 'tackling', 'positioning', 'aggression', 'bravery'],
  LB: ['pace', 'stamina', 'crossing', 'tackling', 'positioning', 'workRate'],
  RB: ['pace', 'stamina', 'crossing', 'tackling', 'positioning', 'workRate'],
  LWB: ['pace', 'stamina', 'crossing', 'dribbling', 'workRate', 'tackling'],
  RWB: ['pace', 'stamina', 'crossing', 'dribbling', 'workRate', 'tackling'],

  CDM: ['stamina', 'tackling', 'positioning', 'decisions', 'passingShort', 'workRate', 'aggression'],
  CM: ['passingShort', 'passingLong', 'vision', 'stamina', 'workRate', 'decisions', 'technique'],
  CAM: ['vision', 'technique', 'passingShort', 'dribbling', 'firstTouch', 'composure', 'longShots'],

  LM: ['pace', 'stamina', 'crossing', 'dribbling', 'workRate'],
  RM: ['pace', 'stamina', 'crossing', 'dribbling', 'workRate'],
  LW: ['pace', 'acceleration', 'dribbling', 'technique', 'finishing', 'firstTouch', 'crossing'],
  RW: ['pace', 'acceleration', 'dribbling', 'technique', 'finishing', 'firstTouch', 'crossing'],

  CF: ['finishing', 'composure', 'anticipation', 'firstTouch', 'dribbling', 'technique', 'longShots'],
  ST: ['finishing', 'composure', 'anticipation', 'heading', 'positioning', 'jumpingReach', 'strength'],
};
