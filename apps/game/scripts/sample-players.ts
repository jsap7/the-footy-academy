// One-off script to generate sample players for inspection.
// Usage: npx tsx scripts/sample-players.ts [count]

import { generatePlayer } from '../src/game/playerGenerator';
import { ALL_STAT_KEYS } from '../src/types';
import type { Player, PlayerStats } from '../src/types';

const count = Number(process.argv[2] ?? 50);

function avg(stats: PlayerStats): number {
  let sum = 0;
  for (const key of ALL_STAT_KEYS) sum += stats[key];
  return Math.round(sum / ALL_STAT_KEYS.length);
}

function summarize(p: Player): string {
  const c = avg(p.stats.current);
  const pot = avg(p.stats.potential);
  const name = `${p.firstName} ${p.lastName}`;
  return `${name.padEnd(28)} age ${p.age}  ${p.position.padEnd(3)}  cur ${String(c).padStart(2)}  pot ${String(pot).padStart(2)}  gap ${String(pot - c).padStart(2)}`;
}

const players: Player[] = [];
for (let i = 0; i < count; i++) players.push(generatePlayer());

for (const p of players) console.log(summarize(p));

const allCur = players.map((p) => avg(p.stats.current));
const allPot = players.map((p) => avg(p.stats.potential));
const overallAvg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

console.log('---');
console.log(`n=${players.length}`);
console.log(
  `mean cur=${overallAvg(allCur)}  mean pot=${overallAvg(allPot)}  cur range=${Math.min(...allCur)}-${Math.max(...allCur)}  pot range=${Math.min(...allPot)}-${Math.max(...allPot)}`,
);

const byPosition = new Map<string, number>();
for (const p of players) byPosition.set(p.position, (byPosition.get(p.position) ?? 0) + 1);
console.log(
  'positions: ' +
    Array.from(byPosition.entries())
      .sort()
      .map(([pos, n]) => `${pos}:${n}`)
      .join('  '),
);

const ageBuckets = new Map<number, number>();
for (const p of players) ageBuckets.set(p.age, (ageBuckets.get(p.age) ?? 0) + 1);
console.log(
  'ages: ' +
    Array.from(ageBuckets.entries())
      .sort()
      .map(([age, n]) => `${age}:${n}`)
      .join('  '),
);
