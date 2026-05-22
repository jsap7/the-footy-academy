import type { StatGroup, StatKey } from './stats';

export type TraitId = string;

export type TraitCategory = 'positive' | 'negative' | 'neutral';

// `target` decides whether the delta applies to the player's current stats,
// their potential, or both. Defaults to 'both' for backwards compatibility
// with traits authored before quality tiers shipped.
export type BaseStatEffect = {
  stat: StatKey;
  delta: number;
  target?: 'both' | 'current' | 'potential';
};

export type DevRateEffect = {
  target: StatKey | StatGroup | 'all';
  multiplier: number;
};

export type Trait = {
  id: TraitId;
  name: string;
  description: string;
  category: TraitCategory;
  baseEffects: BaseStatEffect[];
  devRateEffects: DevRateEffect[];
};
