import { applyInflation } from './inflation';
import {
  FACILITY_DEFINITIONS,
  FACILITY_TIERS,
  type FacilityDefinition,
  type FacilityTier,
} from '../types/facility';
import type { GameState, Scout, ScoutLevel } from '../types';

export function getFacility(tier: FacilityTier): FacilityDefinition {
  return FACILITY_DEFINITIONS[tier];
}

export function getCurrentFacility(state: GameState): FacilityDefinition {
  return getFacility(state.facilityTier);
}

export function getNextFacilityTier(currentTier: FacilityTier): FacilityTier | null {
  const idx = FACILITY_TIERS.indexOf(currentTier);
  if (idx === -1 || idx === FACILITY_TIERS.length - 1) return null;
  return FACILITY_TIERS[idx + 1];
}

export function getPrevFacilityTier(currentTier: FacilityTier): FacilityTier | null {
  const idx = FACILITY_TIERS.indexOf(currentTier);
  if (idx <= 0) return null;
  return FACILITY_TIERS[idx - 1];
}

// What scout levels are bookable at the given facility tier? Used by the
// scout market generator and by canDowngradeFacility's orphan check.
export function allowedScoutLevelsForTier(tier: FacilityTier): readonly ScoutLevel[] {
  const def = getFacility(tier);
  const set = new Set<ScoutLevel>(def.scoutLevelsAvailable.levels);
  if (def.scoutLevelsAvailable.rareUpgrade) set.add(def.scoutLevelsAvailable.rareUpgrade);
  return [...set];
}

// "Orphans" are hired scouts whose level is not allowed at the given tier.
// Used so we can warn the user before downgrading manually.
export function scoutsAboveTier(scouts: readonly Scout[], tier: FacilityTier): Scout[] {
  const allowed = new Set(allowedScoutLevelsForTier(tier));
  return scouts.filter((s) => !allowed.has(s.level));
}

export type FacilityGate = { ok: true } | { ok: false; reason: string };

// Inflated upgrade cost — read at use-time so the displayed price reflects
// the current year's inflation factor.
export function currentUpgradeCost(state: GameState, targetTier: FacilityTier): number {
  return applyInflation(getFacility(targetTier).upgradeCost, state.currentYear);
}

// Inflated monthly cost for the facility currently selected by state.
export function currentFacilityMonthly(state: GameState): number {
  return applyInflation(getCurrentFacility(state).monthlyCost, state.currentYear);
}

export function canUpgradeFacility(state: GameState): FacilityGate {
  const next = getNextFacilityTier(state.facilityTier);
  if (next == null) return { ok: false, reason: 'already at top tier' };
  const cost = currentUpgradeCost(state, next);
  if (state.cash < cost) return { ok: false, reason: 'insufficient cash' };
  return { ok: true };
}

export function canDowngradeFacility(state: GameState): FacilityGate {
  const prev = getPrevFacilityTier(state.facilityTier);
  if (prev == null) return { ok: false, reason: 'already at base tier' };
  const orphans = scoutsAboveTier(state.scouts, prev);
  if (orphans.length > 0) {
    return {
      ok: false,
      reason: `fire ${orphans.length} scout${orphans.length === 1 ? '' : 's'} above tier ${prev}`,
    };
  }
  return { ok: true };
}
