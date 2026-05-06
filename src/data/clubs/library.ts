import type { Club } from '../../types';
import { TIER_WEALTH } from '../../types/club';

export const CLUB_LIBRARY: readonly Club[] = [
  // Tier 1 — top of the world
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    shortName: 'Madrid',
    country: 'Spain',
    tier: 1,
    wealthCeiling: TIER_WEALTH[1],
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'Man City',
    country: 'England',
    tier: 1,
    wealthCeiling: TIER_WEALTH[1],
  },
  {
    id: 'bayern-munich',
    name: 'Bayern Munich',
    shortName: 'Bayern',
    country: 'Germany',
    tier: 1,
    wealthCeiling: TIER_WEALTH[1],
  },
  {
    id: 'paris-saint-germain',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    country: 'France',
    tier: 1,
    wealthCeiling: TIER_WEALTH[1],
  },

  // Tier 2 — top European mid-table / big in non-top-5
  {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'Liverpool',
    country: 'England',
    tier: 2,
    wealthCeiling: TIER_WEALTH[2],
  },
  {
    id: 'inter-milan',
    name: 'Inter Milan',
    shortName: 'Inter',
    country: 'Italy',
    tier: 2,
    wealthCeiling: TIER_WEALTH[2],
  },
  {
    id: 'borussia-dortmund',
    name: 'Borussia Dortmund',
    shortName: 'Dortmund',
    country: 'Germany',
    tier: 2,
    wealthCeiling: TIER_WEALTH[2],
  },
  {
    id: 'atletico-madrid',
    name: 'Atlético Madrid',
    shortName: 'Atlético',
    country: 'Spain',
    tier: 2,
    wealthCeiling: TIER_WEALTH[2],
  },

  // Tier 3 — mid Premier League / mid La Liga / etc
  {
    id: 'aston-villa',
    name: 'Aston Villa',
    shortName: 'Villa',
    country: 'England',
    tier: 3,
    wealthCeiling: TIER_WEALTH[3],
  },
  {
    id: 'real-betis',
    name: 'Real Betis',
    shortName: 'Betis',
    country: 'Spain',
    tier: 3,
    wealthCeiling: TIER_WEALTH[3],
  },
  {
    id: 'lazio',
    name: 'Lazio',
    shortName: 'Lazio',
    country: 'Italy',
    tier: 3,
    wealthCeiling: TIER_WEALTH[3],
  },
  {
    id: 'lyon',
    name: 'Lyon',
    shortName: 'Lyon',
    country: 'France',
    tier: 3,
    wealthCeiling: TIER_WEALTH[3],
  },

  // Tier 4 — lower European / strong non-European
  {
    id: 'brighton',
    name: 'Brighton',
    shortName: 'Brighton',
    country: 'England',
    tier: 4,
    wealthCeiling: TIER_WEALTH[4],
  },
  {
    id: 'ajax',
    name: 'Ajax',
    shortName: 'Ajax',
    country: 'Netherlands',
    tier: 4,
    wealthCeiling: TIER_WEALTH[4],
  },
  {
    id: 'lille',
    name: 'Lille',
    shortName: 'Lille',
    country: 'France',
    tier: 4,
    wealthCeiling: TIER_WEALTH[4],
  },
  {
    id: 'nottingham-forest',
    name: 'Nottingham Forest',
    shortName: 'Forest',
    country: 'England',
    tier: 4,
    wealthCeiling: TIER_WEALTH[4],
  },

  // Tier 5 — championship / lower tiers
  {
    id: 'leeds-united',
    name: 'Leeds United',
    shortName: 'Leeds',
    country: 'England',
    tier: 5,
    wealthCeiling: TIER_WEALTH[5],
  },
  {
    id: 'norwich-city',
    name: 'Norwich City',
    shortName: 'Norwich',
    country: 'England',
    tier: 5,
    wealthCeiling: TIER_WEALTH[5],
  },
  {
    id: 'coventry-city',
    name: 'Coventry City',
    shortName: 'Coventry',
    country: 'England',
    tier: 5,
    wealthCeiling: TIER_WEALTH[5],
  },
  {
    id: 'burnley',
    name: 'Burnley',
    shortName: 'Burnley',
    country: 'England',
    tier: 5,
    wealthCeiling: TIER_WEALTH[5],
  },
];
