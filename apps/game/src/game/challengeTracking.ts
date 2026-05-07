// Phase 6 — apply event signals to the active challenge's progress + meta.
// Called from sale execution, scout hires, facility upgrades, scout finds,
// and per-week from the turn loop (for ratchet-style trackers like
// maintain_min_scouts and wage_cap_below).
//
// All updates are pure: returns a new ActiveChallenge or the same instance
// when there's nothing to bump.

import type { ActiveChallenge, Club, GameState, Player, QualityTier, SaleEvent } from '../types';
import { averageCurrent } from './playerStats';
import { computeReputation } from './reputation';
import { calculateStipend } from './stipends';
import { WEEKS_PER_MONTH } from './finance';

const QUALITY_RANK: Record<QualityTier, number> = {
  mid: 1,
  good: 2,
  great: 3,
  elite: 4,
  generational: 5,
};

// Sale fired by either acceptOffer or executeAcceptedOffers — feed it into
// any tracker that watches sales. We need the full sold Player + the Club
// they went to, since some trackers care about quality / club tier.
export function trackSaleForChallenge(
  challenge: ActiveChallenge | null,
  sale: SaleEvent,
  soldPlayer: Player,
  club: Club | undefined,
): ActiveChallenge | null {
  if (!challenge) return challenge;
  const meta = { ...(challenge.meta ?? {}) };
  let progress = challenge.progress;

  switch (challenge.defId) {
    case 'first_sale':
    case 'two_sales':
    case 'multi_sale_4': {
      meta.salesCount = (meta.salesCount ?? 0) + 1;
      progress = meta.salesCount;
      break;
    }
    case 'big_sale_1m':
    case 'major_transfer': {
      meta.biggestSaleAmount = Math.max(meta.biggestSaleAmount ?? 0, sale.amount);
      progress = meta.biggestSaleAmount;
      break;
    }
    case 'total_domination': {
      if (sale.amount >= 5_000_000) {
        meta.bigSale5mCount = (meta.bigSale5mCount ?? 0) + 1;
        progress = meta.bigSale5mCount;
      }
      break;
    }
    case 'sponsor_demands': {
      if (club && (club.tier === 1 || club.tier === 2)) {
        const set = new Set(meta.distinctTier12ClubIds ?? []);
        set.add(club.id);
        meta.distinctTier12ClubIds = [...set];
        progress = meta.distinctTier12ClubIds.length;
      }
      break;
    }
    case 'multi_tier_sales': {
      if (club) {
        const set = new Set(meta.distinctClubTiers ?? []);
        set.add(club.tier);
        meta.distinctClubTiers = [...set];
        progress = meta.distinctClubTiers.length;
      }
      break;
    }
    case 'generational_sale': {
      if (soldPlayer.qualityTier === 'generational') {
        progress = 1;
      }
      break;
    }
    default:
      // Net-profit / cash-above / modest-growth aren't sale-driven; cash
      // deltas land via the per-week tick path.
      break;
  }

  return { ...challenge, progress, meta };
}

// A scout has just been added to the shortlist. Tracks find-quality
// challenges (Find a Gem at elite+; Generational Find at gen).
export function trackFindForChallenge(
  challenge: ActiveChallenge | null,
  found: Player,
): ActiveChallenge | null {
  if (!challenge) return challenge;
  if (challenge.defId === 'find_a_gem') {
    if (QUALITY_RANK[found.qualityTier] >= QUALITY_RANK.elite) {
      const meta = { ...(challenge.meta ?? {}) };
      const k = found.qualityTier;
      const findsByQuality = { ...(meta.findsByQuality ?? {}) };
      findsByQuality[k] = (findsByQuality[k] ?? 0) + 1;
      meta.findsByQuality = findsByQuality;
      const eliteCount = (findsByQuality.elite ?? 0) + (findsByQuality.generational ?? 0);
      return { ...challenge, progress: eliteCount, meta };
    }
  }
  if (challenge.defId === 'generational_find') {
    if (found.qualityTier === 'generational') {
      return { ...challenge, progress: 1 };
    }
  }
  return challenge;
}

// Per-turn ratchets: scout count minimum, weekly wage cap, develop trackers,
// cash-state trackers (net profit / modest growth / cash above / rep above
// / roster size / develop-a-star).
export function tickChallengePerTurn(state: GameState): ActiveChallenge | null {
  const ch = state.currentChallenge;
  if (!ch) return ch;
  const meta = { ...(ch.meta ?? {}) };
  let progress = ch.progress;

  switch (ch.defId) {
    case 'tighten_belt':
    case 'empire_building':
      progress = state.cash;
      break;
    case 'modest_growth':
    case 'net_profit_1m':
    case 'net_profit_5m':
    case 'net_profit_10m':
      progress = state.cash - (meta.cashAtYearStart ?? 0);
      break;
    case 'reputation_70': {
      progress = computeReputation(state);
      break;
    }
    case 'build_roster':
      progress = state.roster.length;
      break;
    case 'develop_a_star': {
      const reached = state.roster.some((p) => averageCurrent(p) >= ch.target);
      meta.starReached = reached || meta.starReached;
      progress = meta.starReached ? ch.target : 0;
      break;
    }
    case 'develop_talent': {
      // Compare current avg vs the snapshot we took at year start. Best
      // gain seen across any roster player drives progress.
      const snap = meta.yearStartCurrentByPlayerId ?? {};
      let best = meta.bestDevGainThisYear ?? 0;
      for (const p of state.roster) {
        const start = snap[p.id];
        if (start == null) continue;
        const gain = averageCurrent(p) - start;
        if (gain > best) best = gain;
      }
      meta.bestDevGainThisYear = best;
      progress = best;
      break;
    }
    case 'scout_investment': {
      meta.minScoutCountObserved = Math.min(
        meta.minScoutCountObserved ?? Number.POSITIVE_INFINITY,
        state.scouts.length,
      );
      // Progress = "is the floor still ≥ target?"; surface as 1 / target = good.
      progress = Number.isFinite(meta.minScoutCountObserved ?? Infinity)
        ? meta.minScoutCountObserved!
        : ch.target;
      break;
    }
    case 'wage_cap': {
      const stipendsW = state.roster.reduce(
        (s, p) => s + Math.round(calculateStipend(p, state.currentYear) / WEEKS_PER_MONTH),
        0,
      );
      const scoutsW = state.scouts.reduce(
        (s, sc) => s + Math.round(sc.monthlySalary / WEEKS_PER_MONTH),
        0,
      );
      const total = stipendsW + scoutsW;
      meta.maxWeeklyWageObserved = Math.max(meta.maxWeeklyWageObserved ?? 0, total);
      progress = total;
      break;
    }
    case 'scout_strike':
      // No-hire challenge — passes if scoutHiresThisYear stays 0. Progress
      // surfaces as the running count so the UI shows the threat clearly.
      progress = meta.scoutHiresThisYear ?? 0;
      break;
    case 'survive_strike':
      progress = meta.scoutHiresThisYear ?? 0;
      break;
    case 'facility_upgrade':
      progress = meta.facilityUpgradesThisYear ?? 0;
      break;
    default:
      break;
  }

  return { ...ch, progress, meta };
}
