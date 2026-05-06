import { computeMarketValue } from './marketValue';
import { projectMVAtAges } from './projection';
import type { GameState, Offer, Player } from '../types';

export type RecommendationKind = 'sell_now' | 'consider_selling' | 'hold' | 'no_offers_yet';

export type Recommendation = {
  kind: RecommendationKind;
  headline: string;
  reasoning: string[];
};

const KIND_HEADLINES: Record<RecommendationKind, string> = {
  sell_now: 'sell now',
  consider_selling: 'consider selling',
  hold: 'hold for now',
  no_offers_yet: 'no offers yet',
};

function bestActiveOfferAmount(offers: readonly Offer[], playerId: string): number {
  let best = 0;
  for (const o of offers) {
    if (o.playerId !== playerId) continue;
    if (o.status !== 'pending' && o.status !== 'countered') continue;
    if (o.amount > best) best = o.amount;
  }
  return best;
}

function mvTrend(player: Player): 'rising' | 'flat' | 'falling' | 'unknown' {
  const history = player.mvHistory ?? [];
  if (history.length < 3) return 'unknown';
  const first = history[0].mv;
  const last = history[history.length - 1].mv;
  if (last > first * 1.05) return 'rising';
  if (last < first * 0.95) return 'falling';
  return 'flat';
}

export function getSellRecommendation(
  player: Player,
  state: GameState,
  developmentMultiplier = 1.0,
): Recommendation {
  const mv = computeMarketValue(player);
  const bestOffer = bestActiveOfferAmount(state.pendingOffers, player.id);
  const trend = mvTrend(player);
  const projections = projectMVAtAges(player, [17, 18, 19], developmentMultiplier);
  const peakProjection = projections.reduce((mx, p) => (p.mv > mx ? p.mv : mx), 0);

  // Under-16 are not sellable at all — keep developing.
  if (player.age < 16) {
    const reasoning: string[] = [`age ${player.age} — locked under 16 (cannot sell)`];
    if (peakProjection > 0 && peakProjection > mv) {
      const mult = (peakProjection / Math.max(1, mv)).toFixed(1);
      reasoning.push(`projected peak ${mult}× current value`);
    }
    if (trend === 'rising') reasoning.push('mv rising over recent months');
    return { kind: 'hold', headline: KIND_HEADLINES.hold, reasoning };
  }

  // No active offer — can't recommend selling without one.
  if (bestOffer <= 0) {
    const reasoning: string[] = ['no active offers right now'];
    if (player.age >= 19) reasoning.push(`age ${player.age} — past peak resale window`);
    else if (player.age >= 17) reasoning.push(`age ${player.age} — in peak resale window`);
    if (peakProjection > mv * 1.2 && player.age <= 17) {
      const mult = (peakProjection / Math.max(1, mv)).toFixed(1);
      reasoning.push(`projected peak ${mult}× current value — keep developing`);
    }
    return { kind: 'no_offers_yet', headline: KIND_HEADLINES.no_offers_yet, reasoning };
  }

  const offerVsMV = bestOffer / Math.max(1, mv);
  const reasoning: string[] = [];

  // SELL_NOW conditions
  if (player.age >= 21) {
    reasoning.push(`age ${player.age} — releases at 22, sell while you can`);
    reasoning.push(`best offer ${formatPctOfMv(offerVsMV)} of market value`);
    return { kind: 'sell_now', headline: KIND_HEADLINES.sell_now, reasoning };
  }
  if (offerVsMV >= 1.1) {
    reasoning.push(`best offer is ${formatPctOfMv(offerVsMV)} — over the asking range`);
    reasoning.push('clubs rarely overpay; take it');
    return { kind: 'sell_now', headline: KIND_HEADLINES.sell_now, reasoning };
  }
  if (player.age >= 19 && offerVsMV >= 0.95) {
    reasoning.push(`age ${player.age} — depreciation accelerating`);
    reasoning.push(`best offer ${formatPctOfMv(offerVsMV)} of market value`);
    if (trend === 'falling') reasoning.push('mv trending down');
    return { kind: 'sell_now', headline: KIND_HEADLINES.sell_now, reasoning };
  }

  // CONSIDER conditions
  if (player.age >= 17 && offerVsMV >= 0.9) {
    reasoning.push(`age ${player.age} — in peak resale window`);
    reasoning.push(`best offer ${formatPctOfMv(offerVsMV)} of market value`);
    if (trend === 'flat' || trend === 'falling') reasoning.push(`mv ${trend} over recent months`);
    return { kind: 'consider_selling', headline: KIND_HEADLINES.consider_selling, reasoning };
  }
  if (trend === 'flat' && player.age >= 18) {
    reasoning.push(`mv has plateaued — peak likely reached`);
    reasoning.push(`best offer ${formatPctOfMv(offerVsMV)} of market value`);
    return { kind: 'consider_selling', headline: KIND_HEADLINES.consider_selling, reasoning };
  }

  // Default: HOLD
  reasoning.push(`age ${player.age} — still developing`);
  if (peakProjection > mv * 1.3) {
    const mult = (peakProjection / Math.max(1, mv)).toFixed(1);
    reasoning.push(`projected peak ${mult}× current value`);
  }
  if (offerVsMV < 0.9) {
    reasoning.push(`best offer ${formatPctOfMv(offerVsMV)} of market value — undersold`);
  } else {
    reasoning.push(`best offer ${formatPctOfMv(offerVsMV)} of market value`);
  }
  if (trend === 'rising') reasoning.push('mv trending up');
  return { kind: 'hold', headline: KIND_HEADLINES.hold, reasoning };
}

function formatPctOfMv(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
