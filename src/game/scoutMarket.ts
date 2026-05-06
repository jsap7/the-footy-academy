import { generateScoutAtLevel, rollLevelFromAllowed } from './scoutGenerator';
import { FACILITY_DEFINITIONS, type FacilityTier } from '../types/facility';
import type { Scout } from '../types/scout';

export const SCOUT_MARKET_SIZE = 5;
const RARE_UPGRADE_CHANCE = 0.05;

// Facility tier gates which scout levels can surface. Each draw rolls a 5%
// chance to use the tier's rare-upgrade level (if defined) before falling
// back to the standard SCOUT_LEVEL_WEIGHTS distribution restricted to the
// tier's allowed set.
export function generateScoutMarket(facilityTier: FacilityTier = 1): Scout[] {
  const facility = FACILITY_DEFINITIONS[facilityTier];
  const allowed = facility.scoutLevelsAvailable.levels;
  const rare = facility.scoutLevelsAvailable.rareUpgrade;
  const market: Scout[] = [];
  for (let i = 0; i < SCOUT_MARKET_SIZE; i++) {
    const level = rare && Math.random() < RARE_UPGRADE_CHANCE ? rare : rollLevelFromAllowed(allowed);
    market.push(generateScoutAtLevel(level));
  }
  return market;
}
