type Props = {
  label: string;
  current: number;
  potential: number;
  gain?: number;
};

const DOTTED_TRACK =
  'repeating-linear-gradient(to right, var(--color-ink-faint) 0 2px, transparent 2px 4px)';

export default function StatRow({ label, current, potential, gain }: Props) {
  const maxed = current >= potential;
  const justGained = gain != null && gain > 0;
  return (
    <div className="grid grid-cols-[140px_1fr_32px_32px] items-center gap-4 py-1.5 text-[13px] leading-none">
      <span className="truncate text-ink-mid">{label}</span>
      <div
        className="relative h-[6px] w-full rounded-[2px] overflow-hidden"
        style={{ backgroundImage: DOTTED_TRACK }}
        aria-hidden
      >
        <div
          className={`absolute inset-y-0 left-0 transition-[width] duration-300 ease-out ${maxed ? 'bg-accent-bright' : 'bg-accent'}`}
          style={{ width: `${current}%` }}
        />
        <div
          className="absolute -top-[2px] -bottom-[2px] w-[2px] bg-ink-mid"
          style={{ left: `calc(${potential}% - 1px)` }}
        />
      </div>
      <span
        // Re-keying on (current, gain) restarts the flash animation when the
        // value changes. Inline-block + rounded so the bg flash is visible.
        key={`v-${current}-${gain ?? 0}`}
        className={`relative text-right tabular-nums text-ink inline-block rounded-[2px] px-1 ${
          justGained ? 'animate-stat-flash' : ''
        }`}
      >
        {current}
        {justGained ? (
          <span
            key={`g-${current}-${gain}`}
            className="animate-stat-gain absolute -top-[10px] right-0 text-[9px] tabular-nums text-accent-bright"
          >
            +{gain}
          </span>
        ) : null}
      </span>
      <span className="text-right tabular-nums text-ink-dim">{potential}</span>
    </div>
  );
}
