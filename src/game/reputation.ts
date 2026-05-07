import { countUnlocked } from './achievements';
import { runReputationBonus } from './buffs';
import type { GameState } from '../types';

export type ReputationBreakdown = {
  total: number; // 0-100
  fromSales: number;
  fromYears: number;
  fromAchievements: number;
  fromFacility: number;
  label: string;
};

const STARTING_YEAR = 2026;

function reputationLabel(rep: number): string {
  if (rep < 10) return 'Unknown Academy';
  if (rep < 25) return 'Local Curiosity';
  if (rep < 40) return 'Regional Player';
  if (rep < 55) return 'Continental Reputation';
  if (rep < 70) return 'European Notable';
  if (rep < 85) return 'World-Class';
  return 'Legendary';
}

export function computeReputationBreakdown(state: GameState): ReputationBreakdown {
  const totalSalesValue = (state.completedSales ?? []).reduce((sum, s) => sum + s.amount, 0);
  const fromSales = Math.min(30, totalSalesValue / 5_000_000);
  const yearsOperating = Math.max(0, state.currentYear - STARTING_YEAR);
  const fromYears = Math.min(20, yearsOperating * 2);
  const fromAchievements = Math.min(30, countUnlocked(state.achievements) * 1.5);
  const fromFacility = (state.facilityTier - 1) * 5;
  const yearlyRepBoost = runReputationBonus(state);
  const total = Math.min(
    100,
    Math.round(fromSales + fromYears + fromAchievements + fromFacility) + yearlyRepBoost,
  );
  return {
    total,
    fromSales: Math.round(fromSales * 10) / 10,
    fromYears,
    fromAchievements: Math.round(fromAchievements * 10) / 10,
    fromFacility,
    label: reputationLabel(total),
  };
}

export function computeReputation(state: GameState): number {
  return computeReputationBreakdown(state).total;
}
