type Props = {
  label: string;
  current: number;
  potential: number;
};

export default function StatRow({ label, current, potential }: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_auto_minmax(0,1.6fr)] items-center gap-3 py-1 text-sm">
      <span className="truncate text-neutral-300">{label}</span>
      <span className="whitespace-nowrap text-right font-mono tabular-nums">
        <span className="text-neutral-50">{current}</span>
        <span className="text-neutral-600"> / </span>
        <span className="text-neutral-500">{potential}</span>
      </span>
      <div className="relative h-1.5 w-full overflow-hidden rounded bg-neutral-800">
        <div
          className="absolute inset-y-0 left-0 bg-neutral-600"
          style={{ width: `${potential}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 bg-neutral-100"
          style={{ width: `${current}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
