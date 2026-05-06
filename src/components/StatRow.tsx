type Props = {
  label: string;
  current: number;
  potential: number;
};

const DOTTED_TRACK =
  'repeating-linear-gradient(to right, var(--color-ink-faint) 0 2px, transparent 2px 4px)';

export default function StatRow({ label, current, potential }: Props) {
  const maxed = current >= potential;
  return (
    <div className="grid grid-cols-[130px_1fr_28px_28px] items-center gap-3 py-1 text-[19px] leading-none">
      <span className="truncate text-ink-mid">{label}</span>
      <div
        className="relative h-[10px] w-full"
        style={{ backgroundImage: DOTTED_TRACK }}
        aria-hidden
      >
        <div
          className={`absolute inset-y-0 left-0 ${maxed ? 'bg-good' : 'bg-accent'}`}
          style={{ width: `${current}%` }}
        />
        <div
          className="absolute -top-[2px] -bottom-[2px] w-[2px] bg-ink-mid"
          style={{ left: `calc(${potential}% - 1px)` }}
        />
      </div>
      <span className="text-right tabular-nums text-ink">{current}</span>
      <span className="text-right tabular-nums text-ink-dim">{potential}</span>
    </div>
  );
}
