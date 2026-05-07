import type { FacilityTier } from './facility';

export type FacilityWarningEvent = {
  type: 'warning';
  fromTier: FacilityTier;
};

export type FacilityDowngradeEvent = {
  type: 'auto-downgrade';
  fromTier: FacilityTier;
  toTier: FacilityTier;
};

export type FacilityScoutFiredEvent = {
  scoutId: string;
  scoutName: string;
  scoutLevel: number;
};
