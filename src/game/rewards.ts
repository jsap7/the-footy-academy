// Phase 6 — reward draw + application.
//
// On year-end success the user picks one of three randomly-drawn rewards.
// Cash + one-year buffs are common; permanent buffs are uncommon; mega
// cash and the challenge-skip token are rare.

import { addPermanentBuff, addYearlyBuff } from './buffs';
import { appendTransaction } from './transactions';
import type {
  GameState,
  PermanentBuffId,
  RewardId,
  RewardOffer,
  YearlyBuffId,
} from '../types';

type WeightedReward = {
  reward: RewardOffer;
  weight: number;
};

const PERM_REWARDS: { id: PermanentBuffId; title: string; description: string }[] = [
  {
    id: 'mv_plus_5',
    title: 'Better Networking',
    description: '+5% market value on all sales (permanent)',
  },
  {
    id: 'dev_rate_plus_5',
    title: 'Veteran Coach Hired',
    description: '+5% development rate (permanent)',
  },
  {
    id: 'operating_minus_10',
    title: 'Established Brand',
    description: '-10% operating costs (permanent)',
  },
  {
    id: 'income_plus_1m',
    title: 'Investor Found',
    description: '+€1M/week base income (permanent)',
  },
];

const YEARLY_REWARDS: { id: YearlyBuffId; title: string; description: string }[] = [
  {
    id: 'all_scout_levels',
    title: 'All Scout Levels Available',
    description: 'This year only: scout market ignores facility gating',
  },
  {
    id: 'offer_2x_frequency',
    title: '2× Offer Frequency',
    description: 'This year only: clubs bid twice as often',
  },
  {
    id: 'free_facility_upgrade',
    title: 'Free Facility Upgrade',
    description: 'This year only: upgrade one facility tier at no cost',
  },
  {
    id: 'reputation_plus_20',
    title: 'Reputation +20',
    description: 'This year only: temporary +20 to academy reputation',
  },
];

const REWARD_POOL: WeightedReward[] = [
  // Cash rewards — common, scaled.
  {
    reward: { id: 'cash_500k', title: '€500k Bonus', description: 'A small windfall', flavor: 'cash' },
    weight: 18,
  },
  {
    reward: { id: 'cash_2m', title: '€2M Bonus', description: 'A solid payday', flavor: 'cash' },
    weight: 12,
  },
  {
    reward: { id: 'cash_8m', title: '€8M Bonus', description: 'A serious cash injection', flavor: 'cash' },
    weight: 4,
  },
  {
    reward: {
      id: 'cash_25m',
      title: '€25M Bonus',
      description: 'Generational windfall — extremely rare',
      flavor: 'cash',
    },
    weight: 1,
  },
  // Permanent buffs — rarer.
  ...PERM_REWARDS.map((r) => ({
    reward: { id: r.id, title: r.title, description: r.description, flavor: 'permanent' as const },
    weight: 4,
  })),
  // Yearly buffs — common.
  ...YEARLY_REWARDS.map((r) => ({
    reward: { id: r.id, title: r.title, description: r.description, flavor: 'yearly' as const },
    weight: 8,
  })),
  // Token — quite rare.
  {
    reward: {
      id: 'token_challenge_skip',
      title: 'Save the Date',
      description: "Skip next year's challenge requirement (still need to not go broke)",
      flavor: 'token',
    },
    weight: 2,
  },
];

const REWARD_DRAW_COUNT = 3;

// Draw N distinct rewards weighted by REWARD_POOL. Pure: relies on
// Math.random and returns the chosen RewardOffers.
export function drawRewardOptions(): RewardOffer[] {
  const remaining = REWARD_POOL.map((r) => ({ ...r }));
  const out: RewardOffer[] = [];
  for (let i = 0; i < REWARD_DRAW_COUNT; i++) {
    const total = remaining.reduce((s, r) => s + r.weight, 0);
    if (total <= 0) break;
    let pick = Math.random() * total;
    let chosenIdx = 0;
    for (let j = 0; j < remaining.length; j++) {
      pick -= remaining[j].weight;
      if (pick <= 0) {
        chosenIdx = j;
        break;
      }
    }
    out.push(remaining[chosenIdx].reward);
    // Don't draw the same reward twice in one offer.
    remaining.splice(chosenIdx, 1);
  }
  return out;
}

const CASH_AMOUNT_BY_ID: Record<string, number> = {
  cash_500k: 500_000,
  cash_2m: 2_000_000,
  cash_8m: 8_000_000,
  cash_25m: 25_000_000,
};

// Apply the picked reward to the state. Returns a new GameState. Caller is
// responsible for clearing pendingRewardOptions afterwards.
export function applyReward(state: GameState, rewardId: RewardId): GameState {
  if (rewardId in CASH_AMOUNT_BY_ID) {
    const amount = CASH_AMOUNT_BY_ID[rewardId];
    return {
      ...state,
      cash: state.cash + amount,
      transactions: appendTransaction(state, {
        type: 'sponsorship', // closest reused TransactionType — surfaces as positive income
        description: `Reward — ${rewardId.replace('cash_', '€').toUpperCase()} bonus`,
        amount,
      }),
    };
  }
  if (rewardId === 'token_challenge_skip') {
    return {
      ...state,
      tokens: { ...state.tokens, challengeSkip: (state.tokens?.challengeSkip ?? 0) + 1 },
    };
  }
  // Permanent buff?
  const isPerm = PERM_REWARDS.some((r) => r.id === rewardId);
  if (isPerm) {
    return addPermanentBuff(state, rewardId as PermanentBuffId, state.currentYear);
  }
  const isYearly = YEARLY_REWARDS.some((r) => r.id === rewardId);
  if (isYearly) {
    return addYearlyBuff(state, rewardId as YearlyBuffId, state.currentYear);
  }
  return state;
}
