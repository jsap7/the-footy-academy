import type { ScoutLevel } from './scout';

export type FacilityTier = 1 | 2 | 3 | 4 | 5;

export type FacilityDefinition = {
  tier: FacilityTier;
  name: string;
  upgradeCost: number; // one-time cost to upgrade TO this tier from the one below
  monthlyCost: number; // ongoing maintenance
  developmentMultiplier: number; // multiplied into the per-stat dev gain calc
  scoutLevelsAvailable: {
    levels: readonly ScoutLevel[]; // levels that always appear in the scout market
    rareUpgrade?: ScoutLevel; // an additional level that occasionally surfaces
  };
};

export const FACILITY_DEFINITIONS: Record<FacilityTier, FacilityDefinition> = {
  1: {
    tier: 1,
    name: 'Backyard Pitch',
    upgradeCost: 0,
    monthlyCost: 0,
    developmentMultiplier: 1.0,
    // FOOTY-70: tightened to lvl 1 only. The "sliver of hope" tier-bias
    // change means even an L1 scout can in theory find an elite, so the
    // facility gate is what funnels users toward upgrading.
    scoutLevelsAvailable: { levels: [1] },
  },
  2: {
    tier: 2,
    name: 'Local Facility',
    upgradeCost: 500_000,
    monthlyCost: 15_000,
    developmentMultiplier: 1.1,
    scoutLevelsAvailable: { levels: [1], rareUpgrade: 2 },
  },
  3: {
    tier: 3,
    name: 'Regional Academy',
    upgradeCost: 2_000_000,
    monthlyCost: 75_000,
    developmentMultiplier: 1.2,
    scoutLevelsAvailable: { levels: [2, 3] },
  },
  4: {
    tier: 4,
    name: 'Elite Academy',
    upgradeCost: 8_000_000,
    monthlyCost: 300_000,
    developmentMultiplier: 1.35,
    scoutLevelsAvailable: { levels: [3, 4], rareUpgrade: 5 },
  },
  5: {
    tier: 5,
    name: 'World-Class',
    upgradeCost: 30_000_000,
    monthlyCost: 1_000_000,
    developmentMultiplier: 1.5,
    scoutLevelsAvailable: { levels: [4, 5] },
  },
};

export const FACILITY_TIERS: readonly FacilityTier[] = [1, 2, 3, 4, 5];
