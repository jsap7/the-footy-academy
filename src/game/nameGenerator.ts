import firstNames from '../data/names/english-first-names.json';
import lastNames from '../data/names/english-last-names.json';

const FIRST_NAMES: readonly string[] = firstNames;
const LAST_NAMES: readonly string[] = lastNames;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateEnglishName(): { firstName: string; lastName: string } {
  return {
    firstName: pickRandom(FIRST_NAMES),
    lastName: pickRandom(LAST_NAMES),
  };
}
