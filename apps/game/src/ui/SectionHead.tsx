import type { ReactNode } from 'react';

type Props = {
  label: string;
  count?: number;
  right?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export default function SectionHead({ label, count, right, meta, className = '' }: Props) {
  return (
    <div className={`flex items-baseline justify-between gap-3 px-1 py-1 ${className}`}>
      <div className="flex items-baseline gap-3">
        <h2 className="text-[16px] uppercase tracking-[0.08em] text-ink">{label}</h2>
        {count !== undefined ? (
          <span className="text-[12px] tabular-nums text-ink-dim">{count}</span>
        ) : null}
        {meta ? (
          <span className="text-[11px] uppercase tracking-[0.10em] text-ink-dim">{meta}</span>
        ) : null}
      </div>
      {right}
    </div>
  );
}
