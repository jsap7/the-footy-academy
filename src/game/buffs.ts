// Phase 6 — buffs system. Permanent buffs persist for the whole run;
// yearly buffs reset on the Jan W1 transition.
//
// Application sites (where each buff plugs in):
//   mv_plus_5            → marketValue.ts (read via runMVMultiplier)
//   dev_rate_plus_5      → development.ts (read via runDevMultiplier)
//   operating_minus_10   → finance.ts (read via runOperatingMultiplier)
//   income_plus_1m       → finance.ts / turnLoop (read via runIncomeBonus)
//   all_scout_levels     → facilities/market (read via runIgnoreScoutGate)
//   offer_2x_frequency   → offers.ts (read via runOfferFrequencyMultiplier)
//   free_facility_upgrade→ gameActions.upgradeFacility (consumed once)
//   reputation_plus_20   → reputation.ts (read via runReputationBonus)
//   token_challenge_skip → year-end check (consumed at Dec W4)

import type {
  GameState,
  PermanentBuff,
  PermanentBuffId,
  YearlyBuff,
  YearlyBuffId,
} from '../types';

// Caps so buffs don't compound to absurdity over many years. Soft, but
// real — past these, additional stacks are no-ops at the math layer
// (reward UI still allows picking them up, they just plateau).
const PERM_BUFF_CAP_STACKS: Record<PermanentBuffId, number> = {
  mv_plus_5: 4, // up to +20% MV
  dev_rate_plus_5: 4, // up to +20% dev rate
  operating_minus_10: 3, // up to -30% operating
  income_plus_1m: 3, // up to +€3M/wk
};

function permStacks(state: GameState, id: PermanentBuffId): number {
  let total = 0;
  for (const b of state.permanentBuffs ?? []) if (b.id === id) total += b.stacks;
  return Math.min(total, PERM_BUFF_CAP_STACKS[id]);
}

function hasYearly(state: GameState, id: YearlyBuffId): boolean {
  return (state.yearlyBuffs ?? []).some((b) => b.id === id && b.available !== false);
}

// MV: +5% per stack of mv_plus_5 (multiplicative on final MV).
export function runMVMultiplier(state: GameState): number {
  return 1 + 0.05 * permStacks(state, 'mv_plus_5');
}

// Development: +5% per stack of dev_rate_plus_5.
export function runDevMultiplier(state: GameState): number {
  return 1 + 0.05 * permStacks(state, 'dev_rate_plus_5');
}

// Operating: -10% per stack of operating_minus_10. Floors at the cap so
// even "Established Brand × 3" can't drive operating below a sane floor.
export function runOperatingMultiplier(state: GameState): number {
  return Math.max(0.4, 1 - 0.1 * permStacks(state, 'operating_minus_10'));
}

// Weekly income bonus: +€1M per stack of income_plus_1m. (Yes, this is a
// huge number — it's a rare reward.)
export function runIncomeBonus(state: GameState): number {
  return 1_000_000 * permStacks(state, 'income_plus_1m');
}

// Scout gating: when this is on, the scout market generator should ignore
// the facility tier's allowed-levels gate and surface every level.
export function runIgnoreScoutGate(state: GameState): boolean {
  return hasYearly(state, 'all_scout_levels');
}

// Offer frequency multiplier — applied to each player's monthly chance
// before the per-week divisor. 2× this year only.
export function runOfferFrequencyMultiplier(state: GameState): number {
  return hasYearly(state, 'offer_2x_frequency') ? 2 : 1;
}

// Reputation bonus: +20 to displayed/computed rep this year only.
export function runReputationBonus(state: GameState): number {
  return hasYearly(state, 'reputation_plus_20') ? 20 : 0;
}

// Free facility upgrade — single-use this year. Returns true if the buff
// is currently available; caller should also call consumeFreeFacilityUpgrade
// to flip it off after using.
export function hasFreeFacilityUpgrade(state: GameState): boolean {
  return hasYearly(state, 'free_facility_upgrade');
}

export function consumeFreeFacilityUpgrade(state: GameState): GameState {
  const yearlyBuffs = (state.yearlyBuffs ?? []).map((b) =>
    b.id === 'free_facility_upgrade' ? { ...b, available: false } : b,
  );
  return { ...state, yearlyBuffs };
}

// Reset yearly buffs at year roll. Called in the Jan W1 transition.
export function resetYearlyBuffs(state: GameState): GameState {
  return { ...state, yearlyBuffs: [] };
}

// Apply a freshly picked permanent buff. Stacks if already present.
export function addPermanentBuff(state: GameState, id: PermanentBuffId, year: number): GameState {
  const existing = (state.permanentBuffs ?? []).find((b) => b.id === id);
  let next: PermanentBuff[];
  if (existing) {
    next = (state.permanentBuffs ?? []).map((b) =>
      b.id === id ? { ...b, stacks: b.stacks + 1 } : b,
    );
  } else {
    next = [...(state.permanentBuffs ?? []), { id, acquiredYear: year, stacks: 1 }];
  }
  return { ...state, permanentBuffs: next };
}

// Apply a freshly picked yearly buff. If the user picks the same yearly
// buff twice in one year (impossible from the draw, but defensive), we
// just refresh the entry.
export function addYearlyBuff(state: GameState, id: YearlyBuffId, year: number): GameState {
  const dedup = (state.yearlyBuffs ?? []).filter((b) => b.id !== id);
  const buff: YearlyBuff = { id, acquiredYear: year };
  if (id === 'free_facility_upgrade') buff.available = true;
  return { ...state, yearlyBuffs: [...dedup, buff] };
}
