import type { StatGroup, StatKey } from './stats';

export type TraitId = string;

export type TraitCategory = 'positive' | 'negative' | 'neutral';

export type BaseStatEffect = {
  stat: StatKey;
  delta: number;
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
