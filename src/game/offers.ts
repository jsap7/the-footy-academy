import { computeBuyerPerceivedValue } from './marketValue';
import type { Club, ClubTier, GameState, Offer, Player, QualityTier, SaleEvent } from '../types';

export const OFFER_LIFESPAN_TURNS = 3;

// FIFA-style: international transfers locked for under-16s. We surface this
// as a hard rule in offer generation + the selling UI so the user makes a
// real commitment when signing a young kid.
export const MINIMUM_TRANSFER_AGE = 16;

const VISIBLE_QUALITY_BY_TIER: Record<QualityTier, number> = {
  mid: 0.05,
  good: 0.2,
  great: 0.5,
  elite: 0.8,
  generational: 1.0,
};

const OFFER_AGE_MULTIPLIER: Record<number, number> = {
  12: 0.05,
  13: 0.1,
  14: 0.2,
  15: 0.4,
  16: 0.7,
  17: 0.9,
  18: 0.85,
  19: 0.6,
  20: 0.3,
  21: 0.15,
};

// Probability that clubs of each tier bid on a player of the given tier.
const TIER_AFFINITY: Record<QualityTier, Record<ClubTier, number>> = {
  generational: { 1: 0.7, 2: 0.2, 3: 0.07, 4: 0.02, 5: 0.01 },
  elite: { 1: 0.4, 2: 0.4, 3: 0.15, 4: 0.04, 5: 0.01 },
  great: { 1: 0.1, 2: 0.3, 3: 0.4, 4: 0.15, 5: 0.05 },
  good: { 1: 0.02, 2: 0.1, 3: 0.3, 4: 0.4, 5: 0.18 },
  mid: { 1: 0.0, 2: 0.02, 3: 0.1, 4: 0.4, 5: 0.48 },
};

const ASKING_PRICE_BOOST = 1.3; // listing a player nudges offer chance up
const AVAILABLE_FOR_SALE_BOOST = 2.0;
const MAX_OFFER_CHANCE = 0.95;

function computeVisibleQualityScore(player: Player): number {
  return VISIBLE_QUALITY_BY_TIER[player.qualityTier];
}

function computeOfferChance(player: Player): number {
  const visible = computeVisibleQualityScore(player);
  const ageMult = OFFER_AGE_MULTIPLIER[player.age] ?? 0;
  const availMult = player.availableForSale ? AVAILABLE_FOR_SALE_BOOST : 1.0;
  const listedMult = player.askingPrice != null ? ASKING_PRICE_BOOST : 1.0;
  return Math.min(MAX_OFFER_CHANCE, visible * ageMult * availMult * listedMult);
}

function pickClubForPlayer(player: Player, clubs: readonly Club[]): Club | undefined {
  const tierWeights = TIER_AFFINITY[player.qualityTier];
  const r = Math.random();
  let cumulative = 0;
  for (const tier of [1, 2, 3, 4, 5] as ClubTier[]) {
    cumulative += tierWeights[tier];
    if (r >= cumulative) continue;
    const tierClubs = clubs.filter((c) => c.tier === tier);
    if (tierClubs.length === 0) continue;
    return tierClubs[Math.floor(Math.random() * tierClubs.length)];
  }
  return undefined;
}

// Generate at most ONE new offer per roster player per turn. Already-pending
// offers don't block new ones — multiple clubs can bid in the same window.
export function generateOffersForTurn(state: GameState): Offer[] {
  const newOffers: Offer[] = [];
  for (const player of state.roster) {
    if (player.age < MINIMUM_TRANSFER_AGE) continue;
    if (player.blockOffers) continue;
    const chance = computeOfferChance(player);
    if (chance <= 0) continue;
    if (Math.random() >= chance) continue;
    const club = pickClubForPlayer(player, state.clubs);
    if (!club) continue;

    const perceived = computeBuyerPerceivedValue(player, club);
    let amount = perceived;
    let status: 'pending' | 'accepted' = 'pending';

    if (player.askingPrice != null) {
      const ask = player.askingPrice;
      if (ask <= perceived * 0.95) {
        // Asking is a steal — club accepts at asking, no negotiation.
        amount = ask;
        status = 'accepted';
      } else if (ask <= perceived * 1.1) {
        // Reasonable — club bids their perceived value.
        amount = perceived;
      } else if (ask <= perceived * 1.3) {
        // Pricey but tempted — club stretches a little above their read.
        amount = Math.round(perceived * 1.05);
      } else {
        // Too expensive — club doesn't bid this turn.
        continue;
      }
    }

    const offer: Offer = {
      id: crypto.randomUUID(),
      playerId: player.id,
      clubId: club.id,
      amount,
      status,
      turnsRemaining: OFFER_LIFESPAN_TURNS,
      createdMonth: state.currentMonth,
      createdYear: state.currentYear,
      buyerPerceivedValue: perceived,
    };
    newOffers.push(offer);
  }
  return newOffers;
}

// Run once per turn before generating new offers. Resolves any 'countered'
// offers based on whether your counter is within the club's tolerance.
export function processCounterResponses(offers: readonly Offer[]): Offer[] {
  return offers.map((offer) => {
    if (offer.status !== 'countered' || offer.yourCounter == null) return offer;
    const perceived = offer.buyerPerceivedValue;
    const counter = offer.yourCounter;

    if (counter <= perceived * 1.05) {
      // Within the club's noise band — they accept.
      return { ...offer, amount: counter, status: 'accepted' as const };
    }
    if (counter <= perceived * 1.2) {
      // Stretch territory — 50% counter back at midpoint, 50% walk.
      if (Math.random() < 0.5) {
        const midpoint = Math.round((perceived + counter) / 2);
        return {
          ...offer,
          amount: midpoint,
          yourCounter: undefined,
          status: 'pending' as const,
          turnsRemaining: OFFER_LIFESPAN_TURNS,
        };
      }
      return { ...offer, status: 'walked' as const };
    }
    // Out of range — club walks immediately.
    return { ...offer, status: 'walked' as const };
  });
}

// Drop pending/countered offers that aged out. Walked/rejected offers stay
// for one more tick so the user sees what happened, then are dropped.
export function tickOfferLifespans(offers: readonly Offer[]): Offer[] {
  return offers
    .map((offer) => {
      if (offer.status === 'pending' || offer.status === 'countered') {
        const turnsRemaining = offer.turnsRemaining - 1;
        if (turnsRemaining <= 0) return { ...offer, status: 'expired' as const, turnsRemaining: 0 };
        return { ...offer, turnsRemaining };
      }
      return offer;
    })
    .filter((offer) => offer.status !== 'expired' || offer.turnsRemaining > -1)
    .filter((offer) => {
      // Walked / rejected / expired stay one more tick for the UI, then drop.
      if (offer.status === 'walked' || offer.status === 'rejected' || offer.status === 'expired') {
        return offer.turnsRemaining > -2;
      }
      return true;
    });
}

// Execute every offer that is currently 'accepted'. Pays out, removes the
// player from roster, walks competing offers, returns sale events for the UI.
export function executeAcceptedOffers(state: GameState): {
  state: GameState;
  saleEvents: SaleEvent[];
} {
  const accepted = state.pendingOffers.filter((o) => o.status === 'accepted');
  if (accepted.length === 0) return { state, saleEvents: [] };

  let cash = state.cash;
  let roster = state.roster;
  let pendingOffers = state.pendingOffers;
  const completedSales = [...state.completedSales];
  const saleEvents: SaleEvent[] = [];

  for (const offer of accepted) {
    const player = roster.find((p) => p.id === offer.playerId);
    if (!player) continue; // already gone (defensive)
    const club = state.clubs.find((c) => c.id === offer.clubId);

    cash += offer.amount;
    roster = roster.filter((p) => p.id !== offer.playerId);
    // Walk every other pending/countered offer for the same player.
    pendingOffers = pendingOffers.map((o) =>
      o.id === offer.id
        ? o
        : o.playerId === offer.playerId && (o.status === 'pending' || o.status === 'countered')
          ? { ...o, status: 'walked' as const }
          : o,
    );
    completedSales.push(offer);
    saleEvents.push({
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      clubId: offer.clubId,
      clubName: club?.name ?? 'a club',
      amount: offer.amount,
    });
  }

  // Remove the now-executed accepted offers from the active list.
  pendingOffers = pendingOffers.filter((o) => !(o.status === 'accepted'));

  return {
    state: { ...state, cash, roster, pendingOffers, completedSales },
    saleEvents,
  };
}
