import { INFLATION_BASE_YEAR } from './inflation';
import { generateScoutAtLevel, rollLevelFromAllowed } from './scoutGenerator';
import { FACILITY_DEFINITIONS, type FacilityTier } from '../types/facility';
import type { ScoutLevel, Scout } from '../types/scout';

export const SCOUT_MARKET_SIZE = 5;
const RARE_UPGRADE_CHANCE = 0.05;

// Facility tier gates which scout levels can surface. Each draw rolls a 5%
// chance to use the tier's rare-upgrade level (if defined) before falling
// back to the standard SCOUT_LEVEL_WEIGHTS distribution restricted to the
// tier's allowed set. currentYear is passed through so a market generated in
// 2030 books inflated salaries onto each scout (existing scouts keep their
// hire-time salary — see scoutGenerator).
export function generateScoutMarket(
  facilityTier: FacilityTier = 1,
  currentYear: number = INFLATION_BASE_YEAR,
  ignoreScoutGate = false,
): Scout[] {
  const facility = FACILITY_DEFINITIONS[facilityTier];
  // "All Scout Levels Available" buff: ignore the facility gate and surface
  // every level for the year. Also lifts the rare-upgrade chance since the
  // upgrade slot becomes pointless.
  const allowed: readonly ScoutLevel[] = ignoreScoutGate
    ? ([1, 2, 3, 4, 5] as const)
    : facility.scoutLevelsAvailable.levels;
  const rare = ignoreScoutGate ? undefined : facility.scoutLevelsAvailable.rareUpgrade;
  const market: Scout[] = [];
  for (let i = 0; i < SCOUT_MARKET_SIZE; i++) {
    const level =
      rare && Math.random() < RARE_UPGRADE_CHANCE ? rare : rollLevelFromAllowed(allowed);
    market.push(generateScoutAtLevel(level, currentYear));
  }
  return market;
}
