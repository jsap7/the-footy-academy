import type { Trait } from '../../types';

export const TALL: Trait = {
  id: 'tall',
  name: 'Tall',
  description: 'Naturally taller than other players his age, giving an edge in the air.',
  category: 'positive',
  baseEffects: [{ stat: 'jumpingReach', delta: 5 }],
  devRateEffects: [],
};

export const WORKAHOLIC: Trait = {
  id: 'workaholic',
  name: 'Workaholic',
  description: 'Trains harder than anyone. Develops faster across the board.',
  category: 'positive',
  baseEffects: [],
  devRateEffects: [{ target: 'all', multiplier: 1.2 }],
};

export const TECHNICALLY_GIFTED: Trait = {
  id: 'technically_gifted',
  name: 'Technically Gifted',
  description: 'Has a natural feel for the ball. Picks up technical skills faster than most.',
  category: 'positive',
  baseEffects: [{ stat: 'technique', delta: 5 }],
  devRateEffects: [{ target: 'technical', multiplier: 1.1 }],
};

export const NATURAL_ATHLETE: Trait = {
  id: 'natural_athlete',
  name: 'Natural Athlete',
  description: 'Born with a great base of physical attributes.',
  category: 'positive',
  baseEffects: [
    { stat: 'pace', delta: 3 },
    { stat: 'acceleration', delta: 3 },
    { stat: 'agility', delta: 3 },
  ],
  devRateEffects: [],
};

export const COMPOSED: Trait = {
  id: 'composed',
  name: 'Composed',
  description: 'Calm under pressure, even at his age.',
  category: 'positive',
  baseEffects: [{ stat: 'composure', delta: 5 }],
  devRateEffects: [],
};

export const LAZY: Trait = {
  id: 'lazy',
  name: 'Lazy',
  description: 'Coasts in training. Develops slower than his potential suggests.',
  category: 'negative',
  baseEffects: [],
  devRateEffects: [{ target: 'all', multiplier: 0.75 }],
};

export const FRAGILE: Trait = {
  id: 'fragile',
  name: 'Fragile',
  description: 'Smaller and weaker than most. Struggles to build up physically.',
  category: 'negative',
  baseEffects: [
    { stat: 'strength', delta: -5 },
    { stat: 'stamina', delta: -5 },
  ],
  devRateEffects: [{ target: 'physical', multiplier: 0.9 }],
};

export const HOT_HEADED: Trait = {
  id: 'hot_headed',
  name: 'Hot-Headed',
  description: 'Plays with fire, but loses his head when things get tough.',
  category: 'negative',
  baseEffects: [
    { stat: 'aggression', delta: 5 },
    { stat: 'composure', delta: -5 },
  ],
  devRateEffects: [],
};

export const SLOW_LEARNER: Trait = {
  id: 'slow_learner',
  name: 'Slow Learner',
  description: 'Takes longer than most to absorb technical instruction.',
  category: 'negative',
  baseEffects: [],
  devRateEffects: [{ target: 'technical', multiplier: 0.85 }],
};

// All 32 outfield stats at -10, current-only. Targeting current preserves
// the player's tier-rolled potential ceiling so the +30% dev-rate can close
// the gap. Hand-listed: every outfield stat must be present.
export const LATE_BLOOMER: Trait = {
  id: 'late_bloomer',
  name: 'Late Bloomer',
  description: 'Behind the curve right now, but has an unusual ceiling for late-teen growth.',
  category: 'neutral',
  baseEffects: [
    // Physical (8)
    { stat: 'pace', delta: -10, target: 'current' },
    { stat: 'acceleration', delta: -10, target: 'current' },
    { stat: 'strength', delta: -10, target: 'current' },
    { stat: 'stamina', delta: -10, target: 'current' },
    { stat: 'agility', delta: -10, target: 'current' },
    { stat: 'balance', delta: -10, target: 'current' },
    { stat: 'jumpingReach', delta: -10, target: 'current' },
    { stat: 'naturalFitness', delta: -10, target: 'current' },
    // Technical (12)
    { stat: 'finishing', delta: -10, target: 'current' },
    { stat: 'longShots', delta: -10, target: 'current' },
    { stat: 'passingShort', delta: -10, target: 'current' },
    { stat: 'passingLong', delta: -10, target: 'current' },
    { stat: 'dribbling', delta: -10, target: 'current' },
    { stat: 'firstTouch', delta: -10, target: 'current' },
    { stat: 'crossing', delta: -10, target: 'current' },
    { stat: 'tackling', delta: -10, target: 'current' },
    { stat: 'heading', delta: -10, target: 'current' },
    { stat: 'technique', delta: -10, target: 'current' },
    { stat: 'freeKicks', delta: -10, target: 'current' },
    { stat: 'penalties', delta: -10, target: 'current' },
    // Mental (12)
    { stat: 'vision', delta: -10, target: 'current' },
    { stat: 'composure', delta: -10, target: 'current' },
    { stat: 'decisions', delta: -10, target: 'current' },
    { stat: 'workRate', delta: -10, target: 'current' },
    { stat: 'aggression', delta: -10, target: 'current' },
    { stat: 'positioning', delta: -10, target: 'current' },
    { stat: 'anticipation', delta: -10, target: 'current' },
    { stat: 'bravery', delta: -10, target: 'current' },
    { stat: 'concentration', delta: -10, target: 'current' },
    { stat: 'determination', delta: -10, target: 'current' },
    { stat: 'leadership', delta: -10, target: 'current' },
    { stat: 'teamwork', delta: -10, target: 'current' },
  ],
  devRateEffects: [{ target: 'all', multiplier: 1.3 }],
};

export const LEADER: Trait = {
  id: 'leader',
  name: 'Leader',
  description: 'A natural voice in the dressing room, even as a teenager.',
  category: 'neutral',
  baseEffects: [
    { stat: 'leadership', delta: 5 },
    { stat: 'teamwork', delta: 3 },
  ],
  devRateEffects: [],
};

export const PHYSICAL_SPECIMEN: Trait = {
  id: 'physical_specimen',
  name: 'Physical Specimen',
  description: 'Built like a tank. Strong and dominant, but not the most graceful mover.',
  category: 'neutral',
  baseEffects: [
    { stat: 'strength', delta: 5 },
    { stat: 'jumpingReach', delta: 5 },
    { stat: 'agility', delta: -3 },
    { stat: 'balance', delta: -3 },
  ],
  devRateEffects: [],
};

export const ALL_TRAITS: readonly Trait[] = [
  TALL,
  WORKAHOLIC,
  TECHNICALLY_GIFTED,
  NATURAL_ATHLETE,
  COMPOSED,
  LAZY,
  FRAGILE,
  HOT_HEADED,
  SLOW_LEARNER,
  LATE_BLOOMER,
  LEADER,
  PHYSICAL_SPECIMEN,
];
