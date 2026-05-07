import { ALL_STAT_KEYS, type Offer, type Player, type PlayerStats } from '../types';

export function averageStat(stats: PlayerStats): number {
  let sum = 0;
  for (const key of ALL_STAT_KEYS) sum += stats[key];
  return Math.round(sum / ALL_STAT_KEYS.length);
}

export function averageCurrent(player: Player): number {
  return averageStat(player.stats.current);
}

export function averagePotential(player: Player): number {
  return averageStat(player.stats.potential);
}

const ACTIVE_OFFER_STATUSES: ReadonlySet<Offer['status']> = new Set(['pending', 'countered']);

// Bucket pending/countered offers by playerId once per render so the roster
// list doesn't re-scan all offers per row.
export function buildPendingOffersIndex(offers: readonly Offer[]): Map<string, Offer[]> {
  const index = new Map<string, Offer[]>();
  for (const offer of offers) {
    if (!ACTIVE_OFFER_STATUSES.has(offer.status)) continue;
    const bucket = index.get(offer.playerId);
    if (bucket) {
      bucket.push(offer);
    } else {
      index.set(offer.playerId, [offer]);
    }
  }
  return index;
}

export function highestOfferAmount(offers: readonly Offer[]): number {
  let best = 0;
  for (const o of offers) if (o.amount > best) best = o.amount;
  return best;
}
