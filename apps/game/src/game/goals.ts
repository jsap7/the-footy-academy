import { computeReputation } from './reputation';
import { averageCurrent, averagePotential } from './playerStats';
import type { GameState, Player } from '../types';

export type GoalProgress = {
  current: number;
  target: number;
  // 0..1 fraction
  fraction: number;
  // Optional pretty label that overrides the default current/target render
  label?: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  computeProgress: (state: GameState) => GoalProgress;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

function bestPercentOfPotential(roster: readonly Player[]): { player?: Player; pct: number } {
  let best: Player | undefined;
  let bestPct = 0;
  for (const p of roster) {
    const pot = averagePotential(p);
    if (pot <= 0) continue;
    const pct = averageCurrent(p) / pot;
    if (pct > bestPct) {
      bestPct = pct;
      best = p;
    }
  }
  return { player: best, pct: bestPct };
}

function generationalSalesCount(state: GameState): number {
  // Approximate: any sale ≥ €30M is almost certainly generational
  return (state.completedSales ?? []).filter((s) => s.amount >= 30_000_000).length;
}

export const LONG_TERM_GOALS: readonly Goal[] = [
  {
    id: 'tier_5_facility',
    title: 'Build a Tier 5 Facility',
    description: 'Reach the World-Class facility tier',
    computeProgress: (state) => {
      const tier = state.facilityTier;
      return {
        current: tier,
        target: 5,
        fraction: clamp01(tier / 5),
        label: `tier ${tier} / 5`,
      };
    },
  },
  {
    id: 'cash_50m',
    title: 'Reach €50M Cash',
    description: 'Build a war chest of €50 million',
    computeProgress: (state) => ({
      current: Math.max(0, state.cash),
      target: 50_000_000,
      fraction: clamp01(state.cash / 50_000_000),
    }),
  },
  {
    id: 'sell_5_generational',
    title: 'Sell 5 Generational Players',
    description: 'Cash out on five generational talents',
    computeProgress: (state) => {
      const count = generationalSalesCount(state);
      return {
        current: count,
        target: 5,
        fraction: clamp01(count / 5),
        label: `${count} / 5`,
      };
    },
  },
  {
    id: 'reputation_80',
    title: 'Reach Reputation 80',
    description: 'Climb to World-Class status',
    computeProgress: (state) => {
      const rep = computeReputation(state);
      return {
        current: rep,
        target: 80,
        fraction: clamp01(rep / 80),
        label: `${rep} / 80`,
      };
    },
  },
  {
    id: 'develop_to_potential',
    title: 'Develop a Player to Full Potential',
    description: 'Hit 95% of avg potential on any roster player',
    computeProgress: (state) => {
      const { player, pct } = bestPercentOfPotential(state.roster);
      const pctOfTarget = pct / 0.95;
      return {
        current: Math.round(pct * 100),
        target: 95,
        fraction: clamp01(pctOfTarget),
        label: player
          ? `best ${Math.round(pct * 100)}% (${player.firstName} ${player.lastName})`
          : `best 0%`,
      };
    },
  },
];
