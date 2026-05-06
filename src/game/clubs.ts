import { CLUB_LIBRARY } from '../data/clubs/library';
import type { Club, ClubTier } from '../types';

export function getAllClubs(): readonly Club[] {
  return CLUB_LIBRARY;
}

export function getClubsByTier(tier: ClubTier): Club[] {
  return CLUB_LIBRARY.filter((c) => c.tier === tier);
}

export function getClubById(id: string): Club | undefined {
  return CLUB_LIBRARY.find((c) => c.id === id);
}
