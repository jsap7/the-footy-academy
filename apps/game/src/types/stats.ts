export type PlayerStats = {
  // Physical (8)
  pace: number;
  acceleration: number;
  strength: number;
  stamina: number;
  agility: number;
  balance: number;
  jumpingReach: number;
  naturalFitness: number;

  // Technical (12)
  finishing: number;
  longShots: number;
  passingShort: number;
  passingLong: number;
  dribbling: number;
  firstTouch: number;
  crossing: number;
  tackling: number;
  heading: number;
  technique: number;
  freeKicks: number;
  penalties: number;

  // Mental (12)
  vision: number;
  composure: number;
  decisions: number;
  workRate: number;
  aggression: number;
  positioning: number;
  anticipation: number;
  bravery: number;
  concentration: number;
  determination: number;
  leadership: number;
  teamwork: number;
};

export type StatKey = keyof PlayerStats;

export type StatGroup = 'physical' | 'technical' | 'mental';

export const STAT_GROUPS = {
  physical: [
    'pace',
    'acceleration',
    'strength',
    'stamina',
    'agility',
    'balance',
    'jumpingReach',
    'naturalFitness',
  ],
  technical: [
    'finishing',
    'longShots',
    'passingShort',
    'passingLong',
    'dribbling',
    'firstTouch',
    'crossing',
    'tackling',
    'heading',
    'technique',
    'freeKicks',
    'penalties',
  ],
  mental: [
    'vision',
    'composure',
    'decisions',
    'workRate',
    'aggression',
    'positioning',
    'anticipation',
    'bravery',
    'concentration',
    'determination',
    'leadership',
    'teamwork',
  ],
} as const satisfies Record<StatGroup, readonly StatKey[]>;

export const STAT_LABELS: Record<StatKey, string> = {
  // Physical
  pace: 'Pace',
  acceleration: 'Acceleration',
  strength: 'Strength',
  stamina: 'Stamina',
  agility: 'Agility',
  balance: 'Balance',
  jumpingReach: 'Jumping Reach',
  naturalFitness: 'Natural Fitness',

  // Technical
  finishing: 'Finishing',
  longShots: 'Long Shots',
  passingShort: 'Passing (Short)',
  passingLong: 'Passing (Long)',
  dribbling: 'Dribbling',
  firstTouch: 'First Touch',
  crossing: 'Crossing',
  tackling: 'Tackling',
  heading: 'Heading',
  technique: 'Technique',
  freeKicks: 'Free Kicks',
  penalties: 'Penalties',

  // Mental
  vision: 'Vision',
  composure: 'Composure',
  decisions: 'Decisions',
  workRate: 'Work Rate',
  aggression: 'Aggression',
  positioning: 'Positioning',
  anticipation: 'Anticipation',
  bravery: 'Bravery',
  concentration: 'Concentration',
  determination: 'Determination',
  leadership: 'Leadership',
  teamwork: 'Teamwork',
};

export const STAT_GROUP_LABELS: Record<StatGroup, string> = {
  physical: 'Physical',
  technical: 'Technical',
  mental: 'Mental',
};

export const ALL_STAT_KEYS: readonly StatKey[] = [
  ...STAT_GROUPS.physical,
  ...STAT_GROUPS.technical,
  ...STAT_GROUPS.mental,
];
