import { generateScout } from './scoutGenerator';
import type { Scout } from '../types/scout';

export const SCOUT_MARKET_SIZE = 5;

export function generateScoutMarket(): Scout[] {
  const market: Scout[] = [];
  for (let i = 0; i < SCOUT_MARKET_SIZE; i++) {
    market.push(generateScout());
  }
  return market;
}
