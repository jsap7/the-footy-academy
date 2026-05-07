const ITEMS = [
  ['€100k', 'starting cash'],
  ['38', 'outfield stats per player'],
  ['12', 'traits in the library'],
  ['20', 'real-named clubs'],
  ['5', 'facility tiers'],
  ['~20', 'achievements'],
  ['4', 'difficulty tiers per board challenge'],
  ['96 weeks', 'until veteran status'],
  ['€50M', 'long-term cash goal'],
  ['1.0× → 1.5×', 'facility dev multipliers'],
  ['weekly', 'turn cadence'],
  ['+3% / yr', 'inflation on costs'],
];

function Item({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-center gap-2 px-6 text-[11px] uppercase tracking-[0.10em]">
      <span className="text-accent-bright tabular-nums">{value}</span>
      <span className="text-ink-mid">{label}</span>
      <span className="text-ink-faint" aria-hidden>
        ·
      </span>
    </span>
  );
}

export default function Ticker() {
  // Render the strip twice in the same track for a seamless loop.
  return (
    <div className="overflow-hidden border-y border-hairline bg-bg-elev/40 py-2">
      <div className="ticker-track">
        {[...ITEMS, ...ITEMS].map(([v, l], i) => (
          <Item key={i} value={v} label={l} />
        ))}
      </div>
    </div>
  );
}
