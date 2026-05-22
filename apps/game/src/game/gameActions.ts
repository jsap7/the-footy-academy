import { withAchievementCheck } from './achievements';
import { consumeFreeFacilityUpgrade, hasFreeFacilityUpgrade } from './buffs';
import { trackSaleForChallenge } from './challengeTracking';
import {
  canDowngradeFacility,
  canUpgradeFacility,
  currentUpgradeCost,
  getFacility,
  getNextFacilityTier,
  getPrevFacilityTier,
} from './facilities';
import { executeAcceptedOffers } from './offers';
import { appendTransaction } from './transactions';
import type { GameState } from '../types';

// Block scout hires when an active challenge says so. "Scout Strike" forbids
// any hire all year; "Survive the Strike" forbids hires during months 4–9.
export function isScoutHireBlocked(state: GameState): { blocked: boolean; reason?: string } {
  const ch = state.currentChallenge;
  if (!ch) return { blocked: false };
  if (ch.defId === 'scout_strike') {
    return { blocked: true, reason: 'Scout Strike challenge — no scout hires this year' };
  }
  if (ch.defId === 'survive_strike') {
    const inWindow = (ch.meta?.strikeWindowMonths ?? []).includes(state.currentMonth);
    if (inWindow) {
      return { blocked: true, reason: 'Strike window (Apr–Sep) — no scout hires' };
    }
  }
  return { blocked: false };
}

export function hireScout(state: GameState, scoutId: string): GameState {
  const scout = state.scoutMarket.find((s) => s.id === scoutId);
  if (!scout) return state;
  if (isScoutHireBlocked(state).blocked) return state;
  const transactions = appendTransaction(state, {
    type: 'scout_hire',
    description: `Hired ${scout.firstName} ${scout.lastName} (lvl ${scout.level})`,
    amount: 0,
  });
  // Bump the active-challenge tally so "Scout Strike" / "Survive the
  // Strike" / "Scout Investment" / "no_scout_hires" trackers see this hire.
  let currentChallenge = state.currentChallenge;
  if (currentChallenge) {
    const meta = { ...(currentChallenge.meta ?? {}) };
    meta.scoutHiresThisYear = (meta.scoutHiresThisYear ?? 0) + 1;
    currentChallenge = { ...currentChallenge, meta };
  }
  return withAchievementCheck({
    ...state,
    scoutMarket: state.scoutMarket.filter((s) => s.id !== scoutId),
    scouts: [...state.scouts, scout],
    transactions,
    currentChallenge,
  });
}

export function fireScout(state: GameState, scoutId: string): GameState {
  const scout = state.scouts.find((s) => s.id === scoutId);
  if (!scout) return state;
  const transactions = appendTransaction(state, {
    type: 'scout_fire',
    description: `Fired ${scout.firstName} ${scout.lastName} (lvl ${scout.level})`,
    amount: 0,
  });
  return {
    ...state,
    scouts: state.scouts.filter((s) => s.id !== scoutId),
    transactions,
  };
}

export function signPlayer(state: GameState, shortlistEntryId: string): GameState {
  const entry = state.shortlist.find((e) => e.id === shortlistEntryId);
  if (!entry) return state;
  if (state.cash < entry.signingFee) return state;
  const transactions = appendTransaction(state, {
    type: 'signing',
    description: `Signed ${entry.player.firstName} ${entry.player.lastName} (${entry.player.qualityTier})`,
    amount: -entry.signingFee,
  });
  return withAchievementCheck({
    ...state,
    cash: state.cash - entry.signingFee,
    shortlist: state.shortlist.filter((e) => e.id !== shortlistEntryId),
    roster: [entry.player, ...state.roster],
    transactions,
  });
}

// Accept the offer in-place — marks status accepted and immediately executes
// the sale so the UI sees the cash + roster change instantly. Adds a
// SaleEvent so the post-turn banner displays the win.
export function acceptOffer(state: GameState, offerId: string): GameState {
  const offer = state.pendingOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  if (offer.status !== 'pending' && offer.status !== 'countered') return state;
  // Snapshot the player and club BEFORE we run executeAcceptedOffers — that
  // call removes the sold player from roster, so we'd have nothing to
  // hand to the challenge tracker afterwards.
  const soldPlayer = state.roster.find((p) => p.id === offer.playerId);
  const soldClub = state.clubs.find((c) => c.id === offer.clubId);
  const flagged: GameState = {
    ...state,
    pendingOffers: state.pendingOffers.map((o) =>
      o.id === offerId ? { ...o, status: 'accepted' as const } : o,
    ),
  };
  const result = executeAcceptedOffers(flagged);
  let transactions = result.state.transactions;
  let currentChallenge = state.currentChallenge;
  for (const sale of result.saleEvents) {
    transactions = appendTransaction(
      { ...result.state, transactions },
      {
        type: 'sale',
        description: `Sold ${sale.playerName} → ${sale.clubName}`,
        amount: sale.amount,
      },
    );
    if (soldPlayer) {
      currentChallenge = trackSaleForChallenge(currentChallenge, sale, soldPlayer, soldClub);
    }
  }
  return withAchievementCheck({
    ...result.state,
    transactions,
    recentSales: [...state.recentSales, ...result.saleEvents],
    currentChallenge,
  });
}

export function counterOffer(state: GameState, offerId: string, counter: number): GameState {
  if (counter <= 0) return state;
  const offer = state.pendingOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  if (offer.status !== 'pending') return state;
  return {
    ...state,
    pendingOffers: state.pendingOffers.map((o) =>
      o.id === offerId
        ? { ...o, yourCounter: Math.round(counter), status: 'countered' as const }
        : o,
    ),
  };
}

export function setPlayerAvailable(
  state: GameState,
  playerId: string,
  available: boolean,
): GameState {
  return {
    ...state,
    roster: state.roster.map((p) =>
      p.id === playerId
        ? { ...p, availableForSale: available, blockOffers: available ? false : p.blockOffers }
        : p,
    ),
  };
}

const MIN_ASKING_PRICE = 1_000;

export function listPlayer(state: GameState, playerId: string, askingPrice: number): GameState {
  const clamped = Math.max(MIN_ASKING_PRICE, Math.round(askingPrice));
  return {
    ...state,
    roster: state.roster.map((p) =>
      p.id === playerId ? { ...p, askingPrice: clamped, blockOffers: false } : p,
    ),
  };
}

export function unlistPlayer(state: GameState, playerId: string): GameState {
  return {
    ...state,
    roster: state.roster.map((p) => (p.id === playerId ? { ...p, askingPrice: null } : p)),
  };
}

// Toggle the per-player block-offers flag. When turning ON, also clear
// availableForSale + askingPrice — they're mutually exclusive UI states.
// Existing pending offers stay so the user can resolve them manually.
export function setPlayerBlockOffers(
  state: GameState,
  playerId: string,
  blocked: boolean,
): GameState {
  return {
    ...state,
    roster: state.roster.map((p) =>
      p.id === playerId
        ? blocked
          ? { ...p, blockOffers: true, availableForSale: false, askingPrice: null }
          : { ...p, blockOffers: false }
        : p,
    ),
  };
}

// Manually release a player from the roster. No severance, no refund of the
// signing fee. Walks any pending/countered offers for the player so they
// don't linger in the offers tab. Adds a release event so the post-turn
// banner shows it alongside auto-releases at age 22.
export function releasePlayer(state: GameState, playerId: string): GameState {
  const player = state.roster.find((p) => p.id === playerId);
  if (!player) return state;
  const transactions = appendTransaction(state, {
    type: 'release',
    description: `Released ${player.firstName} ${player.lastName}`,
    amount: 0,
  });
  const pendingOffers = state.pendingOffers.map((o) =>
    o.playerId === playerId && (o.status === 'pending' || o.status === 'countered')
      ? { ...o, status: 'walked' as const }
      : o,
  );
  return {
    ...state,
    roster: state.roster.filter((p) => p.id !== playerId),
    pendingOffers,
    transactions,
    recentReleases: [
      ...state.recentReleases,
      {
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        finalAge: player.age,
      },
    ],
  };
}

// Drop a shortlist entry. Used when a scout's find isn't worth a signing
// slot — clears the row so it doesn't keep showing up against the cap.
export function rejectShortlistEntry(state: GameState, entryId: string): GameState {
  const entry = state.shortlist.find((e) => e.id === entryId);
  if (!entry) return state;
  return {
    ...state,
    shortlist: state.shortlist.filter((e) => e.id !== entryId),
  };
}

export function upgradeFacility(state: GameState): GameState {
  // A "Free Facility Upgrade" yearly buff bypasses the cash gate
  // and zeroes the cost. Consumed on use.
  const free = hasFreeFacilityUpgrade(state);
  const next = getNextFacilityTier(state.facilityTier);
  if (next == null) return state;
  const cost = free ? 0 : currentUpgradeCost(state, next);
  if (!free) {
    const gate = canUpgradeFacility(state);
    if (!gate.ok) return state;
  }
  const transactions = appendTransaction(state, {
    type: 'facility_upgrade',
    description: free
      ? `Upgraded facility to ${getFacility(next).name} (free)`
      : `Upgraded facility to ${getFacility(next).name}`,
    amount: -cost,
  });
  // Bump challenge tally for "Facility Upgrade" trackers.
  let currentChallenge = state.currentChallenge;
  if (currentChallenge) {
    const meta = { ...(currentChallenge.meta ?? {}) };
    meta.facilityUpgradesThisYear = (meta.facilityUpgradesThisYear ?? 0) + 1;
    currentChallenge = { ...currentChallenge, meta };
  }
  let next$: GameState = withAchievementCheck({
    ...state,
    cash: state.cash - cost,
    facilityTier: next,
    facilityGraceMonthsRemaining: 0,
    transactions,
    currentChallenge,
  });
  if (free) next$ = consumeFreeFacilityUpgrade(next$);
  return next$;
}

// Manual downgrade — never refunds the upgrade cost. Auto-downgrade shares
// the tier shift but gets to ignore the orphan rule because it fires scouts
// as part of the demotion.
export function downgradeFacility(state: GameState): GameState {
  const gate = canDowngradeFacility(state);
  if (!gate.ok) return state;
  const prev = getPrevFacilityTier(state.facilityTier);
  if (prev == null) return state;
  const transactions = appendTransaction(state, {
    type: 'facility_downgrade',
    description: `Downgraded facility to ${getFacility(prev).name}`,
    amount: 0,
  });
  return {
    ...state,
    facilityTier: prev,
    facilityGraceMonthsRemaining: 0,
    transactions,
  };
}

export function rejectOffer(state: GameState, offerId: string): GameState {
  const offer = state.pendingOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  if (offer.status !== 'pending' && offer.status !== 'countered') return state;
  return {
    ...state,
    pendingOffers: state.pendingOffers.map((o) =>
      o.id === offerId ? { ...o, status: 'rejected' as const } : o,
    ),
  };
}
