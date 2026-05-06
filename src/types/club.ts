export type ClubTier = 1 | 2 | 3 | 4 | 5;

export type Club = {
  id: string; // slug
  name: string;
  shortName: string;
  country: string;
  tier: ClubTier;
  wealthCeiling: number;
};

export const TIER_WEALTH: Record<ClubTier, number> = {
  1: 150_000_000,
  2: 50_000_000,
  3: 12_000_000,
  4: 4_000_000,
  5: 800_000,
};
